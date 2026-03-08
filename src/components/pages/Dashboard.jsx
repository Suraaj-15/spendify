import React from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { C, F } from "../../constants/colors";
import { fmtMoney, nowM, getMonthExpenses, sumExpenses, getCat, shiftMonth, categoryMark } from "../../utils/helpers";
import { Card, ChartTooltip, SectionTitle } from "../ui";

function buildTrendData(expenses) {
  const curr = nowM();
  const months = [shiftMonth(curr, -5), shiftMonth(curr, -4), shiftMonth(curr, -3), shiftMonth(curr, -2), shiftMonth(curr, -1), curr];
  return months.map((m, idx) => {
    const amount = expenses.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
    const prev = idx > 0 ? expenses.filter((e) => e.date.startsWith(months[idx - 1])).reduce((s, e) => s + e.amount, 0) : 0;
    return { month: m.slice(2), amount, prev };
  });
}

export default function Dashboard({ expenses, budgets, categories, setPage, baseCurrency }) {
  const m = nowM();
  const mExp = getMonthExpenses(expenses, m);
  const total = sumExpenses(mExp);
  const prevTotal = sumExpenses(getMonthExpenses(expenses, shiftMonth(m, -1)));
  const pctChg = prevTotal ? ((total - prevTotal) / prevTotal) * 100 : 0;
  const biggest = mExp.length ? Math.max(...mExp.map((e) => e.amount)) : 0;
  const biggestDesc = [...mExp].sort((a, b) => b.amount - a.amount)[0]?.description || "-";

  const byCat = {};
  mExp.forEach((e) => {
    byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  });
  const pieData = categories.filter((c) => byCat[c.id]).map((c) => ({ name: c.name, value: byCat[c.id], color: c.color }));

  const stats = [
    {
      label: "Total Spent",
      value: fmtMoney(total, baseCurrency),
      sub: `${pctChg >= 0 ? "up" : "down"} ${Math.abs(pctChg).toFixed(1)}% vs last month`,
      color: C.accent,
    },
    {
      label: "Transactions",
      value: mExp.length,
      sub: `${expenses.length} all-time`,
      color: C.accent2,
    },
    {
      label: "Daily Average",
      value: fmtMoney(total / Math.max(1, new Date().getDate()), baseCurrency),
      sub: `${m} month-to-date`,
      color: C.purple,
    },
    {
      label: "Biggest Spend",
      value: fmtMoney(biggest, baseCurrency),
      sub: biggestDesc,
      color: C.warn,
    },
  ];

  const trendData = buildTrendData(expenses);

  const LinkBtn = ({ onClick, children }) => (
    <button onClick={onClick} style={{ fontSize: 11, color: C.accent, background: "none", border: "none", cursor: "pointer", fontFamily: F }}>
      {children}
    </button>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ borderTop: `2px solid ${s.color}`, animationDelay: `${i * 0.06}s` }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: C.faint, fontWeight: 600 }}>{s.label}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: "8px 0 5px", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <SectionTitle>6-Month Spending Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={195}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" tick={{ fill: C.faint, fontSize: 10, fontFamily: F }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.faint, fontSize: 10, fontFamily: F }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip currency={baseCurrency} />} />
              <Legend formatter={(v) => <span style={{ color: C.muted, fontSize: 11 }}>{v}</span>} />
              <Line type="monotone" dataKey="amount" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 3 }} name="This Month" activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="prev" stroke={C.border2} strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Previous" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Category Breakdown</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ResponsiveContainer width={130} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" paddingAngle={3}>
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip currency={baseCurrency} />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.slice(0, 5).map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.muted }}>{d.name.split(" ")[0]}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.text, fontVariantNumeric: "tabular-nums" }}>{fmtMoney(d.value, baseCurrency)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionTitle action={<LinkBtn onClick={() => setPage("transactions")}>View all</LinkBtn>}>Recent Transactions</SectionTitle>
          {[...expenses]
            .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
            .slice(0, 6)
            .map((e) => {
              const cat = getCat(categories, e.category);
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: cat.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{categoryMark(cat)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description || e.merchant || cat.name}</div>
                    <div style={{ fontSize: 10, color: C.faint }}>{e.date} | {e.method}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.danger, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>-{fmtMoney(e.amount, baseCurrency)}</div>
                </div>
              );
            })}
        </Card>

        <Card>
          <SectionTitle action={<LinkBtn onClick={() => setPage("budgets")}>Manage</LinkBtn>}>Budget Health</SectionTitle>
          {budgets
            .filter((b) => b.month === m)
            .map((b) => {
              const cat = getCat(categories, b.category);
              const spent = mExp.filter((e) => e.category === b.category).reduce((s, e) => s + e.amount, 0);
              const pct = Math.min((spent / Math.max(1, b.limit)) * 100, 100);
              const danger = pct > 85;
              return (
                <div key={b.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 5 }}>
                    <span style={{ color: C.text, fontWeight: 600 }}>{categoryMark(cat)} {cat.name}</span>
                    <span style={{ color: danger ? C.danger : C.muted, fontVariantNumeric: "tabular-nums" }}>
                      {fmtMoney(spent, baseCurrency)} / {fmtMoney(b.limit, baseCurrency)}
                    </span>
                  </div>
                  <div style={{ height: 5, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, transition: "width .6s", background: pct > 100 ? C.danger : danger ? C.warn : cat.color }} />
                  </div>
                </div>
              );
            })}
        </Card>
      </div>
    </div>
  );
}

