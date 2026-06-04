/**
 * Utilidades de fecha — evita bugs de zona horaria al NO usar toISOString()
 * toISOString() convierte a UTC, lo cual en Chile (UTC-3/UTC-4) puede devolver el día anterior.
 */

/** Devuelve la fecha local en formato YYYY-MM-DD */
export function getLocalDateString(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Devuelve el primer día del mes actual en formato YYYY-MM-DD */
export function getFirstDayOfMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}
