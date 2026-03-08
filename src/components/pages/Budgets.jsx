import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { C, F } from "../../constants/colors";
import { fmt, nowM, getCat, nextId } from "../../utils/helpers";
import { Btn, Card, ChartTooltip, Inp, SectionTitle, Sel } from "../ui";

export default function Budgets({ budgets, setBudgets, expenses, categories }) {
  const m = nowM();
  const mExp = expenses.filter(e => e.date.startsWith(m));
  const [editId,  setEditId]  = useState(null);
  const [editVal, setEditVal] = useState("");
  const [newCat,  setNewCat]  = useState("food");
  const [newLim,  setNewLim]  = useState("");

  const availCats = categories.filter(c => !budgets.find(b => b.category === c.id && b.month === m));

  const compareData = categories.filter(c => budgets.find(b => b.category === c.id)).map(c => {
    const curr  = mExp.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0);
    const prev  = expenses.filter(e => e.date.startsWith("2026-02") && e.category === c.id).reduce((s, e) => s + e.amount, 0);
    const b     = budgets.find(b => b.category === c.id);
    return { cat: c.name.split(" ")[0], curr, prev, limit: b?.limit || 0 };
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14, marginBottom: 18 }}>
        {budgets.map(b => {
          const cat   = getCat(categories, b.category);
          const spent = mExp.filter(e => e.category === b.category).reduce((s, e) => s + e.amount, 0);
          const pct   = (spent / b.limit) * 100;
          const over  = pct > 100, danger = pct > 85;
          const barColor = over ? C.danger : danger ? C.warn : cat.color;

          return (
            <Card key={b.id} style={{ borderTop: `2px solid ${barColor}`, animationDelay: `${b.id * .04}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 22 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cat.name}</div>
                    <div style={{ fontSize: 10, color: C.faint }}>March 2026</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: barColor, fontVariantNumeric: "tabular-nums" }}>{Math.round(pct)}%</div>
                  <div style={{ fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: "1px" }}>used</div>
                </div>
              </div>

              <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 99, transition: "width .6s ease" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[["Spent", `$${fmt(spent)}`, over ? C.danger : C.text], ["Remaining", `$${fmt(Math.max(b.limit - spent, 0))}`, over ? C.danger : C.accent], ["Limit", `$${b.limit}`, C.muted]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "center", background: C.border + "44", borderRadius: 8, padding: "7px 4px" }}>
                    <div style={{ fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                  </div>
                ))}
              </div>

              {editId === b.id ? (
                <div style={{ display: "flex", gap: 7 }}>
                  <Inp type="number" value={editVal} onChange={e => setEditVal(e.target.value)} style={{ fontSize: 13 }} />
                  <Btn onClick={() => { setBudgets(bs => bs.map(x => x.id === b.id ? { ...x, limit: Number(editVal) } : x)); setEditId(null); }} style={{ padding: "8px 12px" }}>✓</Btn>
                  <Btn variant="ghost" onClick={() => setEditId(null)} style={{ padding: "8px 12px" }}>✕</Btn>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => { setEditId(b.id); setEditVal(b.limit); }} style={{ fontSize: 11, color: C.accent2, background: "none", border: "none", cursor: "pointer", fontFamily: F }}>Edit limit</button>
                  <button onClick={() => setBudgets(bs => bs.filter(x => x.id !== b.id))} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer", fontFamily: F }}
                    onMouseEnter={e => e.target.style.color = C.danger} onMouseLeave={e => e.target.style.color = C.faint}>Remove</button>
                </div>
              )}

              {(over || danger) && (
                <div style={{ marginTop: 10, padding: "8px 11px", background: barColor + "18", borderRadius: 8, fontSize: 11, color: barColor, fontWeight: 600 }}>
                  {over ? "⛔ Over budget — exceeded limit!" : "⚠️ Approaching budget limit"}
                </div>
              )}
            </Card>
          );
        })}

        {availCats.length > 0 && (
          <Card style={{ border: `1px dashed ${C.border2}`, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", minHeight: 200 }}>
            <div style={{ fontSize: 11, color: C.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>+ Set New Budget</div>
            <Sel value={newCat} onChange={e => setNewCat(e.target.value)} style={{ width: "100%" }}>
              {availCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </Sel>
            <Inp type="number" placeholder="Monthly limit ($)" value={newLim} onChange={e => setNewLim(e.target.value)} />
            <Btn onClick={() => { if (!newLim) return; setBudgets(bs => [...bs, { id: nextId(bs), category: newCat, limit: Number(newLim), month: m }]); setNewLim(""); }} style={{ width: "100%", justifyContent: "center" }}>Set Budget</Btn>
          </Card>
        )}
      </div>

      <Card>
        <SectionTitle>Month-over-Month vs Budget Limit (Bar Chart)</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={compareData} barCategoryGap="30%" barGap={3}>
            <XAxis dataKey="cat" tick={{ fill: C.faint, fontSize: 11, fontFamily: F }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.faint, fontSize: 11, fontFamily: F }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Legend formatter={v => <span style={{ color: C.muted, fontSize: 11 }}>{v}</span>} />
            <Bar dataKey="prev"  fill={C.border2}     radius={[4,4,0,0]} name="Feb 2026" />
            <Bar dataKey="curr"  fill={C.accent}      radius={[4,4,0,0]} name="Mar 2026" />
            <Bar dataKey="limit" fill={C.warn + "66"} radius={[4,4,0,0]} name="Budget Limit" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
