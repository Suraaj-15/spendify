import React from "react";
import { C, M } from "../constants/colors";
import { CURRENCIES } from "../constants/currencies";
import { NAV_ITEMS, PAGE_SUBTITLES } from "../constants/data";
import { Btn, Sel } from "./ui";

export default function Topbar({
  page,
  expenseCount,
  onAddExpense,
  theme,
  onToggleTheme,
  baseCurrency,
  onBaseCurrencyChange,
}) {
  const title = NAV_ITEMS.find((n) => n.id === page)?.label || "";

  return (
    <div style={{ height: 58, background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", flexShrink: 0 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.2px", color: C.text }}>{title}</div>
        <div style={{ fontSize: 10, color: C.faint, marginTop: 1 }}>{PAGE_SUBTITLES[page]}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 11, color: C.muted, background: C.border, borderRadius: 7, padding: "5px 11px", fontFamily: M }}>{expenseCount} records</div>

        <Sel value={baseCurrency} onChange={(e) => onBaseCurrencyChange(e.target.value)} style={{ width: 82, padding: "7px 9px", fontSize: 11 }}>
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Sel>

        <button
          onClick={onToggleTheme}
          title="Toggle theme"
          style={{
            width: 52,
            height: 30,
            borderRadius: 99,
            border: `1px solid ${C.border2}`,
            background: C.bg,
            color: C.text,
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: C.card,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateX(${theme === "dark" ? "0" : "20px"})`,
              transition: "transform .2s ease",
              fontSize: 13,
              lineHeight: 1,
            }}
          >
            {theme === "dark" ? "\u{1F319}" : "\u2600\uFE0F"}
          </span>
        </button>

        <Btn onClick={onAddExpense}>+ Add Expense</Btn>
      </div>
    </div>
  );
}
