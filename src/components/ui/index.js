import { C, F } from "../../constants/colors";
import { fmt } from "../../utils/helpers";

export const Card = ({ children, style, cls = "card-hover fadeup" }) => (
  <div className={cls} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", ...style }}>
    {children}
  </div>
);

export const SectionTitle = ({ children, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
    <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: C.faint, fontWeight: 600 }}>{children}</div>
    {action}
  </div>
);

export const Badge = ({ color, children, style }) => (
  <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, ...style }}>
    {children}
  </span>
);

export const Spinner = ({ size = 16 }) => (
  <div style={{ width: size, height: size, border: `2px solid ${C.border2}`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin .7s linear infinite" }} />
);

export const Inp = ({ style, ...p }) => (
  <input
    style={{ background: "#07091a", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 13px", color: C.text, fontSize: 13, outline: "none", width: "100%", ...style }}
    onFocus={e => e.target.style.borderColor = C.accent + "66"}
    onBlur={e => e.target.style.borderColor = C.border}
    {...p}
  />
);

export const Sel = ({ style, children, ...p }) => (
  <select
    style={{ background: "#07091a", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", color: C.muted, fontSize: 12, outline: "none", cursor: "pointer", ...style }}
    {...p}
  >
    {children}
  </select>
);

export const Btn = ({ children, variant = "primary", style, ...p }) => {
  const vs = {
    primary: { background: `linear-gradient(135deg,${C.accent},#00b86e)`, color: "#04060e", border: "none" },
    ghost:   { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger:  { background: "#f56c6c18", color: C.danger, border: `1px solid #f56c6c33` },
  };
  return (
    <button
      className={variant === "ghost" ? "btn-ghost" : ""}
      style={{ borderRadius: 9, padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, transition: "opacity .15s, transform .1s", ...vs[variant], ...style }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(.97)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      {...p}
    >
      {children}
    </button>
  );
};

export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111325", border: `1px solid ${C.border2}`, borderRadius: 10, padding: "9px 14px", fontFamily: F }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color || C.accent, fontVariantNumeric: "tabular-nums" }}>
          {p.name && <span style={{ color: C.faint, fontWeight: 400, marginRight: 6, fontSize: 11 }}>{p.name}</span>}
          ${fmt(p.value)}
        </div>
      ))}
    </div>
  );
};
