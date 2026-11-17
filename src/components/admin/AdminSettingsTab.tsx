import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabase";
import type { NegocioConfig } from "@/types/salon";

interface AdminSettingsTabProps {
  config: NegocioConfig;
  onSaved: () => void;
}

const WEEK_DAYS = [
  { id: 0, label: "Dom" },
  { id: 1, label: "Lun" },
  { id: 2, label: "Mar" },
  { id: 3, label: "Mié" },
  { id: 4, label: "Jue" },
  { id: 5, label: "Vie" },
  { id: 6, label: "Sáb" },
];

export const AdminSettingsTab = ({ config, onSaved }: AdminSettingsTabProps) => {
  const [form, setForm] = useState<NegocioConfig>(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(config);
  }, [config]);

  const toggleClosedDay = (dayId: number) => {
    setForm((prev) => {
      const exists = prev.dias_cerrados.includes(dayId);
      return {
        ...prev,
        dias_cerrados: exists
          ? prev.dias_cerrados.filter((d) => d !== dayId)
          : [...prev.dias_cerrados, dayId],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("negocio_config")
        .upsert({ ...form, id: 1 });

      if (error) {
        toast.error("No se pudo guardar la configuración");
        return;
      }

      toast.success("Configuración del negocio actualizada");
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
          Personaliza la identidad del salón, horarios de atención y moneda sin tocar código.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
          <div>
            <Label>Hora Apertura</Label>
            <Input
              type="time"
              value={form.horario_apertura}
              onChange={(e) => setForm({ ...form, horario_apertura: e.target.value })}
              className="mt-1 rounded-xl tabular-nums"
            />
          </div>
          <div>
            <Label>Hora Cierre</Label>
            <Input
              type="time"
              value={form.horario_cierre}
              onChange={(e) => setForm({ ...form, horario_cierre: e.target.value })}
              className="mt-1 rounded-xl tabular-nums"
            />
          </div>
          <div>
            <Label>Intervalo Agenda (min)</Label>
            <select
              value={form.intervalo_min}
              onChange={(e) =>
                setForm({ ...form, intervalo_min: Number.parseInt(e.target.value, 10) })
              }
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm tabular-nums"
            >
              <option value={30}>Cada 30 min</option>
              <option value={45}>Cada 45 min</option>
              <option value={60}>Cada 60 min</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Label className="block mb-2">Días Cerrados (No disponibles para reserva)</Label>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const isClosed = form.dias_cerrados.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleClosedDay(day.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    isClosed
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  {day.label} {isClosed ? "(Cerrado)" : ""}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={saving} className="rounded-xl gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
