import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Cita, MetodoPago } from "@/types/salon";

interface CobrarCitaModalProps {
  cita: Cita | null;
  onClose: () => void;
  onConfirm: (cita: Cita, monto: number, metodoPago: MetodoPago) => Promise<void>;
}

export const CobrarCitaModal = ({ cita, onClose, onConfirm }: CobrarCitaModalProps) => {
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("transferencia");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cita) {
      setMonto(String(cita.precio_acordado > 0 ? cita.precio_acordado : 20000));
      setMetodoPago("transferencia");
    }
  }, [cita]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cita) return;
    const parsed = Number.parseInt(monto, 10);
    if (!parsed || parsed <= 0) return;
    setSubmitting(true);
    try {
      await onConfirm(cita, parsed, metodoPago);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(cita)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" /> Cobrar y Cerrar Cita
          </DialogTitle>
          <DialogDescription>
            {cita &&
              `Se marcará la cita de ${cita.cliente_nombre} como completada y el ingreso se sumará automáticamente a Finanzas.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label>Monto cobrado</Label>
            <Input
              type="number"
              min={1}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="mt-1 rounded-xl tabular-nums text-lg font-semibold"
              required
            />
          </div>

          <div>
            <Label>Método de pago</Label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl">
              {submitting ? "Registrando..." : "Confirmar Cobro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
