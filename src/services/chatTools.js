import { supabase } from "../lib/supabase";
import {
  addExpense,
  deleteExpense,
  findMerchantCategoryRule,
  saveChatContext,
  saveMerchantCategoryRule,
  updateExpense,
} from "./db";
import { monthBounds, nowM, shiftMonth } from "../utils/helpers";

function guessCategory(expense, categories) {
  const text = `${expense.description || ""} ${expense.merchant || ""}`.toLowerCase();

  const map = [
    ["food", ["grocer", "restaurant", "coffee", "snack", "zomato", "swiggy", "food", "lunch", "dinner"]],
    ["transport", ["uber", "ola", "fuel", "metro", "cab", "taxi", "bus", "train", "transport"]],
    ["bills", ["bill", "electricity", "water", "internet", "rent", "utility", "gas"]],
    ["shopping", ["shop", "amazon", "flipkart", "mall", "clothes", "shoe"]],
    ["health", ["pharmacy", "doctor", "hospital", "health", "medicine", "clinic"]],
    ["entertain", ["netflix", "movie", "concert", "game", "spotify", "entertain"]],
  ];

  for (const [category, keywords] of map) {
    if (keywords.some((k) => text.includes(k))) {
      if (categories.some((c) => c.id === category)) return category;
    }
  }

  return "other";
}

async function getAllExpenses(userId) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("txn_date", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw error;
  return data || [];
}

function filterByArgs(expenses, args) {
  let out = [...expenses];
  if (args.category) out = out.filter((e) => e.category_id === args.category);
  if (args.date_from) out = out.filter((e) => e.txn_date >= args.date_from);
  if (args.date_to) out = out.filter((e) => e.txn_date <= args.date_to);
  if (args.merchant_contains) {
    const q = String(args.merchant_contains).toLowerCase();
    out = out.filter((e) => (e.merchant || "").toLowerCase().includes(q));
  }
  return out;
}

