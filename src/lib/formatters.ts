/**
 * Formatea montos monetarios con separador de miles local (ej. $25.000).
 */
export function formatCurrency(amount: number, currency = "CLP"): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/**
 * Formatea fecha YYYY-MM-DD a formato legible local (ej. 17 nov 2026).
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
