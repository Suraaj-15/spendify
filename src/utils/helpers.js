export const fmt    = n => (typeof n === "number" ? n : 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const today  = () => new Date().toISOString().split("T")[0];
export const nowM   = () => new Date().toISOString().slice(0, 7);
export const nextId = arr => Math.max(0, ...arr.map(e => e.id)) + 1;

export function getCatColor(categories, catId) {
  return categories.find(c => c.id === catId)?.color || "#64748b";
}

export function getCat(categories, catId) {
  return categories.find(c => c.id === catId) || { id: "other", name: "Other", icon: "📦", color: "#64748b" };
}

export function getMonthExpenses(expenses, month) {
  return expenses.filter(e => e.date.startsWith(month));
}

export function sumExpenses(expenses) {
  return expenses.reduce((s, e) => s + e.amount, 0);
}
