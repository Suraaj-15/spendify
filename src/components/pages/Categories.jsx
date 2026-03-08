import React, { useState } from "react";
import { C } from "../../constants/colors";
import { DEFAULT_CATEGORIES } from "../../constants/data";
import { Btn, Card, Inp, SectionTitle } from "../ui";
import { fmt } from "../../utils/helpers";

const PALETTE = ["#0ddc80","#3db8f5","#f5c842","#f472b6","#a78bfa","#fb923c","#34d399","#64748b","#e11d48","#0ea5e9"];

export default function Categories({ categories, setCategories, expenses }) {
  const [newName,  setNewName]  = useState("");
  const [newIcon,  setNewIcon]  = useState("📦");
  const [newColor, setNewColor] = useState(PALETTE[0]);

  const addCategory = () => {
    if (!newName.trim()) return;
    const id = newName.toLowerCase().replace(/\s+/g, "_") + Date.now();
    setCategories(p => [...p, { id, name: newName, icon: newIcon, color: newColor }]);
    setNewName(""); setNewIcon("📦");
  };

  const removeCategory = (id) => {
    if (DEFAULT_CATEGORIES.find(c => c.id === id)) return; // protect defaults
    setCategories(p => p.filter(c => c.id !== id));
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 18 }}>
        {categories.map(cat => {
          const txns = expenses.filter(e => e.category === cat.id);
          const total = txns.reduce((s, e) => s + e.amount, 0);
          const isDefault = !!DEFAULT_CATEGORIES.find(c => c.id === cat.id);
          return (
            <Card key={cat.id} style={{ borderLeft: `3px solid ${cat.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: cat.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{cat.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cat.name}</div>
                    <div style={{ fontSize: 10, color: C.faint }}>{txns.length} transactions</div>
                  </div>
                </div>
                {!isDefault && (
                  <button onClick={() => removeCategory(cat.id)}
                    style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 15 }}
                    onMouseEnter={e => e.target.style.color = C.danger}
                    onMouseLeave={e => e.target.style.color = C.faint}>✕</button>
                )}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: cat.color, fontVariantNumeric: "tabular-nums" }}>${fmt(total)}</div>
              {isDefault && <div style={{ fontSize: 9, color: C.faint, marginTop: 3, textTransform: "uppercase", letterSpacing: "1px" }}>Default</div>}
            </Card>
          );
        })}
      </div>

      <Card>
        <SectionTitle>Add Custom Category</SectionTitle>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Icon</label>
            <Inp value={newIcon} onChange={e => setNewIcon(e.target.value)} style={{ width: 58, textAlign: "center", fontSize: 24 }} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Category Name</label>
            <Inp placeholder="e.g. Fitness, Travel..." value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Color</label>
            <div style={{ display: "flex", gap: 5, paddingTop: 4 }}>
              {PALETTE.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  style={{ width: 22, height: 22, borderRadius: "50%", background: c, cursor: "pointer", border: `2.5px solid ${newColor === c ? "#fff" : "transparent"}`, transition: "border .15s" }} />
              ))}
            </div>
          </div>
          <Btn onClick={addCategory}>+ Add</Btn>
        </div>
      </Card>
    </div>
  );
}
