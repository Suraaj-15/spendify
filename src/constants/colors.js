export const C = {
  bg:      "var(--c-bg)",
  sidebar: "var(--c-sidebar)",
  card:    "var(--c-card)",
  border:  "var(--c-border)",
  border2: "var(--c-border2)",
  text:    "var(--c-text)",
  muted:   "var(--c-muted)",
  faint:   "var(--c-faint)",
  accent:  "var(--c-accent)",
  accent2: "var(--c-accent2)",
  warn:    "var(--c-warn)",
  danger:  "var(--c-danger)",
  purple:  "var(--c-purple)",
};

export const F = "'Sora', sans-serif";
export const M = "'JetBrains Mono', monospace";

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root,
  body[data-theme="dark"] {
    --c-bg: #06070f;
    --c-sidebar: #090b16;
    --c-card: #0c0e1c;
    --c-border: #171a2c;
    --c-border2: #20253a;
    --c-text: #dde3ef;
    --c-muted: #7882a0;
    --c-faint: #35405a;
    --c-accent: #0ddc80;
    --c-accent2: #3db8f5;
    --c-warn: #f5c842;
    --c-danger: #f56c6c;
    --c-purple: #a78bfa;
  }

  body[data-theme="light"] {
    --c-bg: #f4f6fb;
    --c-sidebar: #eef2fa;
    --c-card: #ffffff;
    --c-border: #d7deed;
    --c-border2: #c4cde2;
    --c-text: #111936;
    --c-muted: #405176;
    --c-faint: #7e8ba8;
    --c-accent: #1aa25b;
    --c-accent2: #1481cc;
    --c-warn: #d89b12;
    --c-danger: #d64545;
    --c-purple: #7b62db;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: var(--c-bg); }
  #root { height: 100%; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--c-border2); border-radius: 99px; }
  input, textarea, select, button { font-family: 'Sora', sans-serif; }
  select option { background: var(--c-card); color: var(--c-text); }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse   { 0%,60%,100% { opacity:.25; transform:scale(.8); } 30% { opacity:1; transform:scale(1.2); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes glow    { 0%,100% { box-shadow:0 0 8px #0ddc8022; } 50% { box-shadow:0 0 20px #0ddc8055; } }
  .fadein  { animation: fadeIn  .25s ease both; }
  .fadeup  { animation: fadeUp  .32s ease both; }
  .card-hover { transition: border-color .18s, transform .18s, box-shadow .18s; }
  .card-hover:hover { border-color: var(--c-border2) !important; transform: translateY(-1px); box-shadow: 0 6px 28px #00000022; }
  .row-hover:hover { background: color-mix(in srgb, var(--c-border), transparent 65%) !important; }
  .nav-item:hover { background: color-mix(in srgb, var(--c-accent), transparent 90%) !important; color: var(--c-accent) !important; }
  .btn-ghost:hover { border-color: var(--c-border2) !important; color: var(--c-text) !important; }
  .chip:hover { border-color: color-mix(in srgb, var(--c-accent), transparent 60%) !important; color: var(--c-accent) !important; }
`;

