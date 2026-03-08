import React, { useState, useRef, useEffect, useCallback } from "react";
import { C, F } from "../constants/colors";
import { QUICK_CHIPS } from "../constants/data";
import { GEMINI_TOOLS } from "../constants/geminiTools";
import { today, nowM } from "../utils/helpers";
import { execFn } from "../utils/geminiExecutor";
import { Spinner } from "./ui";

const GEMINI_URL = key => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

export default function ChatPanel({ apiKey, expenses, setExpenses, budgets, categories }) {
  const [msgs,    setMsgs]    = useState([{ role: "assistant", text: "Hi! I'm your Gemini AI assistant 🤖\n\nI can add, update, delete expenses and give you insights. Try:\n• \"I spent $45 on groceries\"\n• \"How much on food this month?\"\n• \"Delete my last expense\"\n• \"Am I on budget?\"" }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef  = useRef(null);
  const expRef  = useRef(expenses);
  expRef.current = expenses;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const buildSystemPrompt = () => {
    const t = today();
    const yest = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    return `You are a smart AI expense tracker assistant. Today: ${t}. Yesterday: ${yest}. This month: ${nowM()}-01 to ${t}.
Current expenses (last 25): ${JSON.stringify(expRef.current.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 25))}
Categories: food|transport|bills|shopping|health|entertain|other. Methods: Card|UPI|Cash|Net Banking|Transfer|Wallet.
Always call a function tool. Auto-categorize intelligently. Respond concisely with emoji after tool execution.`;
  };

  const send = useCallback(async (text) => {
    if (!text?.trim() || loading) return;
    setInput("");
    setMsgs(m => [...m, { role: "user", text }]);
    setLoading(true);

    const newH = [...history, { role: "user", parts: [{ text }] }];

    try {
      // First call
      const r1 = await fetch(GEMINI_URL(apiKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: buildSystemPrompt() }] },
          contents: newH,
          tools: GEMINI_TOOLS,
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      });
      const d1 = await r1.json();
      if (d1.error) throw new Error(d1.error.message);

      let cand  = d1.candidates?.[0];
      let parts = cand?.content?.parts || [];
      const fnCalls = parts.filter(p => p.functionCall);

      if (fnCalls.length > 0) {
        // Execute tool calls and update state
        const fnResults = fnCalls.map(p => {
          const { result, sc } = execFn(p.functionCall.name, p.functionCall.args, expRef.current, budgets, categories);
          if (sc.addExpenses)    setExpenses(prev => { const max = Math.max(0, ...prev.map(e => e.id)); return [...prev, ...sc.addExpenses.map((e, i) => ({ ...e, id: max + i + 1 }))]; });
          if (sc.updateExpense)  setExpenses(prev => prev.map(e => e.id === sc.updateExpense.id ? sc.updateExpense : e));
          if (sc.deleteIds)      setExpenses(prev => prev.filter(e => !sc.deleteIds.includes(e.id)));
          return { name: p.functionCall.name, response: { result } };
        });

        // Follow-up call with tool results
        const r2 = await fetch(GEMINI_URL(apiKey), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: buildSystemPrompt() }] },
            contents: [
              ...newH,
              { role: "model", parts: fnCalls.map(p => ({ functionCall: p.functionCall })) },
              { role: "user",  parts: fnResults.map(r => ({ functionResponse: r })) },
            ],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
          }),
        });
        const d2 = await r2.json();
        if (d2.error) throw new Error(d2.error.message);
        cand  = d2.candidates?.[0];
        parts = cand?.content?.parts || [];
      }

      const reply = parts.find(p => p.text)?.text || "Done! ✅";
      setMsgs(m => [...m, { role: "assistant", text: reply }]);
      setHistory([...newH, { role: "model", parts: [{ text: reply }] }]);

    } catch (err) {
      setMsgs(m => [...m, { role: "assistant", text: `❌ Error: ${err.message}\n\nCheck your Gemini API key.` }]);
    } finally {
      setLoading(false);
    }
  }, [apiKey, history, budgets, categories, loading]);

  return (
    <div style={{ width: 330, background: C.sidebar, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>

      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.accent, boxShadow: `0 0 10px ${C.accent}`, animation: "glow 2s ease infinite", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Gemini AI Assistant</div>
          <div style={{ fontSize: 10, color: C.faint }}>Natural language · Full CRUD</div>
        </div>
        <button onClick={() => setHistory([])} title="Clear conversation"
          style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 11, fontFamily: F }}>↺ Clear</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            maxWidth: "93%", padding: "10px 13px", fontSize: 12.5, lineHeight: 1.65,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            borderRadius: m.role === "user" ? "13px 13px 3px 13px" : "13px 13px 13px 3px",
            background: m.role === "user" ? `linear-gradient(135deg,${C.accent},#00b86e)` : "#111428",
            border: m.role === "user" ? "none" : `1px solid ${C.border}`,
            color: m.role === "user" ? "#04060e" : C.text,
            fontWeight: m.role === "user" ? 600 : 400,
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
          }}>{m.text}</div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "12px 14px", background: "#111428", borderRadius: "13px 13px 13px 3px", border: `1px solid ${C.border}`, width: "fit-content" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ease ${i * .2}s infinite` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Chips */}
      <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 5, flexShrink: 0 }}>
        {QUICK_CHIPS.map((q, i) => (
          <button key={i} className="chip" onClick={() => send(q)}
            style={{ background: "#111428", border: `1px solid ${C.border}`, borderRadius: 99, padding: "3px 9px", fontSize: 10.5, color: C.muted, cursor: "pointer", fontFamily: F, transition: "all .15s" }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Chat about your finances..."
          rows={1}
          style={{ flex: 1, background: "#07091a", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", color: C.text, fontSize: 12.5, resize: "none", fontFamily: F, outline: "none", lineHeight: 1.55, maxHeight: 90 }}
          onFocus={e => e.target.style.borderColor = C.accent + "55"}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button onClick={() => send(input)} disabled={loading}
          style={{ width: 36, height: 36, borderRadius: 9, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: loading ? C.border : `linear-gradient(135deg,${C.accent},#00b86e)`, transition: "opacity .15s" }}>
          {loading ? <Spinner size={15} /> : <span style={{ color: "#04060e", fontWeight: 900, fontSize: 17 }}>↑</span>}
        </button>
      </div>
    </div>
  );
}
