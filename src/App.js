import React, { useState } from "react";
import { GLOBAL_CSS } from "./constants/colors";
import { SEED_EXPENSES, SEED_BUDGETS, DEFAULT_CATEGORIES } from "./constants/data";
import { nextId } from "./utils/helpers";

import AuthScreen   from "./components/AuthScreen";
import Sidebar      from "./components/Sidebar";
import Topbar       from "./components/Topbar";
import ExpenseModal from "./components/ExpenseModal";
import ChatPanel    from "./components/ChatPanel";

import Dashboard    from "./components/pages/Dashboard";
import Transactions from "./components/pages/Transactions";
import Categories   from "./components/pages/Categories";
import Budgets      from "./components/pages/Budgets";
import Analytics    from "./components/pages/Analytics";

function MainApp({ user, apiKey, onLogout }) {
  const [page,       setPage]       = useState("dashboard");
  const [expenses,   setExpenses]   = useState(SEED_EXPENSES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [budgets,    setBudgets]    = useState(SEED_BUDGETS);
  const [showAdd,    setShowAdd]    = useState(false);
  const [editExp,    setEditExp]    = useState(null);

  const addExpense  = e  => setExpenses(p => [...p, { ...e, id: nextId(p) }]);
  const saveEdit    = e  => setExpenses(p => p.map(x => x.id === editExp.id ? { ...editExp, ...e } : x));
  const delExpense  = id => setExpenses(p => p.filter(e => e.id !== id));

  return (
    <div style={{ display: "flex", height: "100vh", background: "#06070f", fontFamily: "'Sora',sans-serif", color: "#dde3ef", overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      <Sidebar page={page} setPage={setPage} user={user} onLogout={onLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar page={page} user={user} expenseCount={expenses.length} onAddExpense={() => setShowAdd(true)} />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Page content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
            {page === "dashboard"    && <Dashboard    expenses={expenses} budgets={budgets} categories={categories} setPage={setPage} />}
            {page === "transactions" && <Transactions expenses={expenses} categories={categories} onDelete={delExpense} onEdit={e => setEditExp(e)} onAddNew={() => setShowAdd(true)} />}
            {page === "categories"   && <Categories   categories={categories} setCategories={setCategories} expenses={expenses} />}
            {page === "budgets"      && <Budgets      budgets={budgets} setBudgets={setBudgets} expenses={expenses} categories={categories} />}
            {page === "analytics"    && <Analytics    expenses={expenses} categories={categories} budgets={budgets} />}
          </div>

          <ChatPanel apiKey={apiKey} expenses={expenses} setExpenses={setExpenses} budgets={budgets} categories={categories} />
        </div>
      </div>

      {showAdd && (
        <ExpenseModal categories={categories} onSave={addExpense} onClose={() => setShowAdd(false)} />
      )}
      {editExp && (
        <ExpenseModal categories={categories} initial={editExp} onSave={e => { saveEdit(e); setEditExp(null); }} onClose={() => setEditExp(null)} />
      )}
    </div>
  );
}

export default function App() {
  const [user,   setUser]   = useState(null);
  const [apiKey, setApiKey] = useState("");

  if (!user) {
    return <AuthScreen onLogin={(u, k) => { setUser(u); setApiKey(k); }} />;
  }
  return <MainApp user={user} apiKey={apiKey} onLogout={() => { setUser(null); setApiKey(""); }} />;
}
