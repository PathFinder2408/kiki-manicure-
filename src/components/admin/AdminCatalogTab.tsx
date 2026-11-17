import { useState } from "react";
import { Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";
import { supabase } from "@/supabase";
import type { PortafolioItem, Servicio } from "@/types/salon";

interface AdminCatalogTabProps {
  servicios: Servicio[];
  portafolio: PortafolioItem[];
  moneda: string;
  onRefreshServicios: () => void;
  onRefreshPortafolio: () => void;
}

export const AdminCatalogTab = ({
  servicios,
  portafolio,
  moneda,
  onRefreshServicios,
  onRefreshPortafolio,
}: AdminCatalogTabProps) => {
  // Estado nuevo servicio
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [srvForm, setSrvForm] = useState({
    nombre: "",
    categoria: "gel",
    descripcion: "",
    duracion_min: "60",
    precio: "25000",
  });

  // Estado portafolio
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("gel");
  const [descripcion, setDescripcion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `${srvForm.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;

    const { error } = await supabase.from("servicios").insert({
      slug,
      nombre: srvForm.nombre.trim(),
      categoria: srvForm.categoria,
      descripcion: srvForm.descripcion.trim(),
      duracion_min: Number.parseInt(srvForm.duracion_min, 10) || 60,
      precio: Number.parseInt(srvForm.precio, 10) || 0,
      activo: true,
      orden: servicios.length + 1,
    });

    if (error) {
      toast.error("Error al crear servicio");
      return;
    }

    toast.success("Servicio creado y publicado en la agenda");
    setSrvForm({ nombre: "", categoria: "gel", descripcion: "", duracion_min: "60", precio: "25000" });
    setShowServiceForm(false);
    onRefreshServicios();
  };

  const handleToggleService = async (srv: Servicio) => {
    const { error } = await supabase
      .from("servicios")
      .update({ activo: !srv.activo })
      .eq("id", srv.id);
    if (error) {
      toast.error("No se pudo actualizar el servicio");
      return;
    }
    toast.success(srv.activo ? "Servicio pausado" : "Servicio activado");
    onRefreshServicios();
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !titulo.trim()) {
      toast.error("Selecciona una foto y agrega un título");
      return;
    }
    setUploading(true);
    try {
      const ext = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("Portafolio")
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast.error("Error al subir la imagen");
        return;
      }

      const { data: urlData } = supabase.storage.from("Portafolio").getPublicUrl(fileName);
      const { error: dbError } = await supabase.from("portafolio").insert({
        titulo: titulo.trim(),
        categoria,
        descripcion: descripcion.trim(),
        imagen_url: urlData.publicUrl,
      });

      if (dbError) {
        toast.error("Error al guardar en portafolio");
        return;
      }

      toast.success("Foto agregada al portafolio");
      setTitulo("");
      setDescripcion("");
      setSelectedFile(null);
      onRefreshPortafolio();
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    const { error } = await supabase.from("portafolio").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar foto");
      return;
    }
    toast.success("Foto eliminada");
    onRefreshPortafolio();
  };

  return (
    <div className="space-y-6">
      {/* Servicios */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Catálogo de Servicios
            </h2>
            <p className="text-xs text-muted-foreground">
              Los precios y duraciones que configures aquí se reflejan en tiempo real en /agendar.
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-xl gap-1.5"
            onClick={() => setShowServiceForm((v) => !v)}
          >
            <Plus className="w-4 h-4" /> Nuevo Servicio
          </Button>
        </div>

        {showServiceForm && (
          <form
            onSubmit={handleCreateService}
            className="mb-6 p-4 rounded-xl border bg-muted/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          >
            <div className="lg:col-span-2">
              <Label className="text-xs">Nombre del servicio</Label>
              <Input
                value={srvForm.nombre}
                onChange={(e) => setSrvForm({ ...srvForm, nombre: e.target.value })}
                placeholder="Ej. Soft Gel Francés"
                className="mt-1 rounded-xl"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Categoría</Label>
              <select
                value={srvForm.categoria}
                onChange={(e) => setSrvForm({ ...srvForm, categoria: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
              >
                <option value="gel">Gel</option>
                <option value="acrilico">Acrílico</option>
                <option value="spa">Spa</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Duración (min)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={srvForm.duracion_min}
                onChange={(e) => setSrvForm({ ...srvForm, duracion_min: e.target.value })}
                className="mt-1 rounded-xl tabular-nums"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Precio</Label>
                <Input
                  type="number"
                  min={0}
                  value={srvForm.precio}
                  onChange={(e) => setSrvForm({ ...srvForm, precio: e.target.value })}
                  className="mt-1 rounded-xl tabular-nums"
                  required
                />
              </div>
              <Button type="submit" className="rounded-xl self-end">
                Crear
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y">
          {servicios.map((srv) => (
            <div
              key={srv.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{srv.nombre}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted capitalize">
                    {srv.categoria}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {srv.duracion_min} min · {formatCurrency(srv.precio, moneda)}
                </p>
              </div>
              <Button
                variant={srv.activo ? "outline" : "secondary"}
                size="sm"
                className="rounded-xl w-fit"
                onClick={() => handleToggleService(srv)}
              >
                {srv.activo ? "Activo (Pausar)" : "Pausado (Activar)"}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Portafolio */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
        <h3 className="text-lg font-serif font-semibold mb-4">Portafolio Visual</h3>

        <form
          onSubmit={handleUploadPhoto}
          className="mb-6 p-4 rounded-xl border bg-muted/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          <div>
            <Label className="text-xs">Título del trabajo</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Diseño Aurora"
              className="mt-1 rounded-xl"
              required
            />
          </div>
          <div>
            <Label className="text-xs">Categoría</Label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
            >
              <option value="gel">Uñas Gel</option>
              <option value="acrilico">Uñas Acrílicas</option>
              <option value="spa">Spa de Manos</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">Imagen</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="mt-1 rounded-xl"
              required
            />
          </div>
          <Button type="submit" disabled={uploading} className="rounded-xl gap-1.5">
            <Upload className="w-4 h-4" /> {uploading ? "Subiendo..." : "Subir Foto"}
          </Button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {portafolio.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border bg-card">
              <img
                src={item.imagen_url}
                alt={item.titulo}
                className="w-full h-36 object-cover"
                loading="lazy"
              />
              <div className="p-2 flex items-center justify-between gap-1">
                <span className="text-xs font-medium truncate">{item.titulo}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive shrink-0"
                  onClick={() => handleDeletePortfolio(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
