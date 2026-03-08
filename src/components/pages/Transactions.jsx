import React, { useMemo, useState } from "react";
import { C, F } from "../../constants/colors";
import { METHODS } from "../../constants/data";
import { fmtMoney, today, getCat, categoryMark } from "../../utils/helpers";
import { Card, Badge, Inp, Sel, Btn } from "../ui";

const PER_PAGE = 8;

export default function Transactions({ expenses, categories, onDelete, onEdit, onAddNew, baseCurrency }) {
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("all");
  const [methodF, setMethodF] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);

  const activeCount = [catF !== "all", methodF !== "all", dateFrom, dateTo, minAmt, maxAmt, search].filter(Boolean).length;

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        const q = search.toLowerCase();
        if (catF !== "all" && e.category !== catF) return false;
        if (methodF !== "all" && e.method !== methodF) return false;
        if (dateFrom && e.date < dateFrom) return false;
        if (dateTo && e.date > dateTo) return false;
        if (minAmt && e.amount < Number(minAmt)) return false;
        if (maxAmt && e.amount > Number(maxAmt)) return false;
        if (q && !e.description?.toLowerCase().includes(q) && !e.merchant?.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "amount") return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
        if (sortBy === "category") return sortDir === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
        return sortDir === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      });
  }, [expenses, search, catF, methodF, dateFrom, dateTo, minAmt, maxAmt, sortBy, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalF = filtered.reduce((s, e) => s + e.amount, 0);

  const clearAll = () => {
    setSearch("");
    setCatF("all");
    setMethodF("all");
    setDateFrom("");
    setDateTo("");
    setMinAmt("");
    setMaxAmt("");
    setPage(1);
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const exportCSV = () => {
    const hdr = ["ID", "Date", "Amount(Base)", "Amount(Original)", "Currency", "Category", "Description", "Merchant", "Method"];
    const rows = filtered.map((e) => [e.id, e.date, e.amount, e.amountOriginal ?? e.amount, e.currency || baseCurrency, e.category, `"${e.description || ""}"`, `"${e.merchant || ""}"`, e.method]);
    const csv = [hdr, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `expenses_${today()}.csv`;
    a.click();
  };

  const exportPDF = () => {
    const win = window.open("", "_blank", "width=1000,height=700");
    if (!win) return;

    const rows = filtered
      .map((e) => `<tr>
        <td>${e.date}</td>
        <td>${getCat(categories, e.category).name}</td>
        <td>${e.description || "-"}</td>
        <td>${e.merchant || "-"}</td>
        <td>${e.method}</td>
        <td>${fmtMoney(e.amount, baseCurrency)}</td>
      </tr>`)
      .join("");

    win.document.write(`
      <html><head><title>Expense Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
      </style></head>
      <body>
        <h2>Spendify Expense Report</h2>
        <p>Rows: ${filtered.length} | Total (${baseCurrency}): ${fmtMoney(totalF, baseCurrency)}</p>
        <table><thead>
          <tr><th>Date</th><th>Category</th><th>Description</th><th>Merchant</th><th>Method</th><th>Amount</th></tr>
        </thead><tbody>${rows}</tbody></table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
        <Inp
          placeholder="Search by description or merchant..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ flex: 1 }}
        />
        <Btn variant={showFilters ? "primary" : "ghost"} onClick={() => setShowFilters((v) => !v)} style={{ flexShrink: 0 }}>
          Filters {activeCount > 0 && <Badge color={C.warn} style={{ padding: "1px 6px", fontSize: 10 }}>{activeCount}</Badge>}
        </Btn>
        <Btn variant="ghost" onClick={exportCSV} style={{ flexShrink: 0 }}>CSV</Btn>
        <Btn variant="ghost" onClick={exportPDF} style={{ flexShrink: 0 }}>PDF</Btn>
        <Btn onClick={onAddNew} style={{ flexShrink: 0 }}>+ Add</Btn>
      </div>

      {showFilters && (
        <Card cls="fadein" style={{ marginBottom: 14, padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Filter & Sort</div>
            {activeCount > 0 && (
              <button onClick={clearAll} style={{ fontSize: 11, color: C.danger, background: "none", border: "none", cursor: "pointer", fontFamily: F }}>
                Clear All
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, color: C.faint, display: "block", marginBottom: 5, letterSpacing: "1.5px", textTransform: "uppercase" }}>Category</label>
              <Sel value={catF} onChange={(e) => { setCatF(e.target.value); setPage(1); }} style={{ width: "100%" }}>
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </Sel>
            </div>

            <div>
              <label style={{ fontSize: 10, color: C.faint, display: "block", marginBottom: 5, letterSpacing: "1.5px", textTransform: "uppercase" }}>Payment Method</label>
              <Sel value={methodF} onChange={(e) => { setMethodF(e.target.value); setPage(1); }} style={{ width: "100%" }}>
                <option value="all">All Methods</option>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </Sel>
            </div>

            <div>
              <label style={{ fontSize: 10, color: C.faint, display: "block", marginBottom: 5, letterSpacing: "1.5px", textTransform: "uppercase" }}>Sort By</label>
              <div style={{ display: "flex", gap: 6 }}>
                <Sel value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ flex: 1 }}>
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </Sel>
                <Sel value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={{ width: 90 }}>
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </Sel>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, color: C.faint, display: "block", marginBottom: 5, letterSpacing: "1.5px", textTransform: "uppercase" }}>Date From</label>
              <Inp type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            </div>

            <div>
              <label style={{ fontSize: 10, color: C.faint, display: "block", marginBottom: 5, letterSpacing: "1.5px", textTransform: "uppercase" }}>Date To</label>
              <Inp type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: C.faint, display: "block", marginBottom: 5, letterSpacing: "1.5px", textTransform: "uppercase" }}>Min</label>
                <Inp type="number" placeholder="0" value={minAmt} onChange={(e) => { setMinAmt(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: C.faint, display: "block", marginBottom: 5, letterSpacing: "1.5px", textTransform: "uppercase" }}>Max</label>
                <Inp type="number" placeholder="inf" value={maxAmt} onChange={(e) => { setMaxAmt(e.target.value); setPage(1); }} />
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card cls="fadeup" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "13px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            <strong style={{ color: C.text }}>{filtered.length}</strong> results | Total:
            <strong style={{ color: C.accent }}> {fmtMoney(totalF, baseCurrency)}</strong>
          </div>
          {activeCount > 0 && <Badge color={C.warn}>{activeCount} filters active</Badge>}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: C.sidebar }}>
                {[["date", "Date"], ["", "Category"], ["", "Description"], ["", "Merchant"], ["", "Method"], ["amount", "Amount"], ["category", "Sort"], ["", "Actions"]].map(([col, h], i) => (
                  <th
                    key={i}
                    onClick={() => col && toggleSort(col)}
                    style={{ textAlign: "left", padding: "10px 14px", color: C.faint, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, cursor: col ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((e) => {
                const cat = getCat(categories, e.category);
                return (
                  <tr key={e.id} className="row-hover" style={{ borderBottom: `1px solid ${C.border}`, transition: "background .12s" }}>
                    <td style={{ padding: "10px 14px", color: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>{e.date}</td>
                    <td style={{ padding: "10px 14px" }}><Badge color={cat.color}>{categoryMark(cat)} {cat.name.split(" ")[0]}</Badge></td>
                    <td style={{ padding: "10px 14px", color: C.text, maxWidth: 150 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description || "-"}</div></td>
                    <td style={{ padding: "10px 14px", color: C.muted }}>{e.merchant || "-"}</td>
                    <td style={{ padding: "10px 14px", color: C.faint, fontSize: 11 }}>{e.method}</td>
                    <td style={{ padding: "10px 14px", color: C.danger, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: "tabular-nums" }}>
                      -{fmtMoney(e.amount, baseCurrency)}
                      {e.currency && e.currency !== baseCurrency && <div style={{ fontSize: 10, color: C.faint }}>{fmtMoney(e.amountOriginal ?? e.amount, e.currency)}</div>}
                    </td>
                    <td style={{ padding: "10px 14px", color: C.faint, fontSize: 11 }}>{cat.name.split(" ")[0]}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => onEdit(e)} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 13, padding: "3px 7px", borderRadius: 5 }}>Edit</button>
                        <button onClick={() => onDelete(e.id)} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 13, padding: "3px 7px", borderRadius: 5 }}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 0", color: C.faint, fontSize: 13 }}>
            No transactions match your filters.
            {activeCount > 0 && (
              <button onClick={clearAll} style={{ display: "block", margin: "10px auto 0", color: C.accent, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 12 }}>
                Clear all filters
              </button>
            )}
          </div>
        )}

        {pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "14px", borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 11px", color: page === 1 ? C.faint : C.muted, cursor: page === 1 ? "default" : "pointer", fontFamily: F, fontSize: 12 }}>
              Prev
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${p === page ? C.accent : C.border}`, background: p === page ? C.accent + "22" : "transparent", color: p === page ? C.accent : C.faint, fontFamily: F, fontSize: 12, cursor: "pointer" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 11px", color: page === pages ? C.faint : C.muted, cursor: page === pages ? "default" : "pointer", fontFamily: F, fontSize: 12 }}>
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

