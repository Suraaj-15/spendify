import { useState } from "react";
import { C, F } from "../../constants/colors";
import { fmtMoney } from "../../utils/helpers";

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
    style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 13px", color: C.text, fontSize: 13, outline: "none", width: "100%", ...style }}
    onFocus={e => e.target.style.borderColor = C.accent + "66"}
    onBlur={e => e.target.style.borderColor = C.border}
    {...p}
  />
);

const EyeIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1.3 8C2.8 5.1 5.1 3.5 8 3.5c2.9 0 5.2 1.6 6.7 4.5-1.5 2.9-3.8 4.5-6.7 4.5-2.9 0-5.2-1.6-6.7-4.5Z" stroke={C.faint} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="2" stroke={C.faint} strokeWidth="1.2" />
    {!open && <path d="M2.5 2.5 13.5 13.5" stroke={C.faint} strokeWidth="1.2" strokeLinecap="round" />}
  </svg>
);

export const PasswordInp = ({ style, inputStyle, ...p }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      <Inp {...p} type={visible ? "text" : "password"} style={{ paddingRight: 32, ...inputStyle }} />
      <span
        role="button"
        tabIndex={0}
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setVisible((v) => !v);
          }
        }}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          lineHeight: 0,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EyeIcon open={visible} />
      </span>
    </div>
  );
};

export const Sel = ({ style, children, ...p }) => (
  <select
    style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", color: C.muted, fontSize: 12, outline: "none", cursor: "pointer", ...style }}
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

export const ChartTooltip = ({ active, payload, label, currency = "INR" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "9px 14px", fontFamily: F }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color || C.accent, fontVariantNumeric: "tabular-nums" }}>
          {p.name && <span style={{ color: C.faint, fontWeight: 400, marginRight: 6, fontSize: 11 }}>{p.name}</span>}
          {fmtMoney(Number(p.value) || 0, currency)}
        </div>
      ))}
    </div>
  );
};
