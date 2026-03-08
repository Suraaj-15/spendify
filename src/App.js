import React, { useCallback, useEffect, useMemo, useState } from "react";
import { C, GLOBAL_CSS } from "./constants/colors";
import { hasSupabaseEnv, supabase } from "./lib/supabase";
import {
  addExpense,
  deleteExpense,
  ensureBootstrap,
  insertCategory,
  loadAppData,
  removeBudget,
  removeCategory,
  saveBudget,
  updateCategory,
  updateExpense,
  updateProfile,
} from "./services/db";

import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ExpenseModal from "./components/ExpenseModal";
import ChatPanel from "./components/ChatPanel";
import ProfileModal from "./components/ProfileModal";

import Dashboard from "./components/pages/Dashboard";
import Transactions from "./components/pages/Transactions";
import Categories from "./components/pages/Categories";
import Budgets from "./components/pages/Budgets";
import Analytics from "./components/pages/Analytics";

function themeToDom(theme) {
  document.body.dataset.theme = theme || "dark";
}

function errMessage(err, fallback) {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (typeof err.message === "string" && err.message.trim()) return err.message;
  return fallback;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [page, setPage] = useState("dashboard");
  const [loadingData, setLoadingData] = useState(false);

  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [editExp, setEditExp] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const apiKey = (process.env.REACT_APP_GROQ_API_KEY || "").trim();
  const baseCurrency = profile?.base_currency || "INR";
  const activeTheme = profile?.theme || "dark";

  const userId = session?.user?.id;

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoadingData(true);
    try {
      const data = await loadAppData(userId);
      setProfile(data.profile);
      setCategories(data.categories);
      setExpenses(data.expenses);
      setBudgets(data.budgets);
      themeToDom(data.profile?.theme || "dark");
    } catch (err) {
      setAuthError(errMessage(err, "Failed loading application data."));
    } finally {
      setLoadingData(false);
    }
  }, [userId]);

  useEffect(() => {
    themeToDom("dark");
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setAuthReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session || null);
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function bootstrap() {
      if (!session?.user || !hasSupabaseEnv) return;

      try {
        await ensureBootstrap(session.user, session.user.user_metadata?.display_name || "");
        await loadData();
      } catch (err) {
        setAuthError(
          `${errMessage(err, "Failed to initialize account data.")} ` +
            "Run the SQL in supabase/schema.sql in your Supabase SQL editor."
        );
      }
    }

    bootstrap();
  }, [session, loadData]);

  const uiUser = useMemo(() => {
    const email = session?.user?.email || "";
    return {
      name: profile?.display_name || email.split("@")[0] || "User",
      email,
    };
  }, [session, profile]);

  const handleAuthSubmit = async ({ mode, name, email, password }) => {
    if (!supabase) return;

    setAuthBusy(true);
    setAuthError("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
          },
        });
        if (error) throw error;

        if (!data.session?.user?.id) {
          setAuthError("Signup successful. Verify your email then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(errMessage(err, "Authentication failed."));
    } finally {
      setAuthBusy(false);
    }
  };

  const onLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
    setCategories([]);
    setExpenses([]);
    setBudgets([]);
    setPage("dashboard");
    setShowProfile(false);
  };

  const addExpenseHandler = async (e) => {
    const row = await addExpense(userId, e, baseCurrency);
    setExpenses((p) => [row, ...p]);
  };

  const saveEdit = async (e) => {
    const updated = await updateExpense(userId, editExp.id, e, baseCurrency);
    setExpenses((p) => p.map((x) => (x.id === editExp.id ? updated : x)));
  };

  const delExpense = async (id) => {
    await deleteExpense(userId, id);
    setExpenses((p) => p.filter((e) => e.id !== id));
  };

  const addCategoryHandler = async (category) => {
    await insertCategory(userId, category);
    setCategories((p) => [...p, { ...category, isDefault: false }]);
  };

  const removeCategoryHandler = async (id) => {
    await removeCategory(userId, id);
    await loadData();
  };

  const updateCategoryHandler = async (id, patch) => {
    await updateCategory(userId, id, patch);
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              name: patch.name,
              color: patch.color,
              icon: patch.icon || "",
            }
          : cat
      )
    );
  };

  const addBudgetHandler = async (budget) => {
    const saved = await saveBudget(userId, budget);
    setBudgets((p) => {
      const i = p.findIndex((x) => x.category === saved.category && x.month === saved.month);
      if (i >= 0) {
        const cp = [...p];
        cp[i] = saved;
        return cp;
      }
      return [...p, saved];
    });
  };

  const updateBudgetHandler = async (budget) => {
    const saved = await saveBudget(userId, budget);
    setBudgets((p) => p.map((x) => (x.id === saved.id ? saved : x)));
  };

  const deleteBudgetHandler = async (budgetId) => {
    await removeBudget(userId, budgetId);
    setBudgets((p) => p.filter((b) => b.id !== budgetId));
  };

  const toggleTheme = async () => {
    if (!profile) return;
    const next = profile.theme === "dark" ? "light" : "dark";
    const updated = await updateProfile(userId, { theme: next });
    setProfile(updated);
    themeToDom(next);
  };

  const changeBaseCurrency = async (nextCurrency) => {
    if (!profile || profile.base_currency === nextCurrency) return;

    await updateProfile(userId, { base_currency: nextCurrency });

    for (const e of expenses) {
      await updateExpense(
        userId,
        e.id,
        {
          amount: e.amountOriginal,
          currency: e.currency,
        },
        nextCurrency
      );
    }

    await loadData();
  };

  const verifyCurrentPasswordHandler = async (currentPassword) => {
    if (!supabase) return;
    const currentEmail = session?.user?.email;
    if (!currentEmail) {
      throw new Error("Unable to verify current password right now.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword || "",
    });

    if (error || data?.user?.id !== session?.user?.id) {
      throw new Error("Old password is incorrect.");
    }
  };

  const changePasswordHandler = async (newPassword) => {
    if (!supabase) return;

    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    if (data?.user) {
      setSession((prev) => (prev ? { ...prev, user: data.user } : prev));
    }
  };

  const saveProfileHandler = async (nextProfile) => {
    if (!profile || !supabase) return;

    const profilePatch = {};
    if (nextProfile.username !== profile.display_name) profilePatch.display_name = nextProfile.username;
    if (nextProfile.age !== (profile.age ?? null)) profilePatch.age = nextProfile.age;
    if (nextProfile.gender !== (profile.gender ?? null)) profilePatch.gender = nextProfile.gender;

    if (Object.keys(profilePatch).length > 0) {
      const updated = await updateProfile(userId, profilePatch);
      setProfile(updated);
    }

    const authPatch = {};
    if (nextProfile.email && nextProfile.email !== session?.user?.email) {
      authPatch.email = nextProfile.email;
    }
    if (nextProfile.username && nextProfile.username !== session?.user?.user_metadata?.display_name) {
      authPatch.data = { ...(session?.user?.user_metadata || {}), display_name: nextProfile.username };
    }

    if (Object.keys(authPatch).length > 0) {
      const { data, error } = await supabase.auth.updateUser(authPatch);
      if (error) throw error;
      if (data?.user) {
        setSession((prev) => (prev ? { ...prev, user: data.user } : prev));
      }
    }
  };

  if (!authReady) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#06070f", color: "#dde3ef" }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onSubmit={handleAuthSubmit} loading={authBusy} authError={authError} supabaseMissing={!hasSupabaseEnv} groqMissing={!apiKey} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'Sora',sans-serif", color: C.text, overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      <Sidebar page={page} setPage={setPage} user={uiUser} onLogout={onLogout} onOpenProfile={() => setShowProfile(true)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar
          page={page}
          expenseCount={expenses.length}
          onAddExpense={() => setShowAdd(true)}
          theme={activeTheme}
          onToggleTheme={toggleTheme}
          baseCurrency={baseCurrency}
          onBaseCurrencyChange={changeBaseCurrency}
        />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
            {loadingData && <div style={{ color: C.faint, marginBottom: 10 }}>Refreshing data...</div>}

            {page === "dashboard" && (
              <Dashboard expenses={expenses} budgets={budgets} categories={categories} setPage={setPage} baseCurrency={baseCurrency} />
            )}

            {page === "transactions" && (
              <Transactions
                expenses={expenses}
                categories={categories}
                onDelete={delExpense}
                onEdit={(e) => setEditExp(e)}
                onAddNew={() => setShowAdd(true)}
                baseCurrency={baseCurrency}
              />
            )}

            {page === "categories" && (
              <Categories
                categories={categories}
                expenses={expenses}
                baseCurrency={baseCurrency}
                onAddCategory={addCategoryHandler}
                onRemoveCategory={removeCategoryHandler}
                onUpdateCategory={updateCategoryHandler}
              />
            )}

            {page === "budgets" && (
              <Budgets
                budgets={budgets}
                expenses={expenses}
                categories={categories}
                baseCurrency={baseCurrency}
                onAddBudget={addBudgetHandler}
                onUpdateBudget={updateBudgetHandler}
                onDeleteBudget={deleteBudgetHandler}
              />
            )}

            {page === "analytics" && <Analytics expenses={expenses} categories={categories} budgets={budgets} baseCurrency={baseCurrency} />}
          </div>

          <ChatPanel
            apiKey={apiKey}
            userId={userId}
            expenses={expenses}
            budgets={budgets}
            categories={categories}
            baseCurrency={baseCurrency}
            onRefreshData={loadData}
          />
        </div>
      </div>

      {showAdd && (
        <ExpenseModal categories={categories} baseCurrency={baseCurrency} onSave={addExpenseHandler} onClose={() => setShowAdd(false)} />
      )}

      {editExp && (
        <ExpenseModal
          categories={categories}
          baseCurrency={baseCurrency}
          initial={editExp}
          onSave={async (e) => {
            await saveEdit(e);
            setEditExp(null);
          }}
          onClose={() => setEditExp(null)}
        />
      )}

      {showProfile && profile && (
        <ProfileModal
          profile={profile}
          userEmail={session?.user?.email || ""}
          onSave={saveProfileHandler}
          onVerifyCurrentPassword={verifyCurrentPasswordHandler}
          onChangePassword={changePasswordHandler}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

