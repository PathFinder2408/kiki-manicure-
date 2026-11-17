import type { Finanza, MetodoPago } from "@/types/salon";

export interface FinanceSummary {
  ingresos: number;
  egresos: number;
  balance: number;
  margenPct: number;
  ticketPromedio: number;
  ingresosCount: number;
}

export interface DailyChartPoint {
  fecha: string;
  label: string;
  ingresos: number;
  egresos: number;
}

export interface PaymentMethodBreakdown {
  method: MetodoPago;
  label: string;
  total: number;
  pct: number;
}

const PAYMENT_LABELS: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  otro: "Otro",
};

export function calculateFinanceSummary(finanzas: Finanza[]): FinanceSummary {
  let ingresos = 0;
  let egresos = 0;
  let ingresosCount = 0;

  for (const mov of finanzas) {
    const monto = Number(mov.monto) || 0;
    if (mov.tipo === "ingreso") {
      ingresos += monto;
      ingresosCount += 1;
    } else if (mov.tipo === "egreso") {
      egresos += monto;
    }
  }

  const balance = ingresos - egresos;
  const margenPct = ingresos > 0 ? Math.round((balance / ingresos) * 100) : 0;
  const ticketPromedio = ingresosCount > 0 ? Math.round(ingresos / ingresosCount) : 0;

  return { ingresos, egresos, balance, margenPct, ticketPromedio, ingresosCount };
}

export function groupFinanzasByDay(finanzas: Finanza[]): DailyChartPoint[] {
  const map = new Map<string, { ingresos: number; egresos: number }>();

  for (const mov of finanzas) {
    const key = mov.fecha;
    const current = map.get(key) ?? { ingresos: 0, egresos: 0 };
    const monto = Number(mov.monto) || 0;
    if (mov.tipo === "ingreso") current.ingresos += monto;
    else if (mov.tipo === "egreso") current.egresos += monto;
    map.set(key, current);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, vals]) => {
      const [, m = "", d = ""] = fecha.split("-");
      return {
        fecha,
        label: `${d}/${m}`,
        ingresos: vals.ingresos,
        egresos: vals.egresos,
      };
    });
}

export function groupIncomeByPaymentMethod(finanzas: Finanza[]): PaymentMethodBreakdown[] {
  const totals: Record<MetodoPago, number> = {
    efectivo: 0,
    transferencia: 0,
    tarjeta: 0,
    otro: 0,
  };

  let grandTotal = 0;
  for (const mov of finanzas) {
    if (mov.tipo !== "ingreso") continue;
    const method: MetodoPago = mov.metodo_pago ?? "efectivo";
    const monto = Number(mov.monto) || 0;
    totals[method] = (totals[method] ?? 0) + monto;
    grandTotal += monto;
  }

  return (Object.keys(totals) as MetodoPago[])
    .map((method) => ({
      method,
      label: PAYMENT_LABELS[method],
      total: totals[method],
      pct: grandTotal > 0 ? Math.round((totals[method] / grandTotal) * 100) : 0,
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function exportFinanzasToCSV(finanzas: Finanza[], filename = "finanzas-salon.csv") {
  const headers = ["Fecha", "Tipo", "Categoría", "Método de Pago", "Descripción", "Monto"];
  const rows = finanzas.map((f) => [
    f.fecha,
    f.tipo,
    f.categoria ?? "servicios",
    f.metodo_pago ?? "efectivo",
    `"${(f.descripcion ?? "").replace(/"/g, '""')}"`,
    String(f.monto),
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
