import React, { useState } from "react";
import { C, GLOBAL_CSS } from "../constants/colors";
import { Inp, Btn, PasswordInp } from "./ui";

export default function AuthScreen({ onSubmit, loading = false, authError = "", supabaseMissing = false, groqMissing = false }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr("");

    if (!f.email || !f.password) return setErr("Email and password are required.");
    if (mode === "signup") {
      if (!f.name.trim()) return setErr("Name is required.");
      if (f.password.length < 6) return setErr("Password must be at least 6 characters.");
      if (f.password !== f.confirm) return setErr("Passwords do not match.");
    }

    await onSubmit({
      mode,
      name: f.name.trim(),
      email: f.email.trim().toLowerCase(),
      password: f.password,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`, backgroundSize: "50px 50px", opacity: 0.35 }} />
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: `radial-gradient(ellipse,${C.accent}0d 0%,transparent 70%)`, pointerEvents: "none" }} />

      <div className="fadeup" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: "44px", width: 440, position: "relative", zIndex: 1, boxShadow: "0 24px 80px #00000060" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#04060e", animation: "glow 2s ease infinite" }}>S</div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: C.text, letterSpacing: "-0.4px" }}>Spendify AI</div>
            <div style={{ fontSize: 9, color: C.faint, letterSpacing: "2.5px", textTransform: "uppercase" }}>Supabase + Groq</div>
          </div>
        </div>

        <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 5 }}>{mode === "login" ? "Welcome back" : "Create account"}</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{mode === "login" ? "Sign in to your workspace" : "Start tracking with persistent storage"}</div>

        <div style={{ display: "flex", background: C.bg, borderRadius: 11, padding: 4, marginBottom: 20, border: `1px solid ${C.border}` }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setErr("");
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 8,
                border: "none",
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                transition: "all .2s",
                background: mode === m ? `linear-gradient(135deg,${C.accent},#00b86e)` : "transparent",
                color: mode === m ? "#04060e" : C.faint,
              }}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && <Inp placeholder="Full name" value={f.name} onChange={(e) => set("name", e.target.value)} />}
          <Inp type="email" placeholder="Email address" value={f.email} onChange={(e) => set("email", e.target.value)} />
          <PasswordInp placeholder="Password (min 6 chars)" value={f.password} onChange={(e) => set("password", e.target.value)} />
          {mode === "signup" && <PasswordInp placeholder="Confirm password" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} />}

          {supabaseMissing && (
            <div style={{ fontSize: 12, color: C.danger, background: "#f56c6c14", borderRadius: 8, padding: "9px 13px", border: "1px solid #f56c6c22" }}>
              Missing `REACT_APP_SUPABASE_URL` or `REACT_APP_SUPABASE_ANON_KEY`.
            </div>
          )}

          {groqMissing && (
            <div style={{ fontSize: 12, color: C.danger, background: "#f56c6c14", borderRadius: 8, padding: "9px 13px", border: "1px solid #f56c6c22" }}>
              Missing `REACT_APP_GROQ_API_KEY`. Add it in `.env` and restart the app.
            </div>
          )}

          {(err || authError) && (
            <div style={{ fontSize: 12, color: C.danger, background: "#f56c6c14", borderRadius: 8, padding: "9px 13px", border: "1px solid #f56c6c22" }}>
              {err || authError}
            </div>
          )}

          <Btn onClick={submit} disabled={loading || supabaseMissing} style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 13, marginTop: 4, opacity: loading || supabaseMissing ? 0.7 : 1 }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In ->" : "Create Account ->"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

