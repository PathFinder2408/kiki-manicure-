import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabase";
import type { NegocioConfig, WeeklySchedule } from "@/types/salon";

interface AdminSettingsTabProps {
  config: NegocioConfig;
  onSaved: () => void;
}

const WEEK_DAYS = [
  { id: "1", label: "Lunes" },
  { id: "2", label: "Martes" },
  { id: "3", label: "Miércoles" },
  { id: "4", label: "Jueves" },
  { id: "5", label: "Viernes" },
  { id: "6", label: "Sábado" },
  { id: "0", label: "Domingo" },
];

function buildInitialSchedule(config: NegocioConfig): WeeklySchedule {
  if (config.horarios_semana && Object.keys(config.horarios_semana).length === 7) {
    return config.horarios_semana;
  }
  const result: WeeklySchedule = {};
  for (const d of WEEK_DAYS) {
    const dayNum = Number(d.id);
    result[d.id] = {
      activo: !config.dias_cerrados.includes(dayNum),
      apertura: config.horario_apertura || "09:00",
      cierre: config.horario_cierre || "19:00",
    };
  }
  return result;
}

export const AdminSettingsTab = ({ config, onSaved }: AdminSettingsTabProps) => {
  const [form, setForm] = useState<NegocioConfig>(config);
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => buildInitialSchedule(config));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(config);
    setSchedule(buildInitialSchedule(config));
  }, [config]);

  const updateDay = (
    dayId: string,
    patch: Partial<{
      activo: boolean;
      apertura: string;
      cierre: string;
      bloque2_activo: boolean;
      apertura2: string;
      cierre2: string;
    }>
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...(prev[dayId] ?? {
          activo: true,
          apertura: "09:00",
          cierre: "19:00",
          bloque2_activo: false,
          apertura2: "17:00",
          cierre2: "20:00",
        }),
        ...patch,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const closedDays = Object.entries(schedule)
        .filter(([, val]) => !val.activo)
        .map(([k]) => Number(k));

      const { error } = await supabase.from("negocio_config").upsert({
        ...form,
        id: 1,
        dias_cerrados: closedDays,
        horarios_semana: schedule,
      });

      if (error) {
        toast.error("No se pudo guardar la configuración");
        return;
      }

      toast.success("Configuración y horarios actualizados");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border/60 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" /> Configuración White-Label del Negocio
        </h2>
        <p className="text-xs text-muted-foreground">
          Personaliza la identidad del salón, moneda y horarios específicos para cada día de la semana.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Nombre del Salón</Label>
            <Input
              value={form.nombre_salon}
              onChange={(e) => setForm({ ...form, nombre_salon: e.target.value })}
              className="mt-1 rounded-xl"
              required
            />
          </div>
          <div>
            <Label>Subtítulo / Eslogan</Label>
            <Input
              value={form.subtitulo}
              onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
              className="mt-1 rounded-xl"
            />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="mt-1 rounded-xl"
            />
          </div>
          <div>
            <Label>Moneda</Label>
            <select
              value={form.moneda}
              onChange={(e) => setForm({ ...form, moneda: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
            >
              <option value="CLP">CLP (Peso Chileno $)</option>
              <option value="USD">USD (Dólar US$)</option>
              <option value="MXN">MXN (Peso Mexicano $)</option>
              <option value="ARS">ARS (Peso Argentino $)</option>
              <option value="COP">COP (Peso Colombiano $)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-sm font-semibold">Horarios Disponibles por Día</Label>
              <p className="text-xs text-muted-foreground">
                Activa cualquier día (ej. Domingo de 15:00 a 18:00) y define su rango horario.
              </p>
            </div>
            <div className="w-full sm:w-44">
              <select
                value={form.intervalo_min}
                onChange={(e) =>
                  setForm({ ...form, intervalo_min: Number.parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-1.5 rounded-xl border bg-background text-xs tabular-nums"
              >
                <option value={30}>Turnos cada 30 min</option>
                <option value={45}>Turnos cada 45 min</option>
                <option value={60}>Turnos cada 60 min</option>
              </select>
            </div>
          </div>

          <div className="divide-y border rounded-xl overflow-hidden bg-card">
            {WEEK_DAYS.map((day) => {
              const cfg = schedule[day.id] ?? {
                activo: true,
                apertura: "09:00",
                cierre: "19:00",
              };
              return (
                <div
                  key={day.id}
                  className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => updateDay(day.id, { activo: !cfg.activo })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        cfg.activo
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {cfg.activo ? "Abierto" : "Cerrado"}
                    </button>
                    <span className="text-sm font-medium">{day.label}</span>
                  </div>

                  {cfg.activo ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-muted-foreground w-14">Mañana:</span>
                        <Input
                          type="time"
                          value={cfg.apertura}
                          onChange={(e) => updateDay(day.id, { apertura: e.target.value })}
                          className="h-8 w-28 rounded-lg tabular-nums text-xs"
                        />
                        <span className="text-muted-foreground">a</span>
                        <Input
                          type="time"
                          value={cfg.cierre}
                          onChange={(e) => updateDay(day.id, { cierre: e.target.value })}
                          className="h-8 w-28 rounded-lg tabular-nums text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateDay(day.id, {
                              bloque2_activo: !cfg.bloque2_activo,
                              apertura2: cfg.apertura2 ?? "17:00",
                              cierre2: cfg.cierre2 ?? "20:00",
                            })
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                            cfg.bloque2_activo
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {cfg.bloque2_activo ? "− Quitar tarde" : "+ Horario tarde"}
                        </button>
                      </div>

                      {cfg.bloque2_activo && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-muted-foreground w-14">Tarde:</span>
                          <Input
                            type="time"
                            value={cfg.apertura2 ?? "17:00"}
                            onChange={(e) => updateDay(day.id, { apertura2: e.target.value })}
                            className="h-8 w-28 rounded-lg tabular-nums text-xs"
                          />
                          <span className="text-muted-foreground">a</span>
                          <Input
                            type="time"
                            value={cfg.cierre2 ?? "20:00"}
                            onChange={(e) => updateDay(day.id, { cierre2: e.target.value })}
                            className="h-8 w-28 rounded-lg tabular-nums text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No disponible para reservas
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={saving} className="rounded-xl gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
