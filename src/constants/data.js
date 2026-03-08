export const DEFAULT_CATEGORIES = [
  { id: "food",      name: "Food & Dining",    icon: "🍜", color: "#0ddc80" },
  { id: "transport", name: "Transport",         icon: "🚗", color: "#3db8f5" },
  { id: "bills",     name: "Bills & Utilities", icon: "⚡", color: "#f5c842" },
  { id: "shopping",  name: "Shopping",          icon: "🛍️", color: "#f472b6" },
  { id: "health",    name: "Healthcare",        icon: "💊", color: "#a78bfa" },
  { id: "entertain", name: "Entertainment",     icon: "🎬", color: "#fb923c" },
  { id: "other",     name: "Other",             icon: "📦", color: "#64748b" },
];

export const SEED_EXPENSES = [
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
  { id:18, amount:8,    category:"food",      description:"Tea and snacks",          merchant:"Cafe Coffee Day", date:"2026-03-04", method:"UPI" },
];

export const SEED_BUDGETS = [
  { id:1, category:"food",      limit:400,  month:"2026-03" },
  { id:2, category:"transport", limit:150,  month:"2026-03" },
  { id:3, category:"bills",     limit:1400, month:"2026-03" },
  { id:4, category:"shopping",  limit:200,  month:"2026-03" },
  { id:5, category:"entertain", limit:250,  month:"2026-03" },
  { id:6, category:"health",    limit:100,  month:"2026-03" },
];

export const METHODS = ["Card", "UPI", "Cash", "Net Banking", "Transfer", "Wallet"];

export const TREND_DATA = [
  { month:"Oct'25", amount:1620, prev:1450 },
  { month:"Nov'25", amount:1890, prev:1620 },
  { month:"Dec'25", amount:2340, prev:1890 },
  { month:"Jan'26", amount:1780, prev:2340 },
  { month:"Feb'26", amount:1850, prev:1780 },
  { month:"Mar'26", amount:1781, prev:1850 },
];

export const NAV_ITEMS = [
  { id:"dashboard",    label:"Dashboard",    icon:"◈" },
  { id:"transactions", label:"Transactions", icon:"↕" },
  { id:"categories",   label:"Categories",   icon:"◎" },
  { id:"budgets",      label:"Budgets",      icon:"⬡" },
  { id:"analytics",    label:"Analytics",    icon:"∿" },
];

export const PAGE_SUBTITLES = {
  dashboard:    "March 2026 Overview",
  transactions: "History · Filter · Search · Export",
  categories:   "Predefined & custom categories",
  budgets:      "Monthly limits & alerts",
  analytics:    "Charts · Trends · Insights",
};

export const QUICK_CHIPS = [
  "I spent $45 on groceries today",
  "How much this month?",
  "Show top 5 expenses",
  "Am I over budget?",
  "Delete my last expense",
  "Compare this vs last month",
  "Add $12 uber + $5 coffee",
  "Spending insights",
];
