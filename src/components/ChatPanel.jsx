import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, F } from "../constants/colors";
import { QUICK_CHIPS } from "../constants/data";
import { GROQ_TOOLS } from "../constants/groqTools";
import { nowM, today } from "../utils/helpers";
import { execChatTool } from "../services/chatTools";
import { appendChatMessage, clearChatMessages, getOrCreateChatSession, loadChatContext, loadChatMessages, saveChatContext } from "../services/db";
import { Spinner } from "./ui";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function toMessages(msgs) {
  return msgs.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
}

function errMessage(err, fallback = "Unknown error") {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (typeof err.message === "string" && err.message.trim()) return err.message;
  try {
    return JSON.stringify(err);
  } catch (_e) {
    return fallback;
  }
}

function parseGroqLimitInfo(text = "") {
  const lower = String(text).toLowerCase();
  const isQuotaError =
    lower.includes("quota exceeded") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit_exceeded") ||
    lower.includes("too many requests");

  if (!isQuotaError) return { isQuotaError: false, retrySeconds: null };

  const retryMatch = String(text).match(/retry (?:in|after)\s+([\d.]+)\s*(ms|s|sec|seconds)?/i);
  if (!retryMatch) return { isQuotaError: true, retrySeconds: null };

  const rawDelay = Number(retryMatch[1]) || 0;
  const unit = String(retryMatch[2] || "s").toLowerCase();
  const retrySeconds = unit === "ms" ? Math.max(1, Math.ceil(rawDelay / 1000)) : Math.max(1, Math.ceil(rawDelay));
  return { isQuotaError: true, retrySeconds };
}

function parseToolArgs(rawArgs) {
  if (!rawArgs) return {};
  if (typeof rawArgs === "object") return rawArgs;
  if (typeof rawArgs !== "string") return {};

  try {
    return JSON.parse(rawArgs);
  } catch (_err) {
    return {};
  }
}

async function callGroq(apiKey, payload) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { error: { message: text || `Groq request failed with status ${response.status}.` } };
  }

  if (!response.ok || data?.error) {
    const apiError = new Error(errMessage(data?.error, `Groq request failed with status ${response.status}.`));
    apiError.status = data?.error?.status || response.status;
    throw apiError;
  }

  return data;
}

