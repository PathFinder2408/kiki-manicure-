import { useMemo, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocalDateString } from "@/lib/dateUtils";
import { formatCurrency, formatDisplayDate } from "@/lib/formatters";
import { exportFinanzasToCSV } from "@/lib/financeAnalytics";
import type { Finanza, MetodoPago, TipoMovimiento } from "@/types/salon";

interface AdminFinanceTabProps {
  finanzas: Finanza[];
  moneda: string;
  onAddMovimiento: (payload: {
    tipo: TipoMovimiento;
    descripcion: string;
    monto: number;
    fecha: string;
    categoria: string;
    metodo_pago: MetodoPago;
  }) => Promise<boolean>;
  onDeleteMovimiento: (id: number) => Promise<void>;
}

export const AdminFinanceTab = ({
  finanzas,
  moneda,
  onAddMovimiento,
  onDeleteMovimiento,
}: AdminFinanceTabProps) => {
  const [filterType, setFilterType] = useState<"all" | TipoMovimiento>("all");
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<TipoMovimiento>("ingreso");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(getLocalDateString());
  const [categoria, setCategoria] = useState("servicios");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");

  const filtered = useMemo(() => {
    const list = filterType === "all" ? finanzas : finanzas.filter((f) => f.tipo === filterType);
    return [...list].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [finanzas, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number.parseInt(monto, 10);
    if (!descripcion.trim() || !parsedAmount || parsedAmount <= 0) return;

    const ok = await onAddMovimiento({
      tipo,
      descripcion: descripcion.trim(),
      monto: parsedAmount,
      fecha,
      categoria,
      metodo_pago: metodoPago,
    });

    if (ok) {
      setDescripcion("");
      setMonto("");
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-serif font-semibold">Control de Caja y Finanzas</h2>
            <p className="text-xs text-muted-foreground">
              Registra ingresos, insumos y gastos operativos. Exporta tus reportes en 1 clic.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={() => exportFinanzasToCSV(filtered)}
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
            <Button
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={() => setShowForm((v) => !v)}
            >
              <Plus className="w-4 h-4" /> Registrar Movimiento
            </Button>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 rounded-xl border bg-muted/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
          >
            <div>
              <Label className="text-xs">Tipo</Label>
              <select
                value={tipo}
                onChange={(e) => {
                  const val = e.target.value as TipoMovimiento;
                  setTipo(val);
                  setCategoria(val === "ingreso" ? "servicios" : "insumos");
                }}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
              >
                <option value="ingreso">Ingreso (+)</option>
                <option value="egreso">Egreso (-)</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-xs">Descripción</Label>
              <Input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej. Compra esmaltes / Servicio extra"
                className="mt-1 rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-xs">Monto</Label>
              <Input
                type="number"
                min={1}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="25000"
                className="mt-1 rounded-xl tabular-nums"
                required
              />
            </div>

            <div>
              <Label className="text-xs">Método de pago</Label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                />
              </div>
              <Button type="submit" className="rounded-xl self-end">
                Guardar
              </Button>
            </div>
          </form>
        )}

        {/* Filtros rápidos */}
        <div className="flex gap-2 mb-4">
          {(["all", "ingreso", "egreso"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filterType === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t === "all" ? "Todos" : t === "ingreso" ? "Ingresos" : "Egresos"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            No hay movimientos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2.5 pr-4">Fecha</th>
                  <th className="py-2.5 pr-4">Descripción</th>
                  <th className="py-2.5 pr-4">Método</th>
                  <th className="py-2.5 pr-4 text-right">Monto</th>
                  <th className="py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((mov) => (
                  <tr key={mov.id} className="hover:bg-muted/20">
                    <td className="py-3 pr-4 tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatDisplayDate(mov.fecha)}
                    </td>
                    <td className="py-3 pr-4 font-medium">{mov.descripcion}</td>
                    <td className="py-3 pr-4 capitalize text-xs text-muted-foreground">
                      {mov.metodo_pago ?? "efectivo"}
                    </td>
                    <td
                      className={`py-3 pr-4 text-right font-semibold tabular-nums whitespace-nowrap ${
                        mov.tipo === "ingreso" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {mov.tipo === "ingreso" ? "+" : "-"}
                      {formatCurrency(mov.monto, moneda)}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteMovimiento(mov.id)}
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
