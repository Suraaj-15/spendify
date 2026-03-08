import React from "react";
import { C, M } from "../constants/colors";
import { NAV_ITEMS, PAGE_SUBTITLES } from "../constants/data";
import { Btn } from "./ui";

export default function Topbar({ page, user, expenseCount, onAddExpense }) {
  const title = NAV_ITEMS.find(n => n.id === page)?.label || "";

  return (
    <div style={{ height: 58, background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", flexShrink: 0 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.2px", color: C.text }}>{title}</div>
        <div style={{ fontSize: 10, color: C.faint, marginTop: 1 }}>{PAGE_SUBTITLES[page]}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 11, color: C.muted, background: C.border, borderRadius: 7, padding: "5px 11px", fontFamily: M }}>
          {expenseCount} records
        </div>
        <Btn onClick={onAddExpense}>+ Add Expense</Btn>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent2},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", cursor: "pointer" }}>
          {user.name[0].toUpperCase()}
        </div>
      </div>
    </div>
  );
}