async function resolveTargetExpense(userId, args, context) {
  if (args.id) {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .eq("id", args.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  const expenses = await getAllExpenses(userId);
  if (args.last_n) return expenses[Math.max(0, Number(args.last_n) - 1)] || null;
  if (context?.last_expense_id) {
    return expenses.find((e) => Number(e.id) === Number(context.last_expense_id)) || expenses[0] || null;
  }
  return expenses[0] || null;
}

function toSummary(e) {
  return {
    id: Number(e.id),
    amount: Number(e.amount_base),
    amount_original: Number(e.amount_original),
    currency: e.currency,
    category: e.category_id,
    description: e.description,
    merchant: e.merchant,
    date: e.txn_date,
    method: e.method,
  };
}

export async function execChatTool({
  name,
  args = {},
  userId,
  sessionId,
  context,
  categories,
  baseCurrency,
}) {
  let nextContext = { ...context };

  if (name === "add_expense") {
    const items = Array.isArray(args.expenses) ? args.expenses : [];
    const created = [];

    for (const item of items) {
      let category = item.category;
      if (!category && item.merchant) {
        category = await findMerchantCategoryRule(userId, item.merchant);
      }
      if (!category) {
        category = guessCategory(item, categories);
      }
      if (!categories.some((c) => c.id === category)) category = "other";

      const row = await addExpense(
        userId,
        {
          amount: Number(item.amount || 0),
          currency: item.currency || baseCurrency,
          category,
          date: item.date || new Date().toISOString().slice(0, 10),
          description: item.description || "",
          merchant: item.merchant || "",
          method: item.method || "Card",
        },
        baseCurrency
      );

      if (row.merchant) {
        await saveMerchantCategoryRule(userId, row.merchant, row.category);
      }

      created.push(row);
    }

    if (created[created.length - 1]) {
      nextContext.last_expense_id = created[created.length - 1].id;
      nextContext.pending_confirmation_action = null;
      await saveChatContext(sessionId, {
        last_expense_id: nextContext.last_expense_id,
        pending_confirmation_action: null,
      });
    }

    return {
      result: {
        success: true,
        added: created.length,
        total_added_base: created.reduce((s, x) => s + x.amount, 0),
        expenses: created,
      },
      nextContext,
    };
  }

  if (name === "query_expenses") {
    const expenses = filterByArgs(await getAllExpenses(userId), args);

    expenses.sort((a, b) => {
      const dir = args.sort_order === "asc" ? 1 : -1;
      if (args.sort_by === "amount") {
        return dir * (Number(a.amount_base) - Number(b.amount_base));
      }
      return dir * a.txn_date.localeCompare(b.txn_date);
    });

    const limited = args.limit ? expenses.slice(0, Number(args.limit)) : expenses;
    const payload = {
      count: limited.length,
      total: limited.reduce((s, e) => s + Number(e.amount_base), 0),
      expenses: limited.map(toSummary),
    };

    nextContext.last_query_signature = JSON.stringify({
      tool: name,
      args,
      count: payload.count,
      total: payload.total,
    });
    nextContext.last_result_set_ids = limited.map((e) => Number(e.id));

    await saveChatContext(sessionId, {
      last_query_signature: nextContext.last_query_signature,
      last_result_set_ids: nextContext.last_result_set_ids,
    });

    return { result: payload, nextContext };
  }

  if (name === "update_expense") {
    const target = await resolveTargetExpense(userId, args, context);
    if (!target) {
      return { result: { success: false, error: "Expense not found." }, nextContext };
    }

    const updated = await updateExpense(
      userId,
      Number(target.id),
      {
        amount: args.amount,
        currency: args.currency,
        category: args.category,
        description: args.description,
        merchant: args.merchant,
        method: args.method,
        date: args.date,
      },
      baseCurrency
    );

    if (updated.merchant && updated.category) {
      await saveMerchantCategoryRule(userId, updated.merchant, updated.category);
    }

    nextContext.last_expense_id = updated.id;
    await saveChatContext(sessionId, { last_expense_id: updated.id });

    return {
      result: { success: true, updated },
      nextContext,
    };
  }

  if (name === "delete_expense") {
    let targets = [];
    const all = await getAllExpenses(userId);

    if (args.id) {
      targets = all.filter((e) => Number(e.id) === Number(args.id));
    } else if (args.last_n) {
      targets = all.slice(0, Number(args.last_n));
    } else {
      targets = filterByArgs(all, args);
    }

    if (targets.length > 1 && !args.confirm) {
      const pending = {
        type: "bulk_delete",
        ids: targets.map((e) => Number(e.id)),
        created_at: new Date().toISOString(),
      };

      nextContext.pending_confirmation_action = pending;
      await saveChatContext(sessionId, {
        pending_confirmation_action: pending,
      });

      return {
        result: {
          success: false,
          requires_confirmation: true,
          delete_count: targets.length,
          preview: targets.slice(0, 5).map(toSummary),
        },
        nextContext,
      };
    }

    for (const e of targets) {
      await deleteExpense(userId, Number(e.id));
    }

    nextContext.pending_confirmation_action = null;
    await saveChatContext(sessionId, {
      pending_confirmation_action: null,
    });

    return {
      result: {
        success: true,
        deleted: targets.length,
        total_deleted: targets.reduce((s, e) => s + Number(e.amount_base), 0),
        expenses: targets.map(toSummary),
      },
      nextContext,
    };
  }

  if (name === "confirm_action") {
    const pending = context?.pending_confirmation_action;

    if (!pending) {
      return {
        result: { success: false, error: "No pending action to confirm." },
        nextContext,
      };
    }

    if (!args.approve) {
      nextContext.pending_confirmation_action = null;
      await saveChatContext(sessionId, { pending_confirmation_action: null });
      return { result: { success: true, cancelled: true }, nextContext };
    }

    if (pending.type === "bulk_delete") {
      for (const id of pending.ids || []) {
        await deleteExpense(userId, Number(id));
      }

      nextContext.pending_confirmation_action = null;
      await saveChatContext(sessionId, { pending_confirmation_action: null });
      return {
        result: {
          success: true,
          confirmed: true,
          deleted: (pending.ids || []).length,
        },
        nextContext,
      };
    }

    return {
      result: { success: false, error: "Unsupported pending action." },
      nextContext,
    };
  }

  if (name === "compare_spending") {
    const current = args.current_month || nowM();
    const previous = args.previous_month || shiftMonth(current, -1);

    const currBounds = monthBounds(current);
    const prevBounds = monthBounds(previous);

    const all = await getAllExpenses(userId);
    const curr = all.filter((e) => e.txn_date >= currBounds.start && e.txn_date <= currBounds.end);
    const prev = all.filter((e) => e.txn_date >= prevBounds.start && e.txn_date <= prevBounds.end);

    const currTotal = curr.reduce((s, e) => s + Number(e.amount_base), 0);
    const prevTotal = prev.reduce((s, e) => s + Number(e.amount_base), 0);

    const currCat = {};
    const prevCat = {};
    curr.forEach((e) => {
      currCat[e.category_id] = (currCat[e.category_id] || 0) + Number(e.amount_base);
    });
    prev.forEach((e) => {
      prevCat[e.category_id] = (prevCat[e.category_id] || 0) + Number(e.amount_base);
    });

    const categoriesDelta = Array.from(new Set([...Object.keys(currCat), ...Object.keys(prevCat)])).map((category) => {
      const a = currCat[category] || 0;
      const b = prevCat[category] || 0;
      return {
        category,
        current: a,
        previous: b,
        delta_pct: b ? Number((((a - b) / b) * 100).toFixed(1)) : null,
      };
    });

    return {
      result: {
        current_month: current,
        previous_month: previous,
        current_total: currTotal,
        previous_total: prevTotal,
        change_pct: prevTotal ? Number((((currTotal - prevTotal) / prevTotal) * 100).toFixed(1)) : null,
        categories: categoriesDelta,
      },
      nextContext,
    };
  }

  if (name === "get_budget_status") {
    const month = args.month || nowM();

    const [{ data: budgets, error: budgetErr }, expenses] = await Promise.all([
      supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .eq("month", month)
        .order("category_id"),
      getAllExpenses(userId),
    ]);

    if (budgetErr) throw budgetErr;

    const [year, mon] = month.split("-");
    const monthPrefix = `${year}-${mon}`;
    const monthExpenses = expenses.filter((e) => e.txn_date.startsWith(monthPrefix));

    const status = (budgets || [])
      .filter((b) => !args.category || b.category_id === args.category)
      .map((b) => {
        const spent = monthExpenses
          .filter((e) => e.category_id === b.category_id)
          .reduce((s, e) => s + Number(e.amount_base), 0);
        return {
          category: b.category_id,
          limit: Number(b.limit_amount),
          spent,
          remaining: Number(b.limit_amount) - spent,
          pct: Number(b.limit_amount) ? Math.round((spent / Number(b.limit_amount)) * 100) : 0,
        };
      });

    return { result: { month, budgets: status }, nextContext };
  }

  if (name === "get_insights") {
    const period = args.period || "this_month";
    const month = nowM();
    const today = new Date().toISOString().slice(0, 10);

    let fromDate = `${month}-01`;
    if (period === "last_month") {
      fromDate = `${shiftMonth(month, -1)}-01`;
    }
    if (period === "this_week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      fromDate = d.toISOString().slice(0, 10);
    }
    if (period === "all") {
      fromDate = "1900-01-01";
    }

    const expenses = (await getAllExpenses(userId)).filter((e) => e.txn_date >= fromDate && e.txn_date <= today);

    const byCategory = {};
    const byMerchant = {};
    expenses.forEach((e) => {
      byCategory[e.category_id] = (byCategory[e.category_id] || 0) + Number(e.amount_base);
      if (e.merchant) {
        byMerchant[e.merchant] = (byMerchant[e.merchant] || 0) + Number(e.amount_base);
      }
    });

    return {
      result: {
        period,
        total: expenses.reduce((s, e) => s + Number(e.amount_base), 0),
        count: expenses.length,
        by_category: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
        top_merchants: Object.entries(byMerchant).sort((a, b) => b[1] - a[1]).slice(0, 5),
      },
      nextContext,
    };
  }

  return {
    result: {
      success: false,
      error: `Unsupported tool: ${name}`,
    },
    nextContext,
  };
}

