import { useState, useRef, useEffect, useCallback } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #06070f; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1c2035; border-radius: 99px; }
  input, textarea, select, button { font-family: 'Sora', sans-serif; }
  select option { background: #0e1020; color: #dde3ef; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse    { 0%,60%,100% { opacity:.25; transform:scale(.8); } 30% { opacity:1; transform:scale(1.2); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes glow     { 0%,100% { box-shadow:0 0 8px #0ddc8022; } 50% { box-shadow:0 0 20px #0ddc8055; } }
  .fadein  { animation: fadeIn  .25s ease both; }
  .fadeup  { animation: fadeUp  .32s ease both; }
  .card-hover { transition: border-color .18s, transform .18s, box-shadow .18s; }
  .card-hover:hover { border-color: #252b45 !important; transform: translateY(-1px); box-shadow: 0 6px 28px #00000044; }
  .row-hover:hover { background: #0e1020 !important; }
  .nav-item:hover { background: #0ddc8012 !important; color: #0ddc80 !important; }
  .btn-ghost:hover { border-color: #252b45 !important; color: #dde3ef !important; }
  .chip:hover { border-color: #0ddc8066 !important; color: #0ddc80 !important; }
`;

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & SEED DATA
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:"#06070f", sidebar:"#090b16", card:"#0c0e1c",
  border:"#171a2c", border2:"#20253a",
  text:"#dde3ef", muted:"#7882a0", faint:"#35405a",
  accent:"#0ddc80", accent2:"#3db8f5", warn:"#f5c842",
  danger:"#f56c6c", purple:"#a78bfa",
};
const F = "'Sora', sans-serif";
const M = "'JetBrains Mono', monospace";

const DEFAULT_CATEGORIES = [
  { id:"food",       name:"Food & Dining",     icon:"🍜", color:"#0ddc80" },
  { id:"transport",  name:"Transport",          icon:"🚗", color:"#3db8f5" },
  { id:"bills",      name:"Bills & Utilities",  icon:"⚡", color:"#f5c842" },
  { id:"shopping",   name:"Shopping",           icon:"🛍️", color:"#f472b6" },
  { id:"health",     name:"Healthcare",         icon:"💊", color:"#a78bfa" },
  { id:"entertain",  name:"Entertainment",      icon:"🎬", color:"#fb923c" },
  { id:"other",      name:"Other",              icon:"📦", color:"#64748b" },
];

const SEED_EXPENSES = [
  { id:1,  amount:45,   category:"food",      description:"Whole Foods groceries",  merchant:"Whole Foods",    date:"2026-03-08", method:"Card" },
  { id:2,  amount:12,   category:"transport", description:"Uber to office",          merchant:"Uber",           date:"2026-03-08", method:"UPI" },
  { id:3,  amount:89,   category:"bills",     description:"Electricity bill",        merchant:"TNEB",           date:"2026-03-07", method:"Net Banking" },
  { id:4,  amount:1200, category:"bills",     description:"Monthly rent",            merchant:"Landlord",       date:"2026-03-01", method:"Transfer" },
  { id:5,  amount:34,   category:"food",      description:"Dinner at Pasta Place",   merchant:"Pasta Place",    date:"2026-03-06", method:"Card" },
  { id:6,  amount:5.5,  category:"food",      description:"Morning coffee",          merchant:"Blue Tokai",     date:"2026-03-06", method:"UPI" },
  { id:7,  amount:120,  category:"shopping",  description:"New sneakers",            merchant:"Nike",           date:"2026-03-05", method:"Card" },
  { id:8,  amount:60,   category:"transport", description:"Monthly metro pass",      merchant:"Chennai Metro",  date:"2026-03-04", method:"UPI" },
  { id:9,  amount:200,  category:"entertain", description:"Concert tickets",         merchant:"BookMyShow",     date:"2026-03-03", method:"Card" },
  { id:10, amount:15,   category:"health",    description:"Vitamins",                merchant:"Pharmeasy",      date:"2026-03-02", method:"UPI" },
  { id:11, amount:55,   category:"food",      description:"Weekly groceries",        merchant:"DMart",          date:"2026-02-28", method:"UPI" },
  { id:12, amount:80,   category:"entertain", description:"Netflix & Spotify",       merchant:"Streaming",      date:"2026-02-25", method:"Card" },
  { id:13, amount:210,  category:"shopping",  description:"Winter jacket",           merchant:"H&M",            date:"2026-02-20", method:"Card" },
  { id:14, amount:30,   category:"transport", description:"Fuel",                    merchant:"HP Petrol",      date:"2026-02-18", method:"Cash" },
  { id:15, amount:48,   category:"health",    description:"Doctor consultation",     merchant:"Apollo Clinic",  date:"2026-02-15", method:"Card" },
  { id:16, amount:22,   category:"food",      description:"Pizza delivery",          merchant:"Dominos",        date:"2026-03-07", method:"UPI" },
  { id:17, amount:350,  category:"shopping",  description:"Electronics accessories", merchant:"Croma",          date:"2026-03-05", method:"Card" },
  { id:18, amount:8,    category:"food",      description:"Tea & snacks",            merchant:"Cafe Coffee Day", date:"2026-03-04", method:"UPI" },
];

const SEED_BUDGETS = [
  { id:1, category:"food",      limit:400,  month:"2026-03" },
  { id:2, category:"transport", limit:150,  month:"2026-03" },
  { id:3, category:"bills",     limit:1400, month:"2026-03" },
  { id:4, category:"shopping",  limit:200,  month:"2026-03" },
  { id:5, category:"entertain", limit:250,  month:"2026-03" },
  { id:6, category:"health",    limit:100,  month:"2026-03" },
];

const METHODS = ["Card","UPI","Cash","Net Banking","Transfer","Wallet"];

const TREND_DATA = [
  { month:"Oct'25", amount:1620, prev:1450 },
  { month:"Nov'25", amount:1890, prev:1620 },
  { month:"Dec'25", amount:2340, prev:1890 },
  { month:"Jan'26", amount:1780, prev:2340 },
  { month:"Feb'26", amount:1850, prev:1780 },
  { month:"Mar'26", amount:1781, prev:1850 },
];

/* ═══════════════════════════════════════════════════════════════
   GEMINI TOOLS
═══════════════════════════════════════════════════════════════ */
const GEMINI_TOOLS = [{
  functionDeclarations: [
    { name:"add_expense", description:"Add one or more expenses from natural language.",
      parameters:{ type:"OBJECT", properties:{ expenses:{ type:"ARRAY", items:{ type:"OBJECT",
        properties:{ amount:{type:"NUMBER"}, category:{type:"STRING",description:"food|transport|bills|shopping|health|entertain|other"},
          description:{type:"STRING"}, merchant:{type:"STRING"}, date:{type:"STRING",description:"YYYY-MM-DD"},
          method:{type:"STRING",description:"Card|UPI|Cash|Net Banking|Transfer|Wallet"} }, required:["amount","category"] } } }, required:["expenses"] } },
    { name:"query_expenses", description:"Query/filter/summarize expenses.",
      parameters:{ type:"OBJECT", properties:{ category:{type:"STRING"}, date_from:{type:"STRING"},
        date_to:{type:"STRING"}, limit:{type:"NUMBER"}, sort_by:{type:"STRING",description:"amount|date"},
        sort_order:{type:"STRING",description:"asc|desc"} } } },
    { name:"update_expense", description:"Update an existing expense.",
      parameters:{ type:"OBJECT", properties:{ id:{type:"NUMBER"}, last_n:{type:"NUMBER",description:"1=most recent"},
        amount:{type:"NUMBER"}, category:{type:"STRING"}, description:{type:"STRING"},
        merchant:{type:"STRING"}, method:{type:"STRING"} } } },
    { name:"delete_expense", description:"Delete one or more expenses.",
      parameters:{ type:"OBJECT", properties:{ id:{type:"NUMBER"}, last_n:{type:"NUMBER"},
        category:{type:"STRING"}, date_from:{type:"STRING"}, date_to:{type:"STRING"} } } },
    { name:"get_budget_status", description:"Check budget limits and spending.",
      parameters:{ type:"OBJECT", properties:{ category:{type:"STRING"} } } },
    { name:"get_insights", description:"Generate spending insights and recommendations.",
      parameters:{ type:"OBJECT", properties:{ period:{type:"STRING",description:"this_month|last_month|this_week|all"} } } },
  ]
}];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const fmt    = n => (typeof n==="number"?n:0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const today  = () => new Date().toISOString().split("T")[0];
const nowM   = () => new Date().toISOString().slice(0,7);
const nextId = arr => Math.max(0,...arr.map(e=>e.id))+1;

function execFn(name, args, expenses, budgets, categories) {
  const sc = {};
  let result = {};
  if (name==="add_expense") {
    const list = (args.expenses||[]).map((e,i)=>({
      id: nextId(expenses)+i, amount:Number(e.amount), category:e.category||"other",
      description:e.description||"", merchant:e.merchant||"", date:e.date||today(), method:e.method||"Card",
    }));
    sc.addExpenses = list;
    result = { success:true, added:list.length, expenses:list };
  } else if (name==="query_expenses") {
    let f = [...expenses];
    if (args.category) f = f.filter(e=>e.category===args.category);
    if (args.date_from) f = f.filter(e=>e.date>=args.date_from);
    if (args.date_to)   f = f.filter(e=>e.date<=args.date_to);
    f.sort((a,b)=> args.sort_by==="amount"
      ? (args.sort_order==="asc"?a.amount-b.amount:b.amount-a.amount)
      : (args.sort_order==="asc"?a.date.localeCompare(b.date):b.date.localeCompare(a.date)));
    if (args.limit) f = f.slice(0,args.limit);
    result = { expenses:f, total:f.reduce((s,e)=>s+e.amount,0), count:f.length };
  } else if (name==="update_expense") {
    const sorted = [...expenses].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
    const target = args.id ? expenses.find(e=>e.id===args.id) : sorted[(args.last_n||1)-1];
    if (target) {
      const u = {...target,
        ...(args.amount!==undefined&&{amount:Number(args.amount)}),
        ...(args.category&&{category:args.category}),
        ...(args.description&&{description:args.description}),
        ...(args.merchant&&{merchant:args.merchant}),
        ...(args.method&&{method:args.method})};
      sc.updateExpense = u; result = { success:true, updated:u };
    } else result = { success:false, error:"Not found" };
  } else if (name==="delete_expense") {
    let del = [];
    if (args.id) del = expenses.filter(e=>e.id===args.id);
    else if (args.last_n) del = [...expenses].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,args.last_n);
    else { let f=[...expenses];
      if(args.category)f=f.filter(e=>e.category===args.category);
      if(args.date_from)f=f.filter(e=>e.date>=args.date_from);
      if(args.date_to)f=f.filter(e=>e.date<=args.date_to); del=f; }
    sc.deleteIds = del.map(e=>e.id); result = { success:true, deleted:del.length, expenses:del };
  } else if (name==="get_budget_status") {
    const m=nowM(), me=expenses.filter(e=>e.date.startsWith(m));
    result = { budgets: budgets.filter(b=>!args.category||b.category===args.category).map(b=>{
      const s=me.filter(e=>e.category===b.category).reduce((t,e)=>t+e.amount,0);
      return {category:b.category,limit:b.limit,spent:s,remaining:b.limit-s,pct:Math.round(s/b.limit*100)};
    })};
  } else if (name==="get_insights") {
    const df = args.period==="this_week" ? new Date(Date.now()-7*86400000).toISOString().split("T")[0] : nowM()+"-01";
    const f = expenses.filter(e=>e.date>=df);
    const bc = {}; f.forEach(e=>{bc[e.category]=(bc[e.category]||0)+e.amount;});
    result = { total:f.reduce((s,e)=>s+e.amount,0), by_category:bc,
      top:Object.entries(bc).sort((a,b)=>b[1]-a[1]).slice(0,3), count:f.length };
  }
  return { result, sc };
}

/* ═══════════════════════════════════════════════════════════════
   UI ATOMS
═══════════════════════════════════════════════════════════════ */
const Card = ({children,style,cls="card-hover fadeup"}) => (
  <div className={cls} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 22px",...style}}>{children}</div>
);
const SectionTitle = ({children,action}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
    <div style={{fontSize:10,letterSpacing:"2px",textTransform:"uppercase",color:C.faint,fontWeight:600}}>{children}</div>
    {action}
  </div>
);
const Badge = ({color,children,style}) => (
  <span style={{background:color+"22",color,borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4,...style}}>{children}</span>
);
const Spinner = ({size=16}) => (
  <div style={{width:size,height:size,border:`2px solid ${C.border2}`,borderTop:`2px solid ${C.accent}`,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
);
const ChartTip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"#111325",border:`1px solid ${C.border2}`,borderRadius:10,padding:"9px 14px",fontFamily:F}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:5}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{fontSize:13,fontWeight:700,color:p.color||C.accent,fontVariantNumeric:"tabular-nums"}}>
          {p.name&&<span style={{color:C.faint,fontWeight:400,marginRight:6,fontSize:11}}>{p.name}</span>}
          ${fmt(p.value)}
        </div>
      ))}
    </div>
  );
};
const Inp = ({style,...p}) => (
  <input style={{background:"#07091a",border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 13px",
    color:C.text,fontSize:13,outline:"none",width:"100%",...style}}
    onFocus={e=>e.target.style.borderColor=C.accent+"66"}
    onBlur={e=>e.target.style.borderColor=C.border} {...p}/>
);
const Sel = ({style,children,...p}) => (
  <select style={{background:"#07091a",border:`1px solid ${C.border}`,borderRadius:9,
    padding:"9px 12px",color:C.muted,fontSize:12,outline:"none",cursor:"pointer",...style}} {...p}>{children}</select>
);
const Btn = ({children,variant="primary",style,...p}) => {
  const vs = {
    primary: {background:`linear-gradient(135deg,${C.accent},#00b86e)`,color:"#04060e",border:"none"},
    ghost:   {background:"transparent",color:C.muted,border:`1px solid ${C.border}`},
    danger:  {background:"#f56c6c18",color:C.danger,border:`1px solid #f56c6c33`},
  };
  return (
    <button className={variant==="ghost"?"btn-ghost":""} style={{borderRadius:9,padding:"9px 18px",fontSize:12,fontWeight:700,
      cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7,transition:"opacity .15s,transform .1s",...vs[variant],...style}}
      onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} {...p}>{children}</button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AUTH SCREEN
═══════════════════════════════════════════════════════════════ */
function AuthScreen({onLogin}) {
  const [mode,setMode] = useState("login");
  const [f,setF] = useState({name:"",email:"",password:"",confirm:""});
  const [key,setKey] = useState("");
  const [err,setErr] = useState("");
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = () => {
    if (!f.email||!f.password) return setErr("Email and password required.");
    if (mode==="signup") {
      if (!f.name) return setErr("Name is required.");
      if (f.password.length<6) return setErr("Password must be at least 6 characters.");
      if (f.password!==f.confirm) return setErr("Passwords do not match.");
    }
    if (!key.trim()) return setErr("Gemini API key is required.");
    onLogin({name:f.name||f.email.split("@")[0],email:f.email},key);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,position:"relative",overflow:"hidden"}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`,backgroundSize:"50px 50px",opacity:.35}}/>
      <div style={{position:"absolute",top:"10%",left:"50%",transform:"translateX(-50%)",width:700,height:500,background:`radial-gradient(ellipse,${C.accent}0d 0%,transparent 70%)`,pointerEvents:"none"}}/>
      <div className="fadeup" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,padding:"44px 44px",width:430,position:"relative",zIndex:1,boxShadow:"0 24px 80px #00000060"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <div style={{width:42,height:42,borderRadius:13,background:`linear-gradient(135deg,${C.accent},${C.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#04060e",animation:"glow 2s ease infinite"}}>₮</div>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:C.text,letterSpacing:"-0.4px"}}>Spendify AI</div>
            <div style={{fontSize:9,color:C.faint,letterSpacing:"2.5px",textTransform:"uppercase"}}>Finance Intelligence</div>
          </div>
        </div>
        <div style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:5}}>{mode==="login"?"Welcome back 👋":"Create account"}</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:26}}>{mode==="login"?"Sign in to your workspace":"Start tracking smarter with AI"}</div>
        <div style={{display:"flex",background:"#07091a",borderRadius:11,padding:4,marginBottom:24,border:`1px solid ${C.border}`}}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{flex:1,padding:"8px",borderRadius:8,border:"none",fontFamily:F,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .2s",background:mode===m?`linear-gradient(135deg,${C.accent},#00b86e)`:"transparent",color:mode===m?"#04060e":C.faint}}>
              {m==="login"?"Sign In":"Sign Up"}
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {mode==="signup"&&<Inp placeholder="Full name" value={f.name} onChange={e=>set("name",e.target.value)}/>}
          <Inp type="email" placeholder="Email address" value={f.email} onChange={e=>set("email",e.target.value)}/>
          <Inp type="password" placeholder="Password (min 6 chars)" value={f.password} onChange={e=>set("password",e.target.value)}/>
          {mode==="signup"&&<Inp type="password" placeholder="Confirm password" value={f.confirm} onChange={e=>set("confirm",e.target.value)}/>}
          <div>
            <div style={{fontSize:11,color:C.muted,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
              <span>🔑</span> Gemini API Key
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{color:C.accent,fontSize:10,marginLeft:"auto",textDecoration:"none"}}>Get free key →</a>
            </div>
            <Inp type="password" placeholder="AIza..." value={key} onChange={e=>setKey(e.target.value)}/>
          </div>
          {err&&<div style={{fontSize:12,color:C.danger,background:"#f56c6c14",borderRadius:8,padding:"9px 13px",border:`1px solid #f56c6c22`}}>{err}</div>}
          <Btn onClick={submit} style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:13,marginTop:4}}>
            {mode==="login"?"Sign In →":"Create Account →"}
          </Btn>
        </div>
        <div style={{textAlign:"center",marginTop:18,fontSize:11,color:C.faint}}>Your API key stays in memory — never stored or shared.</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPENSE MODAL (Add + Edit)
═══════════════════════════════════════════════════════════════ */
function ExpenseModal({categories,initial,onSave,onClose}) {
  const [f,setF] = useState(initial||{amount:"",category:"food",description:"",merchant:"",date:today(),method:"Card"});
  const [err,setErr] = useState("");
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const submit = () => {
    if (!f.amount||isNaN(Number(f.amount))||Number(f.amount)<=0) return setErr("Enter a valid amount greater than 0.");
    if (!f.date) return setErr("Date is required.");
    onSave({...f,amount:Number(f.amount)});
    onClose();
  };
  return (
    <div className="fadein" style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)"}}>
      <div className="fadeup" style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:20,padding:"30px 32px",width:460,fontFamily:F,boxShadow:"0 32px 100px #00000070",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontSize:18,fontWeight:800,color:C.text}}>{initial?"Edit Expense":"Add Expense"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.faint,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Amount ($) *</label>
            <Inp type="number" placeholder="0.00" value={f.amount} onChange={e=>set("amount",e.target.value)} style={{fontSize:26,fontWeight:800,fontFamily:M,letterSpacing:"-0.5px"}}/>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Category *</label>
            <Sel value={f.category} onChange={e=>set("category",e.target.value)} style={{width:"100%"}}>
              {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </Sel>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Payment Method</label>
            <Sel value={f.method} onChange={e=>set("method",e.target.value)} style={{width:"100%"}}>
              {METHODS.map(m=><option key={m}>{m}</option>)}
            </Sel>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Description</label>
            <Inp placeholder="What was this for?" value={f.description} onChange={e=>set("description",e.target.value)}/>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Merchant / Vendor</label>
            <Inp placeholder="Store name" value={f.merchant} onChange={e=>set("merchant",e.target.value)}/>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6}}>Date *</label>
            <Inp type="date" value={f.date} onChange={e=>set("date",e.target.value)}/>
          </div>
        </div>
        {err&&<div style={{marginTop:14,fontSize:12,color:C.danger,background:"#f56c6c14",borderRadius:8,padding:"9px 13px"}}>{err}</div>}
        <div style={{display:"flex",gap:10,marginTop:22}}>
          <Btn variant="ghost" onClick={onClose} style={{flex:1,justifyContent:"center"}}>Cancel</Btn>
          <Btn onClick={submit} style={{flex:2,justifyContent:"center"}}>{initial?"Save Changes":"Add Expense"}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard({expenses,budgets,categories,setPage}) {
  const m = nowM();
  const mExp = expenses.filter(e=>e.date.startsWith(m));
  const total = mExp.reduce((s,e)=>s+e.amount,0);
  const prevTotal = expenses.filter(e=>e.date.startsWith("2026-02")).reduce((s,e)=>s+e.amount,0);
  const pctChg = prevTotal ? ((total-prevTotal)/prevTotal*100).toFixed(1) : 0;
  const biggest = mExp.length ? Math.max(...mExp.map(e=>e.amount)) : 0;
  const byCat = {}; mExp.forEach(e=>{byCat[e.category]=(byCat[e.category]||0)+e.amount;});
  const pieData = categories.filter(c=>byCat[c.id]).map(c=>({name:c.name,value:byCat[c.id],color:c.color,icon:c.icon}));
  const stats = [
    {label:"Total Spent",    value:`$${fmt(total)}`,  sub:`${pctChg>0?"↑":"↓"} ${Math.abs(pctChg)}% vs Feb`, color:C.accent,  icon:"💸"},
    {label:"Transactions",   value:mExp.length,        sub:`${expenses.length} all-time`,                      color:C.accent2, icon:"🧾"},
    {label:"Daily Average",  value:`$${fmt(total/8)}`, sub:"Mar 2026 (8 days)",                                color:C.purple,  icon:"📅"},
    {label:"Biggest Spend",  value:`$${fmt(biggest)}`, sub:mExp.sort((a,b)=>b.amount-a.amount)[0]?.description||"—", color:C.warn, icon:"🔝"},
  ];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:16}}>
        {stats.map((s,i)=>(
          <Card key={i} style={{borderTop:`2px solid ${s.color}`,animationDelay:`${i*.06}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:C.faint,fontWeight:600}}>{s.label}</div>
              <span style={{fontSize:22,opacity:.2}}>{s.icon}</span>
            </div>
            <div style={{fontSize:26,fontWeight:800,color:C.text,margin:"8px 0 5px",letterSpacing:"-0.5px",fontVariantNumeric:"tabular-nums"}}>{s.value}</div>
            <div style={{fontSize:11,color:C.muted}}>{s.sub}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <SectionTitle>6-Month Spending Trend (Line Chart)</SectionTitle>
          <ResponsiveContainer width="100%" height={195}>
            <LineChart data={TREND_DATA}>
              <XAxis dataKey="month" tick={{fill:C.faint,fontSize:10,fontFamily:F}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.faint,fontSize:10,fontFamily:F}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={48}/>
              <Tooltip content={<ChartTip/>}/>
              <Legend formatter={v=><span style={{color:C.muted,fontSize:11}}>{v}</span>}/>
              <Line type="monotone" dataKey="amount" stroke={C.accent} strokeWidth={2.5} dot={{fill:C.accent,r:3}} name="This Period" activeDot={{r:5}}/>
              <Line type="monotone" dataKey="prev" stroke={C.border2} strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Previous"/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>Category Breakdown (Pie)</SectionTitle>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <ResponsiveContainer width={130} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" paddingAngle={3}>
                  {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip content={<ChartTip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>
              {pieData.slice(0,5).map((d,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:d.color,flexShrink:0}}/>
                    <span style={{fontSize:11,color:C.muted}}>{d.name.split(" ")[0]}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:C.text,fontVariantNumeric:"tabular-nums"}}>${fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <SectionTitle action={<button onClick={()=>setPage("transactions")} style={{fontSize:11,color:C.accent,background:"none",border:"none",cursor:"pointer",fontFamily:F}}>View all →</button>}>
            Recent Transactions
          </SectionTitle>
          {expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,6).map(e=>{
            const cat=categories.find(c=>c.id===e.category)||categories[6];
            return (
              <div key={e.id} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:34,height:34,borderRadius:9,background:(cat?.color||"#888")+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{cat?.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description||e.merchant||cat?.name}</div>
                  <div style={{fontSize:10,color:C.faint}}>{e.date} · {e.method}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.danger,fontVariantNumeric:"tabular-nums",flexShrink:0}}>-${fmt(e.amount)}</div>
              </div>
            );
          })}
        </Card>
        <Card>
          <SectionTitle action={<button onClick={()=>setPage("budgets")} style={{fontSize:11,color:C.accent,background:"none",border:"none",cursor:"pointer",fontFamily:F}}>Manage →</button>}>
            Budget Health
          </SectionTitle>
          {budgets.map(b=>{
            const cat=categories.find(c=>c.id===b.category);
            const spent=mExp.filter(e=>e.category===b.category).reduce((s,e)=>s+e.amount,0);
            const pct=Math.min((spent/b.limit)*100,100);
            const danger=pct>85;
            return (
              <div key={b.id} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:5}}>
                  <span style={{color:C.text,fontWeight:600}}>{cat?.icon} {cat?.name}</span>
                  <span style={{color:danger?C.danger:C.muted,fontVariantNumeric:"tabular-nums"}}>${fmt(spent)} / ${b.limit}</span>
                </div>
                <div style={{height:5,background:C.border,borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,borderRadius:99,transition:"width .6s",background:pct>100?C.danger:danger?C.warn:(cat?.color||C.accent)}}/>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSACTIONS — ALL FILTERS: date range, amount range,
   category, method, search, sort by date/amount/category
═══════════════════════════════════════════════════════════════ */
function Transactions({expenses,categories,onDelete,onEdit,onAddNew}) {
  const [search,   setSearch]   = useState("");
  const [catF,     setCatF]     = useState("all");
  const [methodF,  setMethodF]  = useState("all");
  const [sortBy,   setSortBy]   = useState("date");
  const [sortDir,  setSortDir]  = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [minAmt,   setMinAmt]   = useState("");
  const [maxAmt,   setMaxAmt]   = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const PER = 8;

  const activeCount = [catF!=="all",methodF!=="all",dateFrom,dateTo,minAmt,maxAmt,search].filter(Boolean).length;

  const filtered = expenses.filter(e => {
    const q = search.toLowerCase();
    if (catF!=="all"&&e.category!==catF) return false;
    if (methodF!=="all"&&e.method!==methodF) return false;
    if (dateFrom&&e.date<dateFrom) return false;
    if (dateTo&&e.date>dateTo) return false;
    if (minAmt&&e.amount<Number(minAmt)) return false;
    if (maxAmt&&e.amount>Number(maxAmt)) return false;
    if (q&&!e.description?.toLowerCase().includes(q)&&!e.merchant?.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a,b) => {
    if (sortBy==="amount") return sortDir==="asc"?a.amount-b.amount:b.amount-a.amount;
    if (sortBy==="category") return sortDir==="asc"?a.category.localeCompare(b.category):b.category.localeCompare(a.category);
    return sortDir==="asc"?a.date.localeCompare(b.date):b.date.localeCompare(a.date);
  });

  const pages = Math.max(1,Math.ceil(filtered.length/PER));
  const paged = filtered.slice((page-1)*PER,page*PER);
  const totalF = filtered.reduce((s,e)=>s+e.amount,0);

  const clearAll = () => { setSearch("");setCatF("all");setMethodF("all");setDateFrom("");setDateTo("");setMinAmt("");setMaxAmt("");setPage(1); };
  const toggleSort = col => { if(sortBy===col)setSortDir(d=>d==="asc"?"desc":"asc"); else{setSortBy(col);setSortDir("desc");} };
  const SI = ({col}) => sortBy===col ? <span style={{color:C.accent,fontSize:10}}>{sortDir==="asc"?"↑":"↓"}</span> : <span style={{color:C.faint,fontSize:10}}>↕</span>;

  const exportCSV = () => {
    const hdr = ["ID","Date","Amount","Category","Description","Merchant","Method"];
    const rows = filtered.map(e=>[e.id,e.date,e.amount,e.category,`"${e.description}"`,`"${e.merchant}"`,e.method]);
    const csv = [hdr,...rows].map(r=>r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `expenses_${today()}.csv`; a.click();
  };

  return (
    <div>
      {/* Top search + action bar */}
      <div style={{display:"flex",gap:10,marginBottom:10,alignItems:"center"}}>
        <Inp placeholder="🔍  Search by description or merchant name..." value={search}
          onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{flex:1}}/>
        <Btn variant={showFilters?"primary":"ghost"} onClick={()=>setShowFilters(v=>!v)} style={{flexShrink:0}}>
          ⚙ Filters {activeCount>0&&<Badge color={C.warn} style={{padding:"1px 6px",fontSize:10}}>{activeCount}</Badge>}
        </Btn>
        <Btn variant="ghost" onClick={exportCSV} style={{flexShrink:0}}>⬇ Export CSV</Btn>
        <Btn onClick={onAddNew} style={{flexShrink:0}}>+ Add</Btn>
      </div>

      {/* FILTER PANEL — date range, amount range, category, method, sort */}
      {showFilters && (
        <Card cls="fadein" style={{marginBottom:14,padding:"18px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:600}}>🔧 Filter & Sort Options</div>
            {activeCount>0&&<button onClick={clearAll} style={{fontSize:11,color:C.danger,background:"none",border:"none",cursor:"pointer",fontFamily:F}}>✕ Clear All Filters</button>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {/* Row 1: category, method, sort */}
            <div>
              <label style={{fontSize:10,color:C.faint,display:"block",marginBottom:5,letterSpacing:"1.5px",textTransform:"uppercase"}}>Category</label>
              <Sel value={catF} onChange={e=>{setCatF(e.target.value);setPage(1);}} style={{width:"100%"}}>
                <option value="all">All Categories</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </Sel>
            </div>
            <div>
              <label style={{fontSize:10,color:C.faint,display:"block",marginBottom:5,letterSpacing:"1.5px",textTransform:"uppercase"}}>Payment Method</label>
              <Sel value={methodF} onChange={e=>{setMethodF(e.target.value);setPage(1);}} style={{width:"100%"}}>
                <option value="all">All Methods</option>
                {METHODS.map(m=><option key={m}>{m}</option>)}
              </Sel>
            </div>
            <div>
              <label style={{fontSize:10,color:C.faint,display:"block",marginBottom:5,letterSpacing:"1.5px",textTransform:"uppercase"}}>Sort By</label>
              <div style={{display:"flex",gap:6}}>
                <Sel value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{flex:1}}>
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </Sel>
                <Sel value={sortDir} onChange={e=>setSortDir(e.target.value)} style={{width:90}}>
                  <option value="desc">↓ Desc</option>
                  <option value="asc">↑ Asc</option>
                </Sel>
              </div>
            </div>
            {/* Row 2: date range + amount range */}
            <div>
              <label style={{fontSize:10,color:C.faint,display:"block",marginBottom:5,letterSpacing:"1.5px",textTransform:"uppercase"}}>📅 Date From</label>
              <Inp type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1);}}/>
            </div>
            <div>
              <label style={{fontSize:10,color:C.faint,display:"block",marginBottom:5,letterSpacing:"1.5px",textTransform:"uppercase"}}>📅 Date To</label>
              <Inp type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <label style={{fontSize:10,color:C.faint,display:"block",marginBottom:5,letterSpacing:"1.5px",textTransform:"uppercase"}}>💲 Min $</label>
                <Inp type="number" placeholder="0" value={minAmt} onChange={e=>{setMinAmt(e.target.value);setPage(1);}}/>
              </div>
              <div>
                <label style={{fontSize:10,color:C.faint,display:"block",marginBottom:5,letterSpacing:"1.5px",textTransform:"uppercase"}}>💲 Max $</label>
                <Inp type="number" placeholder="∞" value={maxAmt} onChange={e=>{setMaxAmt(e.target.value);setPage(1);}}/>
              </div>
            </div>
          </div>
          {/* Active filter chips */}
          {activeCount>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>
              {search&&<Badge color={C.accent2}>Search: "{search}" <button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:3,fontSize:12}}>×</button></Badge>}
              {catF!=="all"&&<Badge color={C.accent}>{categories.find(c=>c.id===catF)?.icon} {catF} <button onClick={()=>setCatF("all")} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:3,fontSize:12}}>×</button></Badge>}
              {methodF!=="all"&&<Badge color={C.purple}>{methodF} <button onClick={()=>setMethodF("all")} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:3,fontSize:12}}>×</button></Badge>}
              {dateFrom&&<Badge color={C.warn}>From: {dateFrom} <button onClick={()=>setDateFrom("")} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:3,fontSize:12}}>×</button></Badge>}
              {dateTo&&<Badge color={C.warn}>To: {dateTo} <button onClick={()=>setDateTo("")} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:3,fontSize:12}}>×</button></Badge>}
              {minAmt&&<Badge color={C.danger}>Min: ${minAmt} <button onClick={()=>setMinAmt("")} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:3,fontSize:12}}>×</button></Badge>}
              {maxAmt&&<Badge color={C.danger}>Max: ${maxAmt} <button onClick={()=>setMaxAmt("")} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:3,fontSize:12}}>×</button></Badge>}
            </div>
          )}
        </Card>
      )}

      {/* Table */}
      <Card cls="fadeup" style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"13px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,color:C.muted}}>
            <strong style={{color:C.text}}>{filtered.length}</strong> results · Total:
            <strong style={{color:C.accent,fontVariantNumeric:"tabular-nums"}}> ${fmt(totalF)}</strong>
          </div>
          {activeCount>0&&<Badge color={C.warn}>{activeCount} filter{activeCount>1?"s":""} active</Badge>}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
            <thead>
              <tr style={{background:"#080a17"}}>
                {[["date","Date"],["","Category"],["","Description"],["","Merchant"],["","Method"],["amount","Amount"],["category","Sort↕"],["","Actions"]].map(([col,h],i)=>(
                  <th key={i} onClick={()=>col&&toggleSort(col)}
                    style={{textAlign:"left",padding:"10px 14px",color:C.faint,fontSize:10,letterSpacing:"1.5px",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,cursor:col?"pointer":"default",userSelect:"none",whiteSpace:"nowrap"}}>
                    {h} {col&&<SI col={col}/>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(e=>{
                const cat=categories.find(c=>c.id===e.category)||categories[6];
                return (
                  <tr key={e.id} className="row-hover" style={{borderBottom:`1px solid ${C.border}`,transition:"background .12s"}}>
                    <td style={{padding:"10px 14px",color:C.muted,fontSize:11,fontFamily:M}}>{e.date}</td>
                    <td style={{padding:"10px 14px"}}><Badge color={cat.color}>{cat.icon} {cat.name.split(" ")[0]}</Badge></td>
                    <td style={{padding:"10px 14px",color:C.text,maxWidth:150}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description||"—"}</div></td>
                    <td style={{padding:"10px 14px",color:C.muted}}>{e.merchant||"—"}</td>
                    <td style={{padding:"10px 14px",color:C.faint,fontSize:11}}>{e.method}</td>
                    <td style={{padding:"10px 14px",color:C.danger,fontWeight:700,fontFamily:M,fontVariantNumeric:"tabular-nums"}}>-${fmt(e.amount)}</td>
                    <td style={{padding:"10px 14px",color:C.faint,fontSize:11}}>{cat.name.split(" ")[0]}</td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>onEdit(e)} style={{background:"none",border:"none",color:C.faint,cursor:"pointer",fontSize:13,padding:"3px 7px",borderRadius:5}}
                          onMouseEnter={el=>el.target.style.color=C.accent2} onMouseLeave={el=>el.target.style.color=C.faint}>✎</button>
                        <button onClick={()=>onDelete(e.id)} style={{background:"none",border:"none",color:C.faint,cursor:"pointer",fontSize:13,padding:"3px 7px",borderRadius:5}}
                          onMouseEnter={el=>el.target.style.color=C.danger} onMouseLeave={el=>el.target.style.color=C.faint}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"50px 0",color:C.faint,fontSize:13}}>
            No transactions match your filters.
            {activeCount>0&&<button onClick={clearAll} style={{display:"block",margin:"10px auto 0",color:C.accent,background:"none",border:"none",cursor:"pointer",fontFamily:F,fontSize:12}}>Clear all filters</button>}
          </div>
        )}
        {pages>1&&(
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,padding:"14px",borderTop:`1px solid ${C.border}`}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{background:"none",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 11px",color:page===1?C.faint:C.muted,cursor:page===1?"default":"pointer",fontFamily:F,fontSize:12}}>←</button>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)}
                style={{width:30,height:30,borderRadius:7,border:`1px solid ${p===page?C.accent:C.border}`,background:p===page?C.accent+"22":"transparent",color:p===page?C.accent:C.faint,fontFamily:F,fontSize:12,cursor:"pointer"}}>{p}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
              style={{background:"none",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 11px",color:page===pages?C.faint:C.muted,cursor:page===pages?"default":"pointer",fontFamily:F,fontSize:12}}>→</button>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════════════════════════ */
function CategoriesPage({categories,setCategories,expenses}) {
  const [newName,setNewName] = useState("");
  const [newIcon,setNewIcon] = useState("📦");
  const [newColor,setNewColor] = useState(C.accent);
  const PALETTE = [C.accent,C.accent2,C.warn,"#f472b6","#a78bfa","#fb923c","#34d399","#64748b","#e11d48","#0ea5e9"];

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:18}}>
        {categories.map(cat=>{
          const txns = expenses.filter(e=>e.category===cat.id);
          const total = txns.reduce((s,e)=>s+e.amount,0);
          const isDefault = !!DEFAULT_CATEGORIES.find(c=>c.id===cat.id);
          return (
            <Card key={cat.id} style={{borderLeft:`3px solid ${cat.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:40,height:40,borderRadius:11,background:cat.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{cat.icon}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{cat.name}</div>
                    <div style={{fontSize:10,color:C.faint}}>{txns.length} transactions</div>
                  </div>
                </div>
                {!isDefault&&<button onClick={()=>setCategories(p=>p.filter(c=>c.id!==cat.id))}
                  style={{background:"none",border:"none",color:C.faint,cursor:"pointer",fontSize:15}}
                  onMouseEnter={e=>e.target.style.color=C.danger} onMouseLeave={e=>e.target.style.color=C.faint}>✕</button>}
              </div>
              <div style={{fontSize:20,fontWeight:800,color:cat.color,fontVariantNumeric:"tabular-nums"}}>${fmt(total)}</div>
              {isDefault&&<div style={{fontSize:9,color:C.faint,marginTop:3,textTransform:"uppercase",letterSpacing:"1px"}}>Default category</div>}
            </Card>
          );
        })}
      </div>
      <Card>
        <SectionTitle>Add Custom Category</SectionTitle>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:5}}>Icon</label>
            <Inp value={newIcon} onChange={e=>setNewIcon(e.target.value)} style={{width:58,textAlign:"center",fontSize:24}}/></div>
          <div style={{flex:1,minWidth:180}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:5}}>Category Name</label>
            <Inp placeholder="e.g. Fitness, Travel..." value={newName} onChange={e=>setNewName(e.target.value)}/></div>
          <div><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:5}}>Color</label>
            <div style={{display:"flex",gap:5,paddingTop:4}}>
              {PALETTE.map(c=><button key={c} onClick={()=>setNewColor(c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:`2.5px solid ${newColor===c?"#fff":"transparent"}`,transition:"border .15s"}}/>)}
            </div>
          </div>
          <Btn onClick={()=>{
            if(!newName.trim())return;
            setCategories(p=>[...p,{id:newName.toLowerCase().replace(/\s+/g,"_")+Date.now(),name:newName,icon:newIcon,color:newColor}]);
            setNewName("");setNewIcon("📦");
          }}>+ Add</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BUDGETS
