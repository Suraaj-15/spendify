import React, { useState } from "react";
import { C, M } from "../constants/colors";
import { METHODS } from "../constants/data";
import { today } from "../utils/helpers";
import { Inp, Sel, Btn } from "./ui";

export default function ExpenseModal({ categories, initial, onSave, onClose }) {
  const blank = { amount: "", category: "food", description: "", merchant: "", date: today(), method: "Card" };
  const [f, setF] = useState(initial || blank);
  const [err, setErr] = useState("");
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.amount || isNaN(Number(f.amount)) || Number(f.amount) <= 0)
      return setErr("Enter a valid amount greater than 0.");
    if (!f.date) return setErr("Date is required.");
    onSave({ ...f, amount: Number(f.amount) });
    onClose();
  };

  return (
    <div className="fadein" style={{ position: "fixed", inset: 0, background: "#00000090", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
      <div className="fadeup" style={{ background: C.card, border: `1px solid ${C.border2}`, borderRadius: 20, padding: "30px 32px", width: 460, fontFamily: "'Sora',sans-serif", boxShadow: "0 32px 100px #00000070", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{initial ? "Edit Expense" : "Add Expense"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.faint, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {/* Form */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Amount ($) *</label>
            <Inp type="number" placeholder="0.00" value={f.amount} onChange={e => set("amount", e.target.value)}
              style={{ fontSize: 26, fontWeight: 800, fontFamily: M, letterSpacing: "-0.5px" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Category *</label>
            <Sel value={f.category} onChange={e => set("category", e.target.value)} style={{ width: "100%" }}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </Sel>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Payment Method</label>
            <Sel value={f.method} onChange={e => set("method", e.target.value)} style={{ width: "100%" }}>
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </Sel>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Description</label>
            <Inp placeholder="What was this for?" value={f.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Merchant / Vendor</label>
            <Inp placeholder="Store name" value={f.merchant} onChange={e => set("merchant", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Date *</label>
            <Inp type="date" value={f.date} onChange={e => set("date", e.target.value)} />
          </div>
        </div>

        {err && <div style={{ marginTop: 14, fontSize: 12, color: C.danger, background: "#f56c6c14", borderRadius: 8, padding: "9px 13px" }}>{err}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
          <Btn onClick={submit} style={{ flex: 2, justifyContent: "center" }}>{initial ? "Save Changes" : "Add Expense"}</Btn>
        </div>
      </div>
    </div>
  );
}