export default function ChatPanel({ apiKey, userId, expenses, budgets, categories, baseCurrency, onRefreshData }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [quotaBlockedUntil, setQuotaBlockedUntil] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const endRef = useRef(null);
  const contextRef = useRef(null);

  const greeting = useMemo(
    () => ({
      role: "assistant",
      text:
        "Hi! I am your finance chatbot.\n\nI can create, read, update, and delete expenses, compare months, check budgets, and keep context from previous messages.",
    }),
    []
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  useEffect(() => {
    let ignore = false;

    async function boot() {
      if (!userId) return;
      try {
        const session = await getOrCreateChatSession(userId);
        const [dbMsgs, ctx] = await Promise.all([loadChatMessages(session.id), loadChatContext(session.id)]);

        if (ignore) return;

        setSessionId(session.id);
        contextRef.current = ctx;

        if (!dbMsgs.length) {
          setMsgs([greeting]);
          setHistory(toMessages([greeting]));
          await appendChatMessage(session.id, "assistant", greeting.text);
        } else {
          setMsgs(dbMsgs);
          setHistory(toMessages(dbMsgs));
        }
      } catch (err) {
        if (ignore) return;
        setMsgs([
          {
            role: "assistant",
            text:
              "Chat unavailable right now.\n" +
              `Reason: ${errMessage(err)}\n\n` +
              "Please refresh once and try again.",
          },
        ]);
      }
    }

    boot();
    return () => {
      ignore = true;
    };
  }, [userId, greeting]);

  const buildSystemPrompt = useCallback(() => {
    const t = today();
    const yest = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const pending = contextRef.current?.pending_confirmation_action;

    return `You are a finance assistant for one user. Today: ${t}. Yesterday: ${yest}. Current month: ${nowM()}.
Use only tool calls for data actions. Do not invent numbers.
Base currency: ${baseCurrency}. Available categories: ${categories.map((c) => c.id).join("|")}.
Payment methods: Card|UPI|Cash|Net Banking|Transfer|Wallet.
If deleting multiple expenses, trigger delete_expense without confirm so the app can request confirmation.
If user confirms a pending action, call confirm_action.
Pending confirmation context: ${JSON.stringify(pending || null)}.
Recent expenses sample: ${JSON.stringify(expenses.slice(0, 20))}.
Recent budget sample: ${JSON.stringify(budgets.slice(0, 20))}.`;
  }, [expenses, budgets, categories, baseCurrency]);

  const persistMessage = useCallback(
    async (role, text) => {
      if (!sessionId) return;
      try {
        await appendChatMessage(sessionId, role, text);
      } catch (_err) {
        // no-op
      }
    },
    [sessionId]
  );

  const send = useCallback(
    async (text) => {
      if (!text?.trim() || loading || !sessionId) return;
      if (quotaBlockedUntil && Date.now() < quotaBlockedUntil) {
        const waitSeconds = Math.max(1, Math.ceil((quotaBlockedUntil - Date.now()) / 1000));
        const waitMsg = `Groq request limit is active for this key. Please retry in ${waitSeconds}s.`;
        setMsgs((m) => [...m, { role: "assistant", text: waitMsg }]);
        await persistMessage("assistant", waitMsg);
        return;
      }

      const userText = text.trim();
      setInput("");
      setMsgs((m) => [...m, { role: "user", text: userText }]);
      await persistMessage("user", userText);
      setLoading(true);

      if (!apiKey) {
        const msg = "Groq API key missing. Set REACT_APP_GROQ_API_KEY in your .env file and restart the app.";
        setMsgs((m) => [...m, { role: "assistant", text: msg }]);
        await persistMessage("assistant", msg);
        setLoading(false);
        return;
      }

      const newHistory = [...history, { role: "user", content: userText }];
      const systemMessage = { role: "system", content: buildSystemPrompt() };

      try {
        const d1 = await callGroq(apiKey, {
          model: GROQ_MODEL,
          messages: [systemMessage, ...newHistory],
          tools: GROQ_TOOLS,
          tool_choice: "auto",
          temperature: 0.2,
          max_tokens: 1200,
        });

        let assistantMsg = d1.choices?.[0]?.message || {};
        const toolCalls = Array.isArray(assistantMsg.tool_calls) ? assistantMsg.tool_calls : [];

        const mutating = new Set(["add_expense", "update_expense", "delete_expense", "confirm_action"]);
        let hasMutation = false;

        if (toolCalls.length > 0) {
          const toolMessages = [];

          for (const call of toolCalls) {
            const toolName = call?.function?.name;
            const toolArgs = parseToolArgs(call?.function?.arguments);

            const { result, nextContext } = await execChatTool({
              name: toolName,
              args: toolArgs,
              userId,
              sessionId,
              context: contextRef.current,
              categories,
              baseCurrency,
            });

            contextRef.current = nextContext;
            if (mutating.has(toolName)) hasMutation = true;

            toolMessages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(result || {}),
            });
          }

          const d2 = await callGroq(apiKey, {
            model: GROQ_MODEL,
            messages: [
              systemMessage,
              ...newHistory,
              { role: "assistant", content: assistantMsg.content || "", tool_calls: toolCalls },
              ...toolMessages,
            ],
            temperature: 0.2,
            max_tokens: 900,
          });

          assistantMsg = d2.choices?.[0]?.message || {};
        }

        const reply = String(assistantMsg.content || "").trim() || "Done.";
        setMsgs((m) => [...m, { role: "assistant", text: reply }]);
        await persistMessage("assistant", reply);

        setHistory([...newHistory, { role: "assistant", content: reply }]);

        if (hasMutation) {
          await onRefreshData?.();
        }
      } catch (err) {
        const rawError = errMessage(err);
        const limitInfo = parseGroqLimitInfo(rawError);
        let msg = `Error: ${rawError}`;

        if (limitInfo.isQuotaError) {
          const retrySeconds = limitInfo.retrySeconds || 30;
          setQuotaBlockedUntil(Date.now() + retrySeconds * 1000);
          msg = `Groq request limit is active for this key. Please retry in ${retrySeconds}s.`;
        }

        setMsgs((m) => [...m, { role: "assistant", text: msg }]);
        await persistMessage("assistant", msg);
      } finally {
        setLoading(false);
      }
    },
    [
      apiKey,
      loading,
      sessionId,
      quotaBlockedUntil,
      history,
      buildSystemPrompt,
      userId,
      categories,
      baseCurrency,
      persistMessage,
      onRefreshData,
    ]
  );

  const clearChat = useCallback(async () => {
    if (!sessionId || clearing) return;

    setShowClearConfirm(false);
    setClearing(true);
    try {
      await clearChatMessages(sessionId);
      await saveChatContext(sessionId, {
        last_expense_id: null,
        last_query_signature: null,
        last_result_set_ids: null,
        pending_confirmation_action: null,
      });

      contextRef.current = {
        ...(contextRef.current || {}),
        last_expense_id: null,
        last_query_signature: null,
        last_result_set_ids: null,
        pending_confirmation_action: null,
      };

      setMsgs([greeting]);
      setHistory(toMessages([greeting]));
      await appendChatMessage(sessionId, "assistant", greeting.text);
    } catch (err) {
      const msg = `Failed to clear chat: ${errMessage(err)}`;
      setMsgs((m) => [...m, { role: "assistant", text: msg }]);
      await persistMessage("assistant", msg);
    } finally {
      setClearing(false);
    }
  }, [sessionId, clearing, greeting, persistMessage]);

  return (
    <div style={{ width: 360, background: C.sidebar, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, position: "relative" }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.accent, boxShadow: `0 0 10px ${C.accent}`, animation: "glow 2s ease infinite", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Spendify Chatbot</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => {
              if (!clearing) {
                setShowClearConfirm((v) => !v);
              }
            }}
            disabled={clearing}
            style={{ background: "none", border: "none", color: C.danger, cursor: clearing ? "not-allowed" : "pointer", fontSize: 11, fontFamily: F, opacity: clearing ? 0.7 : 1 }}
          >
            {clearing ? "Clearing..." : "Clear"}
          </button>
        </div>
        {showClearConfirm && (
          <div style={{ position: "absolute", top: 42, right: 12, width: 210, background: C.card, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "10px 11px", zIndex: 20, boxShadow: "0 12px 28px #00000045" }}>
            <div style={{ fontSize: 11, color: C.text, marginBottom: 8 }}>Clear this chat history?</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button onClick={() => setShowClearConfirm(false)} style={{ border: `1px solid ${C.border2}`, background: "transparent", color: C.muted, borderRadius: 7, fontSize: 10, padding: "4px 8px", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={clearChat} style={{ border: "none", background: C.danger, color: "#fff", borderRadius: 7, fontSize: 10, padding: "4px 9px", cursor: "pointer" }}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              maxWidth: "93%",
              padding: "10px 13px",
              fontSize: 12.5,
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              borderRadius: m.role === "user" ? "13px 13px 3px 13px" : "13px 13px 13px 3px",
              background: m.role === "user" ? `linear-gradient(135deg,${C.accent},#00b86e)` : C.card,
              border: m.role === "user" ? "none" : `1px solid ${C.border}`,
              color: m.role === "user" ? "#04060e" : C.text,
              fontWeight: m.role === "user" ? 600 : 400,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "12px 14px", background: C.card, borderRadius: "13px 13px 13px 3px", border: `1px solid ${C.border}`, width: "fit-content" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 5, flexShrink: 0 }}>
        {QUICK_CHIPS.map((q, i) => (
          <button key={i} className="chip" onClick={() => send(q)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 99, padding: "3px 9px", fontSize: 10.5, color: C.muted, cursor: "pointer", fontFamily: F, transition: "all .15s" }}>
            {q}
          </button>
        ))}
      </div>

      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Chat about your finances..."
          rows={1}
          style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", color: C.text, fontSize: 12.5, resize: "none", fontFamily: F, outline: "none", lineHeight: 1.55, maxHeight: 90 }}
          onFocus={(e) => {
            e.target.style.borderColor = C.accent + "55";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.border;
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading}
          style={{ width: 36, height: 36, borderRadius: 9, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: loading ? C.border : `linear-gradient(135deg,${C.accent},#00b86e)`, transition: "opacity .15s" }}
        >
          {loading ? <Spinner size={15} /> : <span style={{ color: "#04060e", fontWeight: 900, fontSize: 11 }}>-&gt;</span>}
        </button>
      </div>
    </div>
  );
}
