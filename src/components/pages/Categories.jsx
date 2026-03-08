import React, { useMemo, useState } from "react";
import { C } from "../../constants/colors";
import { DEFAULT_CATEGORIES } from "../../constants/data";
import { fmtMoney, categoryMark } from "../../utils/helpers";
import { Btn, Card, Inp, SectionTitle } from "../ui";

const PALETTE = ["#0ddc80", "#3db8f5", "#f5c842", "#f472b6", "#a78bfa", "#fb923c", "#34d399", "#64748b", "#e11d48", "#0ea5e9"];

function createCategoryId(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}_${Date.now()}`;
}

export default function Categories({ categories, expenses, baseCurrency, onAddCategory, onRemoveCategory, onUpdateCategory }) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(PALETTE[0]);

  const defaultIds = useMemo(() => new Set(DEFAULT_CATEGORIES.map((c) => c.id)), []);

  const addCategory = async () => {
    if (!newName.trim()) return;
    const id = createCategoryId(newName.trim());
    await onAddCategory({ id, name: newName.trim(), icon: "", color: newColor });
    setNewName("");
    setNewColor(PALETTE[0]);
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const saveEdit = async () => {
    if (!editId || !editName.trim()) return;
    await onUpdateCategory(editId, { name: editName.trim(), color: editColor, icon: "" });
    setEditId("");
    setEditName("");
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14, marginBottom: 18 }}>
        {categories.map((cat) => {
          const txns = expenses.filter((e) => e.category === cat.id);
          const total = txns.reduce((s, e) => s + e.amount, 0);
          const isDefault = defaultIds.has(cat.id) || cat.isDefault;
          const isEditing = editId === cat.id;

          return (
            <Card key={cat.id} style={{ borderLeft: `3px solid ${cat.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 11,
                      background: cat.color + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {categoryMark(cat)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</div>
                    <div style={{ fontSize: 10, color: C.faint }}>{txns.length} transactions</div>
                  </div>
                </div>

                {!isDefault && !isEditing && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => startEdit(cat)}
                      style={{ background: "none", border: "none", color: C.accent2, cursor: "pointer", fontSize: 11, padding: 0 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete category "${cat.name}"?`)) onRemoveCategory(cat.id);
                      }}
                      style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 11, padding: 0 }}
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
              </div>

              {isEditing ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Inp value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Category name" />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {PALETTE.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditColor(color)}
                        style={{ width: 20, height: 20, borderRadius: "50%", background: color, border: `2px solid ${editColor === color ? C.text : "transparent"}`, cursor: "pointer" }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={saveEdit} style={{ padding: "7px 12px" }}>
                      Save
                    </Btn>
                    <Btn variant="ghost" onClick={() => setEditId("")} style={{ padding: "7px 12px" }}>
                      Cancel
                    </Btn>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 20, fontWeight: 800, color: cat.color, fontVariantNumeric: "tabular-nums" }}>{fmtMoney(total, baseCurrency)}</div>
                  {isDefault && <div style={{ fontSize: 9, color: C.faint, marginTop: 3, textTransform: "uppercase", letterSpacing: "1px" }}>Default</div>}
                </>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <SectionTitle>Add Custom Category</SectionTitle>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Category Name</label>
            <Inp placeholder="e.g. Fitness, Travel..." value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Color</label>
            <div style={{ display: "flex", gap: 6, paddingTop: 4, flexWrap: "wrap", maxWidth: 240 }}>
              {PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  style={{ width: 22, height: 22, borderRadius: "50%", background: color, cursor: "pointer", border: `2px solid ${newColor === color ? C.text : "transparent"}` }}
                />
              ))}
            </div>
          </div>

          <Btn onClick={addCategory}>+ Add</Btn>
        </div>
      </Card>
    </div>
  );
}
