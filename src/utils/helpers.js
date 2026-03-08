export const fmt = (n) =>
  (typeof n === "number" ? n : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fmtMoney = (n, currency = "INR") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(typeof n === "number" ? n : 0);

export const today = () => new Date().toISOString().split("T")[0];
export const nowM = () => new Date().toISOString().slice(0, 7);
export const nextId = (arr) => Math.max(0, ...arr.map((e) => Number(e.id) || 0)) + 1;

export function getCatColor(categories, catId) {
  return categories.find((c) => c.id === catId)?.color || "#64748b";
}

export function getCat(categories, catId) {
  return (
    categories.find((c) => c.id === catId) || {
      id: "other",
      name: "Other",
      icon: "",
      color: "#64748b",
    }
  );
}

export function categoryMark(category) {
  const raw = category?.icon;
  if (typeof raw === "string" && raw.trim()) {
    const value = raw.trim();
    const looksCorrupt = value === "??" || value.includes("Ã") || value.includes("ð") || value.includes("â");
    if (!looksCorrupt) return value;
  }
  const name = String(category?.name || "Category")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (name.length === 0) return "CT";
  if (name.length === 1) return name[0].slice(0, 2).toUpperCase();
  return `${name[0][0] || ""}${name[1][0] || ""}`.toUpperCase();
}

export function getMonthExpenses(expenses, month) {
  return expenses.filter((e) => e.date.startsWith(month));
}

export function sumExpenses(expenses) {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

export function monthBounds(month = nowM()) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

