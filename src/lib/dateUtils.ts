/**
 * Utilidades de fecha — evita bugs de zona horaria al NO usar toISOString()
 * toISOString() convierte a UTC, lo cual en Chile (UTC-3/UTC-4) puede devolver el día anterior.
 */

/** Devuelve la fecha local en formato YYYY-MM-DD */
export function getLocalDateString(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Devuelve el primer día del mes actual en formato YYYY-MM-DD */
export function getFirstDayOfMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

/** Devuelve el mes actual en formato YYYY-MM */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Devuelve inicio, fin y etiqueta legible de un mes YYYY-MM */
export function getMonthBounds(monthKey: string): {
  start: string;
  end: string;
  label: string;
} {
  const [yStr, mStr] = monthKey.split("-");
  const year = Number.parseInt(yStr, 10) || new Date().getFullYear();
  const month = Number.parseInt(mStr, 10) || new Date().getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, "0");

  const label = new Date(year, month - 1, 1).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(lastDay).padStart(2, "0")}`,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

/** Suma o resta meses a un monthKey YYYY-MM */
export function shiftMonthKey(monthKey: string, delta: number): string {
  const [yStr, mStr] = monthKey.split("-");
  const year = Number.parseInt(yStr, 10) || new Date().getFullYear();
  const month = Number.parseInt(mStr, 10) || new Date().getMonth() + 1;
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
