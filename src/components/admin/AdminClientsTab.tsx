import { useMemo, useState } from "react";
import { ClipboardList, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineSalonLoader } from "@/components/SalonLoader";
import { getLocalDateString } from "@/lib/dateUtils";
import { formatCurrency, formatDisplayDate } from "@/lib/formatters";
import { supabase } from "@/supabase";
import type { Cita, Clienta, ClientaAtencion } from "@/types/salon";

interface AdminClientsTabProps {
  clientas: Clienta[];
  citas: Cita[];
  moneda: string;
  onRefreshClientas: () => void;
}

interface ClientStats {
  visitas: number;
  completadas: number;
  totalInvertido: number;
  ultimaFecha: string;
}

const EMPTY_FORM = {
  nombre: "",
  telefono: "",
  email: "",
  notas: "",
};

export const AdminClientsTab = ({
  clientas,
  citas,
  moneda,
  onRefreshClientas,
}: AdminClientsTabProps) => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Clienta | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Ficha / Memoria de Servicios por clienta
  const [fichaClient, setFichaClient] = useState<Clienta | null>(null);
  const [atenciones, setAtenciones] = useState<ClientaAtencion[]>([]);
  const [loadingFicha, setLoadingFicha] = useState(false);
  const [atencionForm, setAtencionForm] = useState({
    fecha: getLocalDateString(),
    servicio: "",
    productos_tonos: "",
    observaciones: "",
  });

  const openFichaModal = async (client: Clienta) => {
    setFichaClient(client);
    setLoadingFicha(true);
    setAtencionForm({
      fecha: getLocalDateString(),
      servicio: "",
      productos_tonos: "",
      observaciones: "",
    });
    const { data, error } = await supabase
      .from("clienta_atenciones")
      .select("*")
      .eq("clienta_id", client.id)
      .order("fecha", { ascending: false });
    if (!error && data) {
      setAtenciones(data as ClientaAtencion[]);
    } else {
      setAtenciones([]);
    }
    setLoadingFicha(false);
  };

  const handleAddAtencion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fichaClient || !atencionForm.servicio.trim()) return;
    const { error } = await supabase.from("clienta_atenciones").insert({
      clienta_id: fichaClient.id,
      fecha: atencionForm.fecha,
      servicio: atencionForm.servicio.trim(),
      productos_tonos: atencionForm.productos_tonos.trim(),
      observaciones: atencionForm.observaciones.trim(),
    });
    if (error) {
      toast.error("No se pudo guardar el registro de atención");
      return;
    }
    toast.success("Registro guardado en la ficha de la clienta");
    openFichaModal(fichaClient);
  };

  const handleDeleteAtencion = async (id: string) => {
    const { error } = await supabase.from("clienta_atenciones").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar registro");
      return;
    }
    if (fichaClient) openFichaModal(fichaClient);
  };

  // Calcula estadísticas reales cruzando citas por teléfono
  const statsByPhone = useMemo(() => {
    const map = new Map<string, ClientStats>();
    for (const c of citas) {
      const phone = (c.cliente_telefono || "").trim();
      if (!phone) continue;
      const current = map.get(phone) ?? {
        visitas: 0,
        completadas: 0,
        totalInvertido: 0,
        ultimaFecha: c.fecha,
      };
      current.visitas += 1;
      if (c.estado === "completada") {
        current.completadas += 1;
        current.totalInvertido += Number(c.precio_acordado) || 0;
      }
      if (c.fecha > current.ultimaFecha) {
        current.ultimaFecha = c.fecha;
      }
      map.set(phone, current);
    }
    return map;
  }, [citas]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clientas;
    const q = search.toLowerCase();
    return clientas.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.telefono.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }, [clientas, search]);

  const openCreateModal = () => {
    setEditingClient(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (client: Clienta) => {
    setEditingClient(client);
    setForm({
      nombre: client.nombre,
      telefono: client.telefono,
      email: client.email ?? "",
      notas: client.notas ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.telefono.trim()) {
      toast.error("Nombre y teléfono son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        notas: form.notas.trim(),
      };

      if (editingClient) {
        const { error } = await supabase
          .from("clientas")
          .update(payload)
          .eq("id", editingClient.id);
        if (error) {
          toast.error(
            error.code === "23505"
              ? "Ya existe otra clienta con ese teléfono"
              : "No se pudo actualizar la clienta"
          );
          return;
        }
        toast.success("Clienta actualizada");
      } else {
        const { error } = await supabase.from("clientas").insert(payload);
        if (error) {
          toast.error(
            error.code === "23505"
              ? "Ya existe una clienta registrada con ese teléfono"
              : "No se pudo registrar la clienta"
          );
          return;
        }
        toast.success("Clienta registrada manualmente");
      }

      setModalOpen(false);
      onRefreshClientas();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client: Clienta) => {
    const { error } = await supabase.from("clientas").delete().eq("id", client.id);
    if (error) {
      toast.error("No se pudo eliminar la clienta");
      return;
    }
    toast.success(`Clienta ${client.nombre} eliminada`);
    onRefreshClientas();
  };

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> CRM de Clientas
          </h2>
          <p className="text-xs text-muted-foreground">
            Se auto-registran al agendar. También puedes crear, editar o agregar notas manualmente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar clienta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl w-full sm:w-56"
            />
          </div>
          <Button size="sm" className="rounded-xl gap-1.5" onClick={openCreateModal}>
            <Plus className="w-4 h-4" /> Nueva Clienta
          </Button>
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
                <th className="py-2.5 pr-4 text-right">Total invertido</th>
                <th className="py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((client) => {
                const stats = statsByPhone.get(client.telefono.trim());
                return (
                  <tr key={client.id} className="hover:bg-muted/20">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{client.nombre}</div>
                      {client.notas && (
                        <div className="text-xs text-muted-foreground italic line-clamp-1">
                          {client.notas}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      <div>{client.telefono}</div>
                      <div>{client.email || "—"}</div>
                    </td>
                    <td className="py-3 pr-4 text-center tabular-nums">
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                        {stats ? `${stats.completadas} / ${stats.visitas}` : "0 / 0"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                      {stats ? formatDisplayDate(stats.ultimaFecha) : "Sin visitas"}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold tabular-nums text-primary">
                      {formatCurrency(stats?.totalInvertido ?? 0, moneda)}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs rounded-lg gap-1 mr-1"
                        onClick={() => openFichaModal(client)}
                        title="Ficha y memoria de servicios"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> Ficha
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditModal(client)}
                        title="Editar clienta"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(client)}
                        title="Eliminar clienta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar Clienta */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingClient ? "Editar Clienta" : "Registrar Nueva Clienta"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label>Nombre completo</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Camila Rojas"
                className="mt-1 rounded-xl"
                required
              />
            </div>
            <div>
              <Label>Teléfono / WhatsApp</Label>
              <Input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="+56 9 1234 5678"
                className="mt-1 rounded-xl"
                required
              />
            </div>
            <div>
              <Label>Correo electrónico</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="camila@ejemplo.com"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Notas / Preferencias / Alergias</Label>
              <Textarea
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Ej. Prefiere tonos pastel, alérgica a..."
                rows={3}
                className="mt-1 rounded-xl"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="rounded-xl">
                {saving ? "Guardando..." : editingClient ? "Guardar Cambios" : "Registrar Clienta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Ficha / Memoria de Servicios por Clienta */}
      <Dialog open={Boolean(fichaClient)} onOpenChange={(open) => !open && setFichaClient(null)}>
        <DialogContent className="rounded-2xl sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {fichaClient && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Ficha de {fichaClient.nombre}
                </DialogTitle>
              </DialogHeader>

              {fichaClient.notas && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Notas / Alergias:</strong> {fichaClient.notas}
                </div>
              )}

              <form onSubmit={handleAddAtencion} className="p-4 rounded-xl border bg-muted/30 space-y-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  + Registrar Servicio Entregado
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Fecha</Label>
                    <Input
                      type="date"
                      value={atencionForm.fecha}
                      onChange={(e) => setAtencionForm({ ...atencionForm, fecha: e.target.value })}
                      className="mt-1 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Servicio realizado</Label>
                    <Input
                      value={atencionForm.servicio}
                      onChange={(e) => setAtencionForm({ ...atencionForm, servicio: e.target.value })}
                      placeholder="Ej. Gel UV + Diseño"
                      className="mt-1 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Productos / Tonos usados</Label>
                  <Input
                    value={atencionForm.productos_tonos}
                    onChange={(e) =>
                      setAtencionForm({ ...atencionForm, productos_tonos: e.target.value })
                    }
                    placeholder="Ej. Base Rubber Milky + Top Pearl"
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs">Observaciones técnicas</Label>
                  <Textarea
                    value={atencionForm.observaciones}
                    onChange={(e) =>
                      setAtencionForm({ ...atencionForm, observaciones: e.target.value })
                    }
                    placeholder="Detalles de cutícula, largo, retención..."
                    rows={2}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <Button type="submit" size="sm" className="rounded-xl">
                  Guardar en Ficha
                </Button>
              </form>

              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Memoria de Atenciones ({atenciones.length})
                </p>
                {loadingFicha ? (
                  <InlineSalonLoader context="ficha" />
                ) : atenciones.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-xl">
                    Aún no hay atenciones registradas en su ficha.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {atenciones.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl border bg-card flex justify-between gap-3">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary tabular-nums">
                              {formatDisplayDate(item.fecha)}
                            </span>
                            <span className="font-semibold text-foreground">{item.servicio}</span>
                          </div>
                          {item.productos_tonos && (
                            <p className="text-muted-foreground">
                              <strong>Tonos/Productos:</strong> {item.productos_tonos}
                            </p>
                          )}
                          {item.observaciones && (
                            <p className="text-muted-foreground italic">{item.observaciones}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive shrink-0"
                          onClick={() => handleDeleteAtencion(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
