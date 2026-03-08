export const C = {
  bg:      "#06070f",
  sidebar: "#090b16",
  card:    "#0c0e1c",
  border:  "#171a2c",
  border2: "#20253a",
  text:    "#dde3ef",
  muted:   "#7882a0",
  faint:   "#35405a",
  accent:  "#0ddc80",
  accent2: "#3db8f5",
  warn:    "#f5c842",
  danger:  "#f56c6c",
  purple:  "#a78bfa",
};

export const F = "'Sora', sans-serif";
export const M = "'JetBrains Mono', monospace";

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #06070f; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1c2035; border-radius: 99px; }
  input, textarea, select, button { font-family: 'Sora', sans-serif; }
  select option { background: #0e1020; color: #dde3ef; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse   { 0%,60%,100% { opacity:.25; transform:scale(.8); } 30% { opacity:1; transform:scale(1.2); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes glow    { 0%,100% { box-shadow:0 0 8px #0ddc8022; } 50% { box-shadow:0 0 20px #0ddc8055; } }
  .fadein  { animation: fadeIn  .25s ease both; }
  .fadeup  { animation: fadeUp  .32s ease both; }
  .card-hover { transition: border-color .18s, transform .18s, box-shadow .18s; }
  .card-hover:hover { border-color: #252b45 !important; transform: translateY(-1px); box-shadow: 0 6px 28px #00000044; }
  .row-hover:hover { background: #0e1020 !important; }
  .nav-item:hover { background: #0ddc8012 !important; color: #0ddc80 !important; }
  .btn-ghost:hover { border-color: #252b45 !important; color: #dde3ef !important; }
  .chip:hover { border-color: #0ddc8066 !important; color: #0ddc80 !important; }
`;
