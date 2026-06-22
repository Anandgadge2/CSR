"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type LiveCSRReportPageProps = {
  title: string;
  description: string;
  endpoint: string;
};

type ReportResponse = {
  reportName: string;
  kpis?: Record<string, number | string>;
  charts?: Record<string, Array<{ label: string; value: number }>>;
  table?: Array<Record<string, unknown>>;
  exportFormats?: string[];
};

const filterFields = ["financialYear", "district", "taluka", "village", "sector", "department", "company", "ngo", "status", "dateRange"];

export default function LiveCSRReportPage({ title, description, endpoint }: LiveCSRReportPageProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<ReportResponse>(`${endpoint}${query ? `?${query}` : ""}`);
        setReport(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [endpoint, query]);

  const rows = report?.table || [];
  const columns = rows[0] ? Object.keys(rows[0]).slice(0, 8) : [];
  const chartGroups = Object.entries(report?.charts || {});

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-5 px-5 py-7">
      <section className="border border-gov-line bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
        <div className="p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-gov-saffron">CSR Reports</p>
          <h1 className="mt-2 text-2xl font-extrabold text-gov-navy">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gov-muted">{description}</p>
        </div>
      </section>

      <section className="border border-gov-line bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {filterFields.map((field) => (
            <label key={field} className="text-xs font-bold uppercase tracking-wide text-gov-muted">
              {field.replace(/([A-Z])/g, " $1")}
              <input
                className="mt-1 w-full border border-gov-line px-3 py-2 text-sm font-medium normal-case tracking-normal text-gov-ink outline-none focus:border-gov-blue"
                value={filters[field] || ""}
                onChange={(event) => setFilters((current) => ({ ...current, [field]: event.target.value }))}
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(report?.exportFormats || ["PDF", "Excel", "CSV", "Print"]).map((format) => (
            <button
              key={format}
              type="button"
              className="border border-gov-line bg-white px-3 py-2 text-xs font-extrabold text-gov-blue hover:bg-gov-mist"
              onClick={() => window.print()}
            >
              Export {format}
            </button>
          ))}
        </div>
      </section>

      {loading && <section className="border border-gov-line bg-white p-8 text-center text-sm font-bold text-gov-muted">Loading report data...</section>}
      {error && !loading && <section className="border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">{error}</section>}

      {!loading && !error && report && (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Object.entries(report.kpis || {}).slice(0, 8).map(([label, value]) => (
              <div key={label} className="border border-gov-line bg-white p-4 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gov-muted">{label}</p>
                <p className="mt-2 text-xl font-extrabold text-gov-navy">{typeof value === "number" ? value.toLocaleString() : value}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {chartGroups.length === 0 ? (
              <div className="border border-gov-line bg-white p-8 text-center text-sm text-gov-muted">No chart data for the selected filters.</div>
            ) : chartGroups.map(([name, points]) => (
              <div key={name} className="border border-gov-line bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-gov-navy">{name}</h2>
                <div className="mt-4 space-y-3">
                  {points.map((point) => {
                    const max = Math.max(...points.map((item) => item.value), 1);
                    return (
                      <div key={point.label}>
                        <div className="flex justify-between text-xs font-bold text-gov-muted">
                          <span>{point.label.replace(/_/g, " ")}</span>
                          <span>{point.value}</span>
                        </div>
                        <div className="mt-1 h-2 bg-gov-mist">
                          <div className="h-2 bg-gov-saffron" style={{ width: `${Math.max((point.value / max) * 100, 4)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className="border border-gov-line bg-white shadow-sm">
            <div className="border-b border-gov-line px-5 py-4">
              <h2 className="text-base font-extrabold text-gov-navy">Report Table</h2>
            </div>
            {rows.length === 0 ? (
              <div className="p-8 text-center text-sm text-gov-muted">No report rows match the selected filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-gov-mist text-[11px] uppercase tracking-wider text-gov-muted">
                    <tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gov-line">
                    {rows.map((row, index) => (
                      <tr key={index}>
                        {columns.map((column) => (
                          <td key={column} className="px-4 py-3 font-medium text-gov-ink">{String(row[column] ?? "-")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
