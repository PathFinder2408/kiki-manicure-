import { describe, expect, it } from "vitest";
import {
  calculateFinanceSummary,
  groupFinanzasByDay,
  groupIncomeByPaymentMethod,
} from "../financeAnalytics";
import type { Finanza } from "@/types/salon";

const SAMPLE_DATA: Finanza[] = [
  {
    id: 1,
    tipo: "ingreso",
    descripcion: "Gel UV",
    monto: 25000,
    fecha: "2026-11-10",
    categoria: "servicios",
    metodo_pago: "transferencia",
  },
  {
    id: 2,
    tipo: "ingreso",
    descripcion: "Acrílico",
    monto: 35000,
    fecha: "2026-11-10",
    categoria: "servicios",
    metodo_pago: "efectivo",
  },
  {
    id: 3,
    tipo: "egreso",
    descripcion: "Insumos",
    monto: 15000,
    fecha: "2026-11-11",
    categoria: "insumos",
    metodo_pago: "efectivo",
  },
];

describe("financeAnalytics", () => {
  it("calculates ingresos, egresos, balance, margin and average ticket", () => {
    const summary = calculateFinanceSummary(SAMPLE_DATA);
    expect(summary.ingresos).toBe(60000);
    expect(summary.egresos).toBe(15000);
    expect(summary.balance).toBe(45000);
    expect(summary.margenPct).toBe(75);
    expect(summary.ticketPromedio).toBe(30000);
    expect(summary.ingresosCount).toBe(2);
  });

  it("groups movements chronologically by day", () => {
    const days = groupFinanzasByDay(SAMPLE_DATA);
    expect(days).toHaveLength(2);
    expect(days[0]).toEqual({
      fecha: "2026-11-10",
      label: "10/11",
      ingresos: 60000,
      egresos: 0,
    });
    expect(days[1]).toEqual({
      fecha: "2026-11-11",
      label: "11/11",
      ingresos: 0,
      egresos: 15000,
    });
  });

  it("breaks down income by payment method", () => {
    const breakdown = groupIncomeByPaymentMethod(SAMPLE_DATA);
    expect(breakdown[0].method).toBe("efectivo");
    expect(breakdown[0].total).toBe(35000);
    expect(breakdown[1].method).toBe("transferencia");
    expect(breakdown[1].total).toBe(25000);
  });
});
