import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDisplayDate } from "@/lib/formatters";
import type { Cita } from "@/types/salon";

interface AdminClientsTabProps {
  citas: Cita[];
  moneda: string;
}

interface ClientSummary {
  key: string;
  nombre: string;
  telefono: string;
  email: string;
  visitas: number;
  completadas: number;
  totalInvertido: number;
  ultimaFecha: string;
}

export const AdminClientsTab = ({ citas, moneda }: AdminClientsTabProps) => {
  const [search, setSearch] = useState("");

  const clients = useMemo<ClientSummary[]>(() => {
    const map = new Map<string, ClientSummary>();
    for (const c of citas) {
      const key = (c.cliente_telefono || c.cliente_email || c.cliente_nombre)
        .trim()
        .toLowerCase();
      const existing = map.get(key) ?? {
        key,
        nombre: c.cliente_nombre,
        telefono: c.cliente_telefono,
        email: c.cliente_email,
        visitas: 0,
        completadas: 0,
        totalInvertido: 0,
        ultimaFecha: c.fecha,
      };

      existing.visitas += 1;
      if (c.estado === "completada") {
        existing.completadas += 1;
        existing.totalInvertido += Number(c.precio_acordado) || 0;
      }
      if (c.fecha > existing.ultimaFecha) {
        existing.ultimaFecha = c.fecha;
      }
      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) =>
      b.ultimaFecha.localeCompare(a.ultimaFecha)
    );
  }, [citas]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.telefono.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, search]);

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> CRM de Clientas
          </h2>
          <p className="text-xs text-muted-foreground">
            Historial automático de visitas, última atención y valor acumulado por clienta.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar clienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl w-full sm:w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
          No hay clientas registradas aún.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2.5 pr-4">Clienta</th>
                <th className="py-2.5 pr-4">Contacto</th>
                <th className="py-2.5 pr-4 text-center">Citas</th>
                <th className="py-2.5 pr-4">Última visita</th>
                <th className="py-2.5 text-right">Total invertido</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((client) => (
                <tr key={client.key} className="hover:bg-muted/20">
                  <td className="py-3 pr-4 font-medium">{client.nombre}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">
                    <div>{client.telefono}</div>
                    <div>{client.email}</div>
                  </td>
                  <td className="py-3 pr-4 text-center tabular-nums">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                      {client.completadas} / {client.visitas}
                    </span>
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                    {formatDisplayDate(client.ultimaFecha)}
                  </td>
                  <td className="py-3 text-right font-semibold tabular-nums text-primary">
                    {formatCurrency(client.totalInvertido, moneda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
