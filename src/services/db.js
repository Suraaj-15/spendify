import { DEFAULT_BASE_CURRENCY } from "../constants/currencies";
import { DEFAULT_CATEGORIES, SEED_BUDGETS } from "../constants/data";
import { supabase } from "../lib/supabase";
import { nowM } from "../utils/helpers";
import { convertToBase } from "./fx";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase environment variables are missing.");
  }
}

export function toUiExpense(row) {
  return {
    id: Number(row.id),
    amount: Number(row.amount_base),
    amountOriginal: Number(row.amount_original),
    currency: row.currency,
    fxRate: Number(row.fx_rate || 1),
    category: row.category_id,
    description: row.description || "",
    merchant: row.merchant || "",
    date: row.txn_date,
    method: row.method || "Card",
  };
}

export async function ensureBootstrap(user, userDisplayName) {
  requireSupabase();

  const userId = user.id;
  const month = nowM();

  await supabase.from("profiles").upsert(
    {
      user_id: userId,
      display_name: userDisplayName || user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
      base_currency: DEFAULT_BASE_CURRENCY,
      theme: "dark",
    },
    { onConflict: "user_id" }
  );

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (!categoryCount) {
    await supabase.from("categories").insert(
      DEFAULT_CATEGORIES.map((c) => ({
        user_id: userId,
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        is_default: true,
      }))
    );
  }

  const { count: budgetCount } = await supabase
    .from("budgets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("month", month);

  if (!budgetCount) {
    await supabase.from("budgets").insert(
      SEED_BUDGETS.map((b) => ({
        user_id: userId,
        category_id: b.category,
        month,
        limit_amount: b.limit,
      }))
    );
  }

  await supabase.from("chat_sessions").upsert(
    {
      user_id: userId,
      title: "Main Chat",
      is_active: true,
    },
    { onConflict: "user_id,title" }
  );
}

export async function loadAppData(userId) {
  requireSupabase();

  const [
    profileRes,
    categoryRes,
    expenseRes,
    budgetRes,
    rulesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).single(),
    supabase.from("categories").select("*").eq("user_id", userId).order("is_default", { ascending: false }).order("name"),
    supabase.from("expenses").select("*").eq("user_id", userId).order("txn_date", { ascending: false }).order("id", { ascending: false }),
    supabase.from("budgets").select("*").eq("user_id", userId).order("month", { ascending: false }),
    supabase.from("merchant_category_rules").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (categoryRes.error) throw categoryRes.error;
  if (expenseRes.error) throw expenseRes.error;
  if (budgetRes.error) throw budgetRes.error;
  if (rulesRes.error) throw rulesRes.error;

  return {
    profile: profileRes.data,
    categories: categoryRes.data.map((r) => ({
      id: r.id,
      name: r.name,
      icon: r.icon === "??" ? "" : r.icon,
      color: r.color,
      isDefault: r.is_default,
    })),
    expenses: expenseRes.data.map(toUiExpense),
    budgets: budgetRes.data.map((b) => ({
      id: b.id,
      category: b.category_id,
      month: b.month,
      limit: Number(b.limit_amount),
    })),
    merchantRules: rulesRes.data,
  };
}

export async function updateProfile(userId, patch) {
  requireSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function addExpense(userId, payload, baseCurrency) {
  requireSupabase();
  const { fxRate, amountBase } = await convertToBase(payload.amount, payload.currency || baseCurrency, baseCurrency);

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      amount_original: Number(payload.amount),
      currency: payload.currency || baseCurrency,
      fx_rate: fxRate,
      amount_base: amountBase,
      category_id: payload.category,
      txn_date: payload.date,
      description: payload.description || "",
      merchant: payload.merchant || "",
      method: payload.method || "Card",
    })
    .select("*")
    .single();

  if (error) throw error;
  return toUiExpense(data);
}

