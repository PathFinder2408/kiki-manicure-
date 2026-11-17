import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Search,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonthSelector } from "@/components/admin/MonthSelector";
import { getMonthBounds } from "@/lib/dateUtils";
import { formatCurrency, formatDisplayDate } from "@/lib/formatters";
import type { Cita, CitaEstado } from "@/types/salon";

interface AdminAgendaTabProps {
  citas: Cita[];
  moneda: string;
  selectedMonth: string;
  onMonthChange: (monthKey: string) => void;
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
  selectedMonth,
  onMonthChange,
  onUpdateEstado,
  onCobrarCita,
}: AdminAgendaTabProps) => {
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState({
    activas: true,
    completadas: false,
    canceladas: false,
  });

  const monthInfo = getMonthBounds(selectedMonth);

  const filtered = useMemo(() => {
    const inMonth = citas.filter(
      (c) => c.fecha >= monthInfo.start && c.fecha <= monthInfo.end
    );
    if (!search.trim()) return inMonth;
    const q = search.toLowerCase();
    return inMonth.filter(
      (c) =>
        c.cliente_nombre.toLowerCase().includes(q) ||
        c.cliente_telefono.toLowerCase().includes(q) ||
        c.servicio.toLowerCase().includes(q)
    );
  }, [citas, search, monthInfo.start, monthInfo.end]);

  const groups = useMemo(() => {
    const activas = filtered
      .filter((c) => c.estado === "pendiente" || c.estado === "confirmada")
      .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));

    const completadas = filtered
      .filter((c) => c.estado === "completada")
      .sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`));

    const canceladas = filtered
      .filter((c) => c.estado === "cancelada" || c.estado === "no_asistio")
      .sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`));

    return { activas, completadas, canceladas };
  }, [filtered]);

  const toggleGroup = (key: keyof typeof openGroups) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCompactRow = (cita: Cita) => (
    <div
      key={cita.id}
      className="px-3.5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-muted/20 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
        <span className="text-xs font-semibold tabular-nums text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
          {formatDisplayDate(cita.fecha)} · {cita.hora.slice(0, 5)}
        </span>

        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
            STATUS_BADGE[cita.estado] ?? "bg-muted"
          }`}
        >
          {cita.estado.replace("_", " ")}
        </span>

        <span className="font-medium text-sm truncate">{cita.cliente_nombre}</span>
        <span className="text-xs text-muted-foreground truncate">
          {cita.servicio} · {cita.cliente_telefono}
        </span>
        {cita.precio_acordado > 0 && (
          <span className="text-xs font-semibold tabular-nums text-foreground">
            {formatCurrency(cita.precio_acordado, moneda)}
          </span>
        )}
        {cita.notas && (
          <span className="text-[11px] italic text-muted-foreground truncate max-w-xs">
            ({cita.notas})
          </span>
        )}
      </div>

      {(cita.estado === "pendiente" || cita.estado === "confirmada") && (
        <div className="flex items-center gap-1.5 shrink-0">
          {cita.estado === "pendiente" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs rounded-lg gap-1"
              onClick={() => onUpdateEstado(cita.id, "confirmada")}
            >
              <Check className="w-3 h-3" /> Confirmar
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs rounded-lg gap-1"
            onClick={() => onCobrarCita(cita)}
          >
            <DollarSign className="w-3 h-3" /> Cobrar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs rounded-lg text-destructive hover:text-destructive"
            onClick={() => onUpdateEstado(cita.id, "cancelada")}
            title="Cancelar cita"
          >
            <XCircle className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderSection = (
    key: keyof typeof openGroups,
    title: string,
    items: Cita[],
    badgeClass: string
  ) => {
    const isOpen = openGroups[key];
    return (
      <div className="border rounded-xl overflow-hidden bg-card">
        <button
          type="button"
          onClick={() => toggleGroup(key)}
          className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-semibold text-sm">{title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums ${badgeClass}`}>
              {items.length}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {isOpen ? "Ocultar" : "Ver detalle"}
          </span>
        </button>

        {isOpen && (
          <div className="divide-y">
            {items.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No hay citas en esta categoría.
              </p>
            ) : (
              items.map(renderCompactRow)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border/60 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold">
            Gestión de Agenda · {monthInfo.label}
          </h2>
          <p className="text-xs text-muted-foreground">
            Vista compacta por mes agrupada por estado. Haz clic para expandir o comprimir.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={onMonthChange} />

          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar clienta, teléfono o servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {renderSection(
          "activas",
          "Pendientes y Confirmadas (Por atender)",
          groups.activas,
          "bg-amber-100 text-amber-800"
        )}
        {renderSection(
          "completadas",
          "Realizadas (Completadas)",
          groups.completadas,
          "bg-green-100 text-green-800"
        )}
        {renderSection(
          "canceladas",
          "Canceladas / No asistió",
          groups.canceladas,
          "bg-red-100 text-red-700"
        )}
      </div>
    </Card>
  );
};