═══════════════════════════════════════════════════════════════ */
function BudgetsPage({budgets,setBudgets,expenses,categories}) {
  const m = nowM();
  const mExp = expenses.filter(e=>e.date.startsWith(m));
  const [editId,setEditId] = useState(null);
  const [editVal,setEditVal] = useState("");
  const [newCat,setNewCat] = useState("food");
  const [newLim,setNewLim] = useState("");

  const availCats = categories.filter(c=>!budgets.find(b=>b.category===c.id&&b.month===m));

  const compareData = categories.filter(c=>budgets.find(b=>b.category===c.id)).map(c=>{
    const curr = mExp.filter(e=>e.category===c.id).reduce((s,e)=>s+e.amount,0);
    const prev = expenses.filter(e=>e.date.startsWith("2026-02")&&e.category===c.id).reduce((s,e)=>s+e.amount,0);
    const b = budgets.find(b=>b.category===c.id);
    return {cat:c.name.split(" ")[0],curr,prev,limit:b?.limit||0};
  });

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14,marginBottom:18}}>
        {budgets.map(b=>{
          const cat = categories.find(c=>c.id===b.category);
          const spent = mExp.filter(e=>e.category===b.category).reduce((s,e)=>s+e.amount,0);
          const pct = (spent/b.limit)*100;
          const over=pct>100, danger=pct>85;
          const barColor = over?C.danger:danger?C.warn:(cat?.color||C.accent);
          return (
            <Card key={b.id} style={{borderTop:`2px solid ${barColor}`,animationDelay:`${b.id*.04}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:22}}>{cat?.icon}</span>
                  <div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{cat?.name}</div>
                    <div style={{fontSize:10,color:C.faint}}>March 2026</div></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:24,fontWeight:800,color:barColor,fontVariantNumeric:"tabular-nums"}}>{Math.round(pct)}%</div>
                  <div style={{fontSize:9,color:C.faint,textTransform:"uppercase",letterSpacing:"1px"}}>used</div>
                </div>
              </div>
              <div style={{height:8,background:C.border,borderRadius:99,overflow:"hidden",marginBottom:12}}>
                <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:barColor,borderRadius:99,transition:"width .6s ease"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[["Spent",`$${fmt(spent)}`,over?C.danger:C.text],["Remaining",`$${fmt(Math.max(b.limit-spent,0))}`,over?C.danger:C.accent],["Limit",`$${b.limit}`,C.muted]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center",background:C.border+"44",borderRadius:8,padding:"7px 4px"}}>
                    <div style={{fontSize:9,color:C.faint,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>{l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:c,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                  </div>
                ))}
              </div>
              {editId===b.id ? (
                <div style={{display:"flex",gap:7}}>
                  <Inp type="number" value={editVal} onChange={e=>setEditVal(e.target.value)} style={{fontSize:13}}/>
                  <Btn onClick={()=>{setBudgets(bs=>bs.map(x=>x.id===b.id?{...x,limit:Number(editVal)}:x));setEditId(null);}} style={{padding:"8px 12px"}}>✓</Btn>
                  <Btn variant="ghost" onClick={()=>setEditId(null)} style={{padding:"8px 12px"}}>✕</Btn>
                </div>
              ) : (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <button onClick={()=>{setEditId(b.id);setEditVal(b.limit);}} style={{fontSize:11,color:C.accent2,background:"none",border:"none",cursor:"pointer",fontFamily:F}}>Edit limit</button>
                  <button onClick={()=>setBudgets(bs=>bs.filter(x=>x.id!==b.id))} style={{fontSize:11,color:C.faint,background:"none",border:"none",cursor:"pointer",fontFamily:F}}
                    onMouseEnter={e=>e.target.style.color=C.danger} onMouseLeave={e=>e.target.style.color=C.faint}>Remove</button>
                </div>
              )}
              {(over||danger)&&<div style={{marginTop:10,padding:"8px 11px",background:barColor+"18",borderRadius:8,fontSize:11,color:barColor,fontWeight:600}}>
                {over?"⛔ Over budget — exceeded limit!":"⚠️ Approaching budget limit"}
              </div>}
            </Card>
          );
        })}
        {availCats.length>0&&(
          <Card style={{border:`1px dashed ${C.border2}`,display:"flex",flexDirection:"column",gap:12,justifyContent:"center",minHeight:200}}>
            <div style={{fontSize:11,color:C.faint,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px"}}>+ Set New Budget</div>
            <Sel value={newCat} onChange={e=>setNewCat(e.target.value)} style={{width:"100%"}}>
              {availCats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </Sel>
            <Inp type="number" placeholder="Monthly limit ($)" value={newLim} onChange={e=>setNewLim(e.target.value)}/>
            <Btn onClick={()=>{if(!newLim)return;setBudgets(bs=>[...bs,{id:nextId(bs),category:newCat,limit:Number(newLim),month:m}]);setNewLim("");}} style={{width:"100%",justifyContent:"center"}}>Set Budget</Btn>
          </Card>
        )}
      </div>
      <Card>
        <SectionTitle>Month-over-Month: Budget vs Actual Spending (Bar Chart)</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={compareData} barCategoryGap="30%" barGap={3}>
            <XAxis dataKey="cat" tick={{fill:C.faint,fontSize:11,fontFamily:F}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.faint,fontSize:11,fontFamily:F}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={50}/>
            <Tooltip content={<ChartTip/>}/>
            <Legend formatter={v=><span style={{color:C.muted,fontSize:11}}>{v}</span>}/>
            <Bar dataKey="prev"  fill={C.border2}  radius={[4,4,0,0]} name="Feb 2026"/>
            <Bar dataKey="curr"  fill={C.accent}   radius={[4,4,0,0]} name="Mar 2026"/>
            <Bar dataKey="limit" fill={C.warn+"66"} radius={[4,4,0,0]} name="Budget Limit"/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS — all chart types + budget progress + top merchants
═══════════════════════════════════════════════════════════════ */
function AnalyticsPage({expenses,categories,budgets}) {
  const m = nowM();
  const mExp = expenses.filter(e=>e.date.startsWith(m));

  const dailyMap = {}; mExp.forEach(e=>{dailyMap[e.date]=(dailyMap[e.date]||0)+e.amount;});
  const dailyArr = Object.entries(dailyMap).sort().map(([d,amount])=>({date:d.slice(5),amount}));

  const merch = {}; expenses.forEach(e=>{if(e.merchant)merch[e.merchant]=(merch[e.merchant]||0)+e.amount;});
  const topMerch = Object.entries(merch).sort((a,b)=>b[1]-a[1]).slice(0,6);

  const byMethod = {}; expenses.forEach(e=>{byMethod[e.method]=(byMethod[e.method]||0)+e.amount;});
  const methodData = Object.entries(byMethod).map(([name,value],i)=>({name,value,color:[C.accent,C.accent2,C.warn,"#f472b6","#a78bfa","#fb923c"][i%6]}));

  const byCat = {}; mExp.forEach(e=>{byCat[e.category]=(byCat[e.category]||0)+e.amount;});
  const catArr = categories.filter(c=>byCat[c.id]).map(c=>({...c,total:byCat[c.id]})).sort((a,b)=>b.total-a.total);
  const maxCat = catArr[0]?.total||1;

  const budgetProgress = budgets.map(b=>{
    const cat=categories.find(c=>c.id===b.category);
    const spent=mExp.filter(e=>e.category===b.category).reduce((s,e)=>s+e.amount,0);
    return {name:cat?.name||b.category,spent,limit:b.limit,pct:Math.round(spent/b.limit*100),color:cat?.color||C.accent};
  });

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <SectionTitle>Daily Spending — March 2026 (Bar Chart)</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={dailyArr}>
              <XAxis dataKey="date" tick={{fill:C.faint,fontSize:10,fontFamily:F}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.faint,fontSize:10,fontFamily:F}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={46}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="amount" fill={C.accent2} radius={[5,5,0,0]} name="Spent"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>Payment Method Distribution (Pie)</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={methodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                {methodData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<ChartTip/>}/>
              <Legend formatter={v=><span style={{color:C.muted,fontSize:10}}>{v}</span>} iconSize={8}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <SectionTitle>6-Month Trend — Area Chart</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent2} stopOpacity={.2}/>
                  <stop offset="95%" stopColor={C.accent2} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{fill:C.faint,fontSize:10,fontFamily:F}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.faint,fontSize:10,fontFamily:F}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={48}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="amount" stroke={C.accent2} strokeWidth={2.5} fill="url(#gb)" dot={{fill:C.accent2,r:3}} name="Total"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle>Budget Progress Indicators</SectionTitle>
          {budgetProgress.map((b,i)=>(
            <div key={i} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                <span style={{color:C.text,fontWeight:600}}>{b.name}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{color:C.muted,fontSize:11,fontVariantNumeric:"tabular-nums"}}>${fmt(b.spent)} / ${b.limit}</span>
                  <Badge color={b.pct>100?C.danger:b.pct>85?C.warn:C.accent} style={{padding:"1px 7px",fontSize:10}}>{b.pct}%</Badge>
                </div>
              </div>
              <div style={{height:6,background:C.border,borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(b.pct,100)}%`,background:b.pct>100?C.danger:b.pct>85?C.warn:b.color,borderRadius:99,transition:"width .6s ease"}}/>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <SectionTitle>Top Spending Categories</SectionTitle>
          {catArr.map((cat,i)=>(
            <div key={cat.id} style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
              <div style={{width:28,height:28,borderRadius:8,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{cat.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                  <span style={{color:C.text,fontWeight:600}}>{cat.name}</span>
                  <span style={{color:cat.color,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>${fmt(cat.total)}</span>
                </div>
                <div style={{height:4,background:C.border,borderRadius:99}}>
                  <div style={{height:"100%",width:`${(cat.total/maxCat)*100}%`,background:cat.color,borderRadius:99}}/>
                </div>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle>Top Merchants (All Time)</SectionTitle>
          {topMerch.map(([name,amount],i)=>{
            const colors=[C.accent,C.accent2,C.warn,"#f472b6","#a78bfa","#fb923c"];
            const c=colors[i%colors.length];
            return (
              <div key={name} style={{display:"flex",alignItems:"center",gap:11,marginBottom:13}}>
                <div style={{width:26,height:26,borderRadius:7,background:c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:c,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span style={{color:C.text,fontWeight:600}}>{name}</span>
                    <span style={{color:c,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>${fmt(amount)}</span>
                  </div>
                  <div style={{height:3,background:C.border,borderRadius:99}}>
                    <div style={{height:"100%",width:`${(amount/topMerch[0][1])*100}%`,background:c,borderRadius:99}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHAT PANEL
═══════════════════════════════════════════════════════════════ */
const QUICK_CHIPS = ["I spent $45 on groceries","How much this month?","Show top 5 expenses","Am I over budget?","Delete my last expense","Compare this vs last month","Add $12 uber + $5 coffee","Spending insights"];

function ChatPanel({apiKey,expenses,setExpenses,budgets,categories}) {
  const [msgs,setMsgs] = useState([{role:"assistant",text:"Hi! I'm your Gemini AI assistant 🤖\n\nI can add, update, delete expenses and give you insights. Try:\n• \"I spent $45 on groceries at Whole Foods\"\n• \"How much on food this month?\"\n• \"Delete my last expense\"\n• \"Am I on budget?\""}]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [history,setHistory] = useState([]);
  const endRef = useRef(null);
  const expRef = useRef(expenses);
  expRef.current = expenses;

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  const send = useCallback(async(text)=>{
    if (!text?.trim()||loading) return;
    setInput("");
    setMsgs(m=>[...m,{role:"user",text}]);
    setLoading(true);
    const sys = `You are a smart AI expense tracker assistant. Today: ${today()}. Yesterday: ${new Date(Date.now()-86400000).toISOString().split("T")[0]}. This month starts: ${nowM()}-01.
Current expenses (last 25): ${JSON.stringify(expRef.current.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,25))}
Categories: food|transport|bills|shopping|health|entertain|other. Methods: Card|UPI|Cash|Net Banking|Transfer|Wallet.
Always call a function tool. Smart auto-categorize. Respond concisely with emoji after tool execution.`;

    const newH = [...history,{role:"user",parts:[{text}]}];
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          system_instruction:{parts:[{text:sys}]},contents:newH,tools:GEMINI_TOOLS,
          generationConfig:{temperature:0.3,maxOutputTokens:1024}})});
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      let cand=d.candidates?.[0], parts=cand?.content?.parts||[];
      const fnCalls=parts.filter(p=>p.functionCall);
      if (fnCalls.length>0) {
        const fnResults=[];
        fnCalls.forEach(p=>{
          const {result,sc}=execFn(p.functionCall.name,p.functionCall.args,expRef.current,budgets,categories);
          fnResults.push({name:p.functionCall.name,response:{result}});
          if (sc.addExpenses) setExpenses(prev=>{const m=Math.max(0,...prev.map(e=>e.id));return[...prev,...sc.addExpenses.map((e,i)=>({...e,id:m+i+1}))];});
          if (sc.updateExpense) setExpenses(prev=>prev.map(e=>e.id===sc.updateExpense.id?sc.updateExpense:e));
          if (sc.deleteIds) setExpenses(prev=>prev.filter(e=>!sc.deleteIds.includes(e.id)));
        });
        const r2=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
            system_instruction:{parts:[{text:sys}]},
            contents:[...newH,{role:"model",parts:fnCalls.map(p=>({functionCall:p.functionCall}))},{role:"user",parts:fnResults.map(r=>({functionResponse:r}))}],
            generationConfig:{temperature:0.3,maxOutputTokens:1024}})});
        const d2=await r2.json();
        if(d2.error)throw new Error(d2.error.message);
        cand=d2.candidates?.[0]; parts=cand?.content?.parts||[];
      }
      const reply=parts.find(p=>p.text)?.text||"Done! ✅";
      setMsgs(m=>[...m,{role:"assistant",text:reply}]);
      setHistory([...newH,{role:"model",parts:[{text:reply}]}]);
    } catch(err) {
      setMsgs(m=>[...m,{role:"assistant",text:`❌ Error: ${err.message}\n\nCheck your Gemini API key.`}]);
    } finally { setLoading(false); }
  },[apiKey,history,budgets,categories,loading]);

  return (
    <div style={{width:330,background:C.sidebar,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{width:9,height:9,borderRadius:"50%",background:C.accent,boxShadow:`0 0 10px ${C.accent}`,animation:"glow 2s ease infinite",flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Gemini AI Assistant</div>
          <div style={{fontSize:10,color:C.faint}}>Natural language CRUD · gemini-2.0-flash</div>
        </div>
        <button onClick={()=>setHistory([])} style={{background:"none",border:"none",color:C.faint,cursor:"pointer",fontSize:11,fontFamily:F}} title="Clear history">↺</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 12px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{maxWidth:"93%",padding:"10px 13px",fontSize:12.5,lineHeight:1.65,whiteSpace:"pre-wrap",wordBreak:"break-word",
            borderRadius:m.role==="user"?"13px 13px 3px 13px":"13px 13px 13px 3px",
            background:m.role==="user"?`linear-gradient(135deg,${C.accent},#00b86e)`:"#111428",
            border:m.role==="user"?"none":`1px solid ${C.border}`,
            color:m.role==="user"?"#04060e":C.text,fontWeight:m.role==="user"?600:400,
            alignSelf:m.role==="user"?"flex-end":"flex-start"}}>{m.text}</div>
        ))}
        {loading&&<div style={{display:"flex",gap:5,padding:"12px 14px",background:"#111428",borderRadius:"13px 13px 13px 3px",border:`1px solid ${C.border}`,width:"fit-content"}}>
          {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.accent,animation:`pulse 1.2s ease ${i*.2}s infinite`}}/>)}
        </div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"8px 10px",borderTop:`1px solid ${C.border}`,display:"flex",flexWrap:"wrap",gap:5,flexShrink:0}}>
        {QUICK_CHIPS.map((q,i)=><button key={i} className="chip" onClick={()=>send(q)} style={{background:"#111428",border:`1px solid ${C.border}`,borderRadius:99,padding:"3px 9px",fontSize:10.5,color:C.muted,cursor:"pointer",fontFamily:F,transition:"all .15s"}}>{q}</button>)}
      </div>
      <div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"flex-end",flexShrink:0}}>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}}
          placeholder="Chat about your finances..." rows={1}
          style={{flex:1,background:"#07091a",border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:12.5,resize:"none",fontFamily:F,outline:"none",lineHeight:1.55,maxHeight:90}}
          onFocus={e=>e.target.style.borderColor=C.accent+"55"} onBlur={e=>e.target.style.borderColor=C.border}/>
        <button onClick={()=>send(input)} disabled={loading}
          style={{width:36,height:36,borderRadius:9,border:"none",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:loading?C.border:`linear-gradient(135deg,${C.accent},#00b86e)`,transition:"opacity .15s"}}>
          {loading?<Spinner size={15}/>:<span style={{color:"#04060e",fontWeight:900,fontSize:17}}>↑</span>}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
const NAV = [{id:"dashboard",label:"Dashboard",icon:"◈"},{id:"transactions",label:"Transactions",icon:"↕"},{id:"categories",label:"Categories",icon:"◎"},{id:"budgets",label:"Budgets",icon:"⬡"},{id:"analytics",label:"Analytics",icon:"∿"}];
const SUBS = {dashboard:"March 2026 Overview",transactions:"History · Filter · Search · Export",categories:"Predefined & custom categories",budgets:"Monthly limits & alerts",analytics:"Charts · Trends · Insights"};

function MainApp({user,apiKey,onLogout}) {
  const [page,setPage] = useState("dashboard");
  const [expenses,setExpenses] = useState(SEED_EXPENSES);
  const [categories,setCategories] = useState(DEFAULT_CATEGORIES);
  const [budgets,setBudgets] = useState(SEED_BUDGETS);
  const [showAdd,setShowAdd] = useState(false);
  const [editExp,setEditExp] = useState(null);

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:F,color:C.text,overflow:"hidden"}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{width:215,background:C.sidebar,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"22px 0",flexShrink:0}}>
        <div style={{padding:"0 18px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${C.accent},${C.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#04060e",animation:"glow 2s ease infinite",flexShrink:0}}>₮</div>
          <div><div style={{fontSize:15,fontWeight:800,letterSpacing:"-0.3px"}}>Spendify AI</div>
            <div style={{fontSize:9,color:C.faint,letterSpacing:"2px",textTransform:"uppercase"}}>Finance OS</div></div>
        </div>
        <div style={{padding:"18px 10px",flex:1}}>
          <div style={{fontSize:9,color:C.faint,letterSpacing:"2px",textTransform:"uppercase",padding:"0 8px 10px",fontWeight:600}}>Menu</div>
          {NAV.map(n=>(
            <div key={n.id} className="nav-item" onClick={()=>setPage(n.id)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:9,cursor:"pointer",marginBottom:2,fontSize:12.5,fontWeight:page===n.id?700:500,transition:"all .15s",background:page===n.id?C.accent+"14":"transparent",color:page===n.id?C.accent:C.muted,borderLeft:`2px solid ${page===n.id?C.accent:"transparent"}`}}>
              <span style={{fontSize:14,width:16,textAlign:"center"}}>{n.icon}</span>{n.label}
            </div>
          ))}
        </div>
        <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#04060e",flexShrink:0}}>{user.name[0].toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div style={{fontSize:9,color:C.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
            </div>
            <button onClick={onLogout} title="Logout" style={{background:"none",border:"none",color:C.faint,cursor:"pointer",fontSize:15,padding:3,flexShrink:0}}
              onMouseEnter={e=>e.target.style.color=C.danger} onMouseLeave={e=>e.target.style.color=C.faint}>⏻</button>
          </div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{height:58,background:C.sidebar,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,letterSpacing:"-0.2px"}}>{NAV.find(n=>n.id===page)?.label}</div>
            <div style={{fontSize:10,color:C.faint,marginTop:1}}>{SUBS[page]}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:11,color:C.muted,background:C.border,borderRadius:7,padding:"5px 11px",fontFamily:M}}>{expenses.length} records</div>
            <Btn onClick={()=>setShowAdd(true)}>+ Add Expense</Btn>
            <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent2},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer"}}>{user.name[0].toUpperCase()}</div>
          </div>
        </div>
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
            {page==="dashboard"    && <Dashboard    expenses={expenses} budgets={budgets} categories={categories} setPage={setPage}/>}
            {page==="transactions" && <Transactions expenses={expenses} categories={categories} onDelete={id=>setExpenses(p=>p.filter(e=>e.id!==id))} onEdit={e=>setEditExp(e)} onAddNew={()=>setShowAdd(true)}/>}
            {page==="categories"   && <CategoriesPage categories={categories} setCategories={setCategories} expenses={expenses}/>}
            {page==="budgets"      && <BudgetsPage  budgets={budgets} setBudgets={setBudgets} expenses={expenses} categories={categories}/>}
            {page==="analytics"    && <AnalyticsPage expenses={expenses} categories={categories} budgets={budgets}/>}
          </div>
          <ChatPanel apiKey={apiKey} expenses={expenses} setExpenses={setExpenses} budgets={budgets} categories={categories}/>
        </div>
      </div>
      {showAdd && <ExpenseModal categories={categories} onSave={e=>setExpenses(p=>[...p,{...e,id:nextId(p)}])} onClose={()=>setShowAdd(false)}/>}
      {editExp  && <ExpenseModal categories={categories} initial={editExp} onSave={e=>{setExpenses(p=>p.map(x=>x.id===editExp.id?{...editExp,...e}:x));setEditExp(null);}} onClose={()=>setEditExp(null)}/>}
    </div>
  );
}

export default function App() {
  const [user,setUser] = useState(null);
  const [apiKey,setApiKey] = useState("");
  if (!user) return <AuthScreen onLogin={(u,k)=>{setUser(u);setApiKey(k);}}/>;
  return <MainApp user={user} apiKey={apiKey} onLogout={()=>{setUser(null);setApiKey("");}}/>;
}
