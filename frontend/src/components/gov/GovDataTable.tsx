"use client";

import { ReactNode } from "react";
import "../../styles/gov-theme.css";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

interface GovDataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
  rowClassName?: (row: Record<string, unknown>) => string;
}

/**
 * Government-styled data table with loading, error, and empty states.
 * Wraps in a horizontal-scroll container for mobile.
 */
export default function GovDataTable({
  columns,
  data,
  loading = false,
  error,
  emptyMessage = "No records found.",
  onRowClick,
  rowClassName,
}: GovDataTableProps) {
  if (loading) {
    return (
      <div className="gov-card">
        <div className="gov-card-body" style={{ textAlign: "center", padding: 48 }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid var(--gov-border)",
              borderTopColor: "var(--gov-primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "var(--gov-text-muted)", fontSize: 13 }}>Loading data…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gov-alert danger">
        {error}
      </div>
    );
  }

  return (
    <div className="gov-card">
      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ textAlign: col.align || "left" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: "var(--gov-text-muted)" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={(row.id as string) || idx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                  className={rowClassName ? rowClassName(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ textAlign: col.align || "left" }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] as ReactNode) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