export async function updateExpense(userId, id, payload, baseCurrency) {
  requireSupabase();

  const { data: existing, error: existingErr } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (existingErr) throw existingErr;

  const amountOriginal = payload.amount ?? existing.amount_original;
  const currency = payload.currency || existing.currency;
  const { fxRate, amountBase } = await convertToBase(amountOriginal, currency, baseCurrency);

  const { data, error } = await supabase
    .from("expenses")
    .update({
      amount_original: Number(amountOriginal),
      currency,
      fx_rate: fxRate,
      amount_base: amountBase,
      category_id: payload.category || existing.category_id,
      txn_date: payload.date || existing.txn_date,
      description: payload.description ?? existing.description,
      merchant: payload.merchant ?? existing.merchant,
      method: payload.method || existing.method,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return toUiExpense(data);
}

export async function deleteExpense(userId, id) {
  requireSupabase();
  const { error } = await supabase.from("expenses").delete().eq("user_id", userId).eq("id", id);
  if (error) throw error;
}

export async function insertCategory(userId, category) {
  requireSupabase();
  const payload = {
    user_id: userId,
    id: category.id,
    name: category.name,
    icon: category.icon || "",
    color: category.color,
    is_default: false,
  };

  const { data, error } = await supabase.from("categories").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateCategory(userId, categoryId, patch) {
  requireSupabase();

  const { data: row, error: rowErr } = await supabase
    .from("categories")
    .select("is_default")
    .eq("user_id", userId)
    .eq("id", categoryId)
    .single();

  if (rowErr) throw rowErr;
  if (row.is_default) {
    throw new Error("Default categories cannot be edited.");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({
      name: patch.name,
      color: patch.color,
      icon: patch.icon || "",
    })
    .eq("user_id", userId)
    .eq("id", categoryId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function removeCategory(userId, categoryId) {
  requireSupabase();

  const { data: row, error: rowErr } = await supabase
    .from("categories")
    .select("is_default")
    .eq("user_id", userId)
    .eq("id", categoryId)
    .single();

  if (rowErr) throw rowErr;
  if (row.is_default) {
    throw new Error("Default categories cannot be deleted.");
  }

  await supabase
    .from("expenses")
    .update({ category_id: "other" })
    .eq("user_id", userId)
    .eq("category_id", categoryId);

  const { error } = await supabase.from("categories").delete().eq("user_id", userId).eq("id", categoryId);
  if (error) throw error;
}

export async function saveBudget(userId, budget) {
  requireSupabase();

  const { data, error } = await supabase
    .from("budgets")
    .upsert(
      {
        id: budget.id,
        user_id: userId,
        category_id: budget.category,
        month: budget.month,
        limit_amount: Number(budget.limit),
      },
      { onConflict: "user_id,category_id,month" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return {
    id: data.id,
    category: data.category_id,
    month: data.month,
    limit: Number(data.limit_amount),
  };
}

export async function removeBudget(userId, budgetId) {
  requireSupabase();
  const { error } = await supabase.from("budgets").delete().eq("user_id", userId).eq("id", budgetId);
  if (error) throw error;
}

export async function saveMerchantCategoryRule(userId, merchant, categoryId) {
  requireSupabase();

  const normalized = merchant?.trim().toLowerCase();
  if (!normalized) return;

  await supabase.from("merchant_category_rules").upsert(
    {
      user_id: userId,
      merchant_pattern: normalized,
      category_id: categoryId,
      confidence: 0.95,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,merchant_pattern" }
  );
}

export async function findMerchantCategoryRule(userId, merchant) {
  requireSupabase();
  const normalized = merchant?.trim().toLowerCase();
  if (!normalized) return null;

  const { data } = await supabase
    .from("merchant_category_rules")
    .select("category_id")
    .eq("user_id", userId)
    .eq("merchant_pattern", normalized)
    .maybeSingle();

  return data?.category_id || null;
}

export async function getOrCreateChatSession(userId) {
  requireSupabase();
  const { data, error } = await supabase
    .from("chat_sessions")
    .upsert(
      {
        user_id: userId,
        title: "Main Chat",
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,title" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function loadChatMessages(sessionId) {
  requireSupabase();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, text_content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((m) => ({ role: m.role, text: m.text_content }));
}

export async function appendChatMessage(sessionId, role, text) {
  requireSupabase();
  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role,
    text_content: text,
  });

  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

export async function clearChatMessages(sessionId) {
  requireSupabase();
  const { error } = await supabase.from("chat_messages").delete().eq("session_id", sessionId);
  if (error) throw error;

  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

export async function loadChatContext(sessionId) {
  requireSupabase();
  const { error: upsertErr } = await supabase
    .from("chat_context")
    .upsert({ session_id: sessionId }, { onConflict: "session_id" });

  if (upsertErr) throw upsertErr;

  const { data, error } = await supabase
    .from("chat_context")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function saveChatContext(sessionId, patch) {
  requireSupabase();
  const { data, error } = await supabase
    .from("chat_context")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("session_id", sessionId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

