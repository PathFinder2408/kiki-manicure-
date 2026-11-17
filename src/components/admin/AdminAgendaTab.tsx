import { useMemo, useState } from "react";
import { Check, Search, XCircle, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDisplayDate } from "@/lib/formatters";
import type { Cita, CitaEstado } from "@/types/salon";

interface AdminAgendaTabProps {
  citas: Cita[];
  moneda: string;
  onUpdateEstado: (citaId: number, estado: CitaEstado) => Promise<void>;
  onCobrarCita: (cita: Cita) => void;
}

const STATUS_BADGE: Record<CitaEstado, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmada: "bg-blue-100 text-blue-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-700",
  no_asistio: "bg-stone-200 text-stone-700",
};

export const AdminAgendaTab = ({
  citas,
  moneda,
  onUpdateEstado,
  onCobrarCita,
}: AdminAgendaTabProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return citas.filter((c) => {
      if (statusFilter !== "all" && c.estado !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.cliente_nombre.toLowerCase().includes(q) ||
        c.cliente_telefono.toLowerCase().includes(q) ||
        c.servicio.toLowerCase().includes(q)
      );
    });
  }, [citas, search, statusFilter]);

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-serif font-semibold">Gestión de Agenda</h2>
          <p className="text-xs text-muted-foreground">
            Confirma reservas, cancela espacios o cobra citas completadas en 1 clic.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar clienta o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl w-full sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border bg-background text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
          No se encontraron citas con ese criterio.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cita) => (
            <div
              key={cita.id}
              className="p-4 rounded-xl border bg-card flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm tabular-nums text-primary">
                    {formatDisplayDate(cita.fecha)} · {cita.hora.slice(0, 5)}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                      STATUS_BADGE[cita.estado] ?? "bg-muted"
                    }`}
                  >
                    {cita.estado.replace("_", " ")}
                  </span>
                  {cita.precio_acordado > 0 && (
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {formatCurrency(cita.precio_acordado, moneda)}
                    </span>
                  )}
                </div>
                <p className="font-medium">{cita.cliente_nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {cita.servicio} · {cita.cliente_telefono} · {cita.cliente_email}
                </p>
                {cita.notas && (
                  <p className="text-xs italic text-muted-foreground">Nota: {cita.notas}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {cita.estado === "pendiente" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-1"
                    onClick={() => onUpdateEstado(cita.id, "confirmada")}
                  >
                    <Check className="w-3.5 h-3.5" /> Confirmar
                  </Button>
                )}

                {(cita.estado === "pendiente" || cita.estado === "confirmada") && (
                  <>
                    <Button
                      size="sm"
                      className="rounded-xl gap-1"
                      onClick={() => onCobrarCita(cita)}
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Cobrar y Cerrar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl text-destructive hover:text-destructive gap-1"
                      onClick={() => onUpdateEstado(cita.id, "cancelada")}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
