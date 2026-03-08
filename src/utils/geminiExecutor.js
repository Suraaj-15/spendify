import { today, nowM, nextId } from "./helpers";

export function execFn(name, args, expenses, budgets, categories) {
  const sc = {};
  let result = {};

  if (name === "add_expense") {
    const list = (args.expenses || []).map((e, i) => ({
      id: nextId(expenses) + i,
      amount: Number(e.amount),
      category: e.category || "other",
      description: e.description || "",
      merchant: e.merchant || "",
      date: e.date || today(),
      method: e.method || "Card",
    }));
    sc.addExpenses = list;
    result = { success: true, added: list.length, expenses: list };

  } else if (name === "query_expenses") {
    let f = [...expenses];
    if (args.category)  f = f.filter(e => e.category === args.category);
    if (args.date_from) f = f.filter(e => e.date >= args.date_from);
    if (args.date_to)   f = f.filter(e => e.date <= args.date_to);
    f.sort((a, b) =>
      args.sort_by === "amount"
        ? (args.sort_order === "asc" ? a.amount - b.amount : b.amount - a.amount)
        : (args.sort_order === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
    );
    if (args.limit) f = f.slice(0, args.limit);
    result = { expenses: f, total: f.reduce((s, e) => s + e.amount, 0), count: f.length };

  } else if (name === "update_expense") {
    const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    const target = args.id
      ? expenses.find(e => e.id === args.id)
      : sorted[(args.last_n || 1) - 1];
    if (target) {
      const updated = {
        ...target,
        ...(args.amount !== undefined && { amount: Number(args.amount) }),
        ...(args.category    && { category: args.category }),
        ...(args.description && { description: args.description }),
        ...(args.merchant    && { merchant: args.merchant }),
        ...(args.method      && { method: args.method }),
      };
      sc.updateExpense = updated;
      result = { success: true, updated };
    } else {
      result = { success: false, error: "Expense not found" };
    }

  } else if (name === "delete_expense") {
    let del = [];
    if (args.id) {
      del = expenses.filter(e => e.id === args.id);
    } else if (args.last_n) {
      del = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, args.last_n);
    } else {
      let f = [...expenses];
      if (args.category)  f = f.filter(e => e.category === args.category);
      if (args.date_from) f = f.filter(e => e.date >= args.date_from);
      if (args.date_to)   f = f.filter(e => e.date <= args.date_to);
      del = f;
    }
    sc.deleteIds = del.map(e => e.id);
    result = { success: true, deleted: del.length, expenses: del };

  } else if (name === "get_budget_status") {
    const m = nowM();
    const me = expenses.filter(e => e.date.startsWith(m));
    result = {
      budgets: budgets
        .filter(b => !args.category || b.category === args.category)
        .map(b => {
          const spent = me.filter(e => e.category === b.category).reduce((t, e) => t + e.amount, 0);
          return { category: b.category, limit: b.limit, spent, remaining: b.limit - spent, pct: Math.round((spent / b.limit) * 100) };
        }),
    };

  } else if (name === "get_insights") {
    const df = args.period === "this_week"
      ? new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
      : nowM() + "-01";
    const f = expenses.filter(e => e.date >= df);
    const bc = {};
    f.forEach(e => { bc[e.category] = (bc[e.category] || 0) + e.amount; });
    result = {
      total: f.reduce((s, e) => s + e.amount, 0),
      by_category: bc,
      top: Object.entries(bc).sort((a, b) => b[1] - a[1]).slice(0, 3),
      count: f.length,
    };
  }

  return { result, sc };
}
