import React from "react";
import { C } from "../constants/colors";
import { NAV_ITEMS } from "../constants/data";

export default function Sidebar({ page, setPage, user, onLogout, onOpenProfile }) {
  return (
    <div style={{ width: 215, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "22px 0", flexShrink: 0 }}>
      <div style={{ padding: "0 18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#04060e", animation: "glow 2s ease infinite", flexShrink: 0 }}>
          {"\u20B9"}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px", color: C.text }}>Spendify AI</div>
          <div style={{ fontSize: 9, color: C.faint, letterSpacing: "2px", textTransform: "uppercase" }}>Finance OS</div>
        </div>
      </div>

      <div style={{ padding: "18px 10px", flex: 1 }}>
        <div style={{ fontSize: 9, color: C.faint, letterSpacing: "2px", textTransform: "uppercase", padding: "0 8px 10px", fontWeight: 600 }}>Menu</div>
        {NAV_ITEMS.map((n) => (
          <div
            key={n.id}
            className="nav-item"
            onClick={() => setPage(n.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 9,
              cursor: "pointer",
              marginBottom: 2,
              fontSize: 12.5,
              fontWeight: page === n.id ? 700 : 500,
              transition: "all .15s",
              background: page === n.id ? C.accent + "14" : "transparent",
              color: page === n.id ? C.accent : C.muted,
              borderLeft: `2px solid ${page === n.id ? C.accent : "transparent"}`,
            }}
          >
            <span style={{ fontSize: 14, width: 16, textAlign: "center" }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <button
            onClick={onOpenProfile}
            title="Edit profile"
            style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#04060e", flexShrink: 0 }}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 9, color: C.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </button>

          <button
            onClick={onLogout}
            title="Logout"
            style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 15, padding: 3, flexShrink: 0 }}
            onMouseEnter={(e) => (e.target.style.color = C.danger)}
            onMouseLeave={(e) => (e.target.style.color = C.faint)}
          >
            {"\u23FB"}
          </button>
        </div>
      </div>
    </div>
  );
}
