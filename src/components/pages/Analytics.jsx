import React from "react";
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { C, F } from "../../constants/colors";
import { TREND_DATA } from "../../constants/data";
import { fmt, nowM } from "../../utils/helpers";
import { Badge, Card, ChartTooltip, SectionTitle } from "../ui";

export default function Analytics({ expenses, categories, budgets }) {
  const m    = nowM();
  const mExp = expenses.filter(e => e.date.startsWith(m));

  // Daily spending
  const dailyMap = {};
  mExp.forEach(e => { dailyMap[e.date] = (dailyMap[e.date] || 0) + e.amount; });
  const dailyArr = Object.entries(dailyMap).sort().map(([d, amount]) => ({ date: d.slice(5), amount }));

  // Top merchants
  const merch = {};
  expenses.forEach(e => { if (e.merchant) merch[e.merchant] = (merch[e.merchant] || 0) + e.amount; });
  const topMerch = Object.entries(merch).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Payment methods
  const byMethod = {};
  expenses.forEach(e => { byMethod[e.method] = (byMethod[e.method] || 0) + e.amount; });
  const methodData = Object.entries(byMethod).map(([name, value], i) => ({ name, value, color: [C.accent, C.accent2, C.warn, "#f472b6", "#a78bfa", "#fb923c"][i % 6] }));

  // Top categories this month
  const byCat = {};
  mExp.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  const catArr = categories.filter(c => byCat[c.id]).map(c => ({ ...c, total: byCat[c.id] })).sort((a, b) => b.total - a.total);
  const maxCat = catArr[0]?.total || 1;

  // Budget progress
  const budgetProgress = budgets.map(b => {
    const cat   = categories.find(c => c.id === b.category);
    const spent = mExp.filter(e => e.category === b.category).reduce((s, e) => s + e.amount, 0);
    return { name: cat?.name || b.category, spent, limit: b.limit, pct: Math.round((spent / b.limit) * 100), color: cat?.color || C.accent };
  });

  const COLORS = [C.accent, C.accent2, C.warn, "#f472b6", "#a78bfa", "#fb923c"];

  return (
    <div>
      {/* Row 1: Daily Bar + Method Pie */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <SectionTitle>Daily Spending — March 2026</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={dailyArr}>
              <XAxis dataKey="date" tick={{ fill: C.faint, fontSize: 10, fontFamily: F }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.faint, fontSize: 10, fontFamily: F }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={46} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="amount" fill={C.accent2} radius={[5,5,0,0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Payment Methods</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={methodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                {methodData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend formatter={v => <span style={{ color: C.muted, fontSize: 10 }}>{v}</span>} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 2: Area Trend + Budget Progress */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <SectionTitle>6-Month Area Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent2} stopOpacity={.2} />
                  <stop offset="95%" stopColor={C.accent2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: C.faint, fontSize: 10, fontFamily: F }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.faint, fontSize: 10, fontFamily: F }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="amount" stroke={C.accent2} strokeWidth={2.5} fill="url(#ga2)" dot={{ fill: C.accent2, r: 3 }} name="Total" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Budget Progress Indicators</SectionTitle>
          {budgetProgress.map((b, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: C.text, fontWeight: 600 }}>{b.name}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: C.muted, fontSize: 11, fontVariantNumeric: "tabular-nums" }}>${fmt(b.spent)} / ${b.limit}</span>
                  <Badge color={b.pct > 100 ? C.danger : b.pct > 85 ? C.warn : C.accent} style={{ padding: "1px 7px", fontSize: 10 }}>{b.pct}%</Badge>
                </div>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(b.pct, 100)}%`, background: b.pct > 100 ? C.danger : b.pct > 85 ? C.warn : b.color, borderRadius: 99, transition: "width .6s ease" }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Row 3: Top Categories + Top Merchants */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionTitle>Top Spending Categories</SectionTitle>
          {catArr.map((cat, i) => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{cat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: C.text, fontWeight: 600 }}>{cat.name}</span>
                  <span style={{ color: cat.color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>${fmt(cat.total)}</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${(cat.total / maxCat) * 100}%`, background: cat.color, borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle>Top Merchants (All Time)</SectionTitle>
          {topMerch.map(([name, amount], i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 13 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: c + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: c, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.text, fontWeight: 600 }}>{name}</span>
                    <span style={{ color: c, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>${fmt(amount)}</span>
                  </div>
                  <div style={{ height: 3, background: C.border, borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${(amount / topMerch[0][1]) * 100}%`, background: c, borderRadius: 99 }} />
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
