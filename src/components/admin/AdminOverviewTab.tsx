import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Calendar, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  calculateFinanceSummary,
  groupFinanzasByDay,
  groupIncomeByPaymentMethod,
} from "@/lib/financeAnalytics";
import type { Cita, Finanza } from "@/types/salon";

interface AdminOverviewTabProps {
  citasHoy: Cita[];
  finanzasMes: Finanza[];
  moneda: string;
  onCobrarCita: (cita: Cita) => void;
  onGoToAgenda: () => void;
}

export const AdminOverviewTab = ({
  citasHoy,
  finanzasMes,
  moneda,
  onCobrarCita,
  onGoToAgenda,
}: AdminOverviewTabProps) => {
  const summary = calculateFinanceSummary(finanzasMes);
  const dailyData = groupFinanzasByDay(finanzasMes);
  const paymentBreakdown = groupIncomeByPaymentMethod(finanzasMes);

  const pendingToday = citasHoy.filter(
    (c) => c.estado !== "cancelada" && c.estado !== "no_asistio"
  );

  return (
    <div className="space-y-6">
      {/* KPIs Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl border-border/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ingresos del Mes
            </span>
            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(summary.ingresos, moneda)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {summary.ingresosCount} cobros registrados
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Egresos del Mes
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(summary.egresos, moneda)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Insumos y gastos operativos</p>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              Balance Neto
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums text-primary">
            {formatCurrency(summary.balance, moneda)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            Margen neto: {summary.margenPct}%
          </p>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(summary.ticketPromedio, moneda)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {pendingToday.length} citas activas hoy
          </p>
        </Card>
      </div>

      {/* Gráficos: Flujo de Caja + Métodos de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-semibold text-lg">Flujo de Caja Diario</h3>
              <p className="text-xs text-muted-foreground">
                Comparativa de ingresos vs egresos del mes en curso
              </p>
            </div>
          </div>

          {dailyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
              Aún no hay movimientos financieros este mes.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E0D8" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, moneda)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E7E0D8",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#15803D" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="egresos" name="Egresos" fill="#B91C1C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6 rounded-2xl border-border/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="font-serif font-semibold text-lg">Métodos de Pago</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Distribución de ingresos recibidos
            </p>

            {paymentBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Sin ingresos registrados aún.
              </p>
            ) : (
              <div className="space-y-4">
                {paymentBreakdown.map((item) => (
                  <div key={item.method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.label}</span>
                      <span className="tabular-nums font-semibold">
                        {formatCurrency(item.total, moneda)}{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({item.pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Citas de Hoy (Acción rápida) */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-serif font-semibold text-lg">Agenda de Hoy</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onGoToAgenda}>
            Ver toda la agenda
          </Button>
        </div>

        {pendingToday.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No hay citas activas programadas para hoy.
          </p>
        ) : (
          <div className="divide-y">
            {pendingToday.map((cita) => (
              <div
                key={cita.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-sm tabular-nums">
                    {cita.hora.slice(0, 5)}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{cita.cliente_nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {cita.servicio} · {cita.cliente_telefono}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted capitalize">
                    {cita.estado}
                  </span>
                  {cita.estado !== "completada" && (
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => onCobrarCita(cita)}
                    >
                      Cobrar y Cerrar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
