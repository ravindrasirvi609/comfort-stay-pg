/**
 * Shared CSV export utilities.
 * Implements RFC-4180 style escaping and triggers a browser download.
 */

/** Escape a single value for safe inclusion in a CSV cell. */
export function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if the value contains a comma, quote, or newline;
  // double any embedded quotes per RFC 4180.
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Build a full CSV string from headers and rows of arbitrary values. */
export function arrayToCSV(headers: string[], rows: unknown[][]): string {
  const headerLine = headers.map(escapeCSVValue).join(",");
  const dataLines = rows.map((row) => row.map(escapeCSVValue).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}

/**
 * Trigger a browser download of a CSV file built from headers + rows.
 * Prepends a UTF-8 BOM so Excel correctly renders non-ASCII characters (e.g. ₹).
 */
export function downloadCSV(filename: string, headers: string[], rows: unknown[][]): void {
  const csvContent = arrayToCSV(headers, rows);
  const BOM = "﻿";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
