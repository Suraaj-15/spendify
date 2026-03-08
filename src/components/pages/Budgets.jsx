import React, { useState } from "react";
import { C, F } from "../../constants/colors";
import { fmtMoney, nowM, getCat, categoryMark } from "../../utils/helpers";
import { Btn, Card, Inp, Sel } from "../ui";

export default function Budgets({
  budgets,
  expenses,
  categories,
  baseCurrency,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}) {
  const m = nowM();
  const mExp = expenses.filter((e) => e.date.startsWith(m));

  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [newCat, setNewCat] = useState(categories[0]?.id || "food");
  const [newLim, setNewLim] = useState("");

  const monthBudgets = budgets.filter((b) => b.month === m);
  const availCats = categories.filter((c) => !monthBudgets.find((b) => b.category === c.id));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14, marginBottom: 18 }}>
        {monthBudgets.map((b, idx) => {
          const cat = getCat(categories, b.category);
          const spent = mExp.filter((e) => e.category === b.category).reduce((s, e) => s + e.amount, 0);
          const pct = b.limit ? (spent / b.limit) * 100 : 0;
          const over = pct > 100;
          const danger = pct > 85;
          const barColor = over ? C.danger : danger ? C.warn : cat.color;

          return (
            <Card key={b.id} style={{ borderTop: `2px solid ${barColor}`, animationDelay: `${idx * 0.04}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{categoryMark(cat)}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cat.name}</div>
                    <div style={{ fontSize: 10, color: C.faint }}>{m}</div>
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
                {[
                  ["Spent", fmtMoney(spent, baseCurrency), over ? C.danger : C.text],
                  ["Remaining", fmtMoney(Math.max(b.limit - spent, 0), baseCurrency), over ? C.danger : C.accent],
                  ["Limit", fmtMoney(b.limit, baseCurrency), C.muted],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ textAlign: "center", background: C.border + "44", borderRadius: 8, padding: "7px 4px" }}>
                    <div style={{ fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
                  </div>
                ))}
              </div>

              {editId === b.id ? (
                <div style={{ display: "flex", gap: 7 }}>
                  <Inp type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)} style={{ fontSize: 13 }} />
                  <Btn
                    onClick={async () => {
                      await onUpdateBudget({ ...b, limit: Number(editVal) });
                      setEditId(null);
                    }}
                    style={{ padding: "8px 12px" }}
                  >
                    Save
                  </Btn>
                  <Btn variant="ghost" onClick={() => setEditId(null)} style={{ padding: "8px 12px" }}>
                    Cancel
                  </Btn>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button
                    onClick={() => {
                      setEditId(b.id);
                      setEditVal(String(b.limit));
                    }}
                    style={{ fontSize: 11, color: C.accent2, background: "none", border: "none", cursor: "pointer", fontFamily: F }}
                  >
                    Edit limit
                  </button>
                  <button
                    onClick={() => onDeleteBudget(b.id)}
                    style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer", fontFamily: F }}
                    onMouseEnter={(e) => {
                      e.target.style.color = C.danger;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = C.faint;
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {(over || danger) && (
                <div style={{ marginTop: 10, padding: "8px 11px", background: barColor + "18", borderRadius: 8, fontSize: 11, color: barColor, fontWeight: 600 }}>
                  {over ? "Over budget: exceeded limit." : "Approaching budget limit."}
                </div>
              )}
            </Card>
          );
        })}

        {availCats.length > 0 && (
          <Card style={{ border: `1px dashed ${C.border2}`, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", minHeight: 200 }}>
            <div style={{ fontSize: 11, color: C.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>+ Set New Budget</div>
            <Sel value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{ width: "100%" }}>
              {availCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryMark(c)} {c.name}
                </option>
              ))}
            </Sel>
            <Inp type="number" placeholder="Monthly limit" value={newLim} onChange={(e) => setNewLim(e.target.value)} />
            <Btn
              onClick={async () => {
                if (!newLim) return;
                await onAddBudget({ category: newCat, limit: Number(newLim), month: m });
                setNewLim("");
              }}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Set Budget
            </Btn>
          </Card>
        )}
      </div>
    </div>
  );
}
