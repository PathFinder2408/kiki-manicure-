import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, Users, TrendingUp, LogOut, Plus, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/supabase";
import { toast } from "sonner";
import { ImageIcon, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLocalDateString, getFirstDayOfMonth } from "@/lib/dateUtils";

const Admin = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<any[]>([]);
  const [finanzas, setFinanzas] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "ingreso",
    descripcion: "",
    monto: "",
    fecha: getLocalDateString(),
  });


const [showPortafolioForm, setShowPortafolioForm] = useState(false);
const [portafolioData, setPortafolioData] = useState({
  titulo: "",
  categoria: "gel",
  descripcion: "",
});
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCitas();
    fetchFinanzas();
  }, []);

  const fetchCitas = async () => {
    const hoy = getLocalDateString();
    const { data } = await supabase
      .from("citas")
      .select("*")
      .eq("fecha", hoy)
      .order("hora");
    if (data) setCitas(data);
  };

  const fetchFinanzas = async () => {
    const { data } = await supabase
      .from("finanzas")
      .select("*")
      .gte("fecha", getFirstDayOfMonth());
    if (data) setFinanzas(data);
  };

  const handleRegistrarMovimiento = async () => {
    if (!formData.descripcion || !formData.monto) {
      toast.error("Completa todos los campos");
      return;
    }

    const { error } = await supabase.from("finanzas").insert({
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      monto: parseInt(formData.monto),
      fecha: formData.fecha,
    });

    if (error) {
      toast.error("Error al registrar");
      return;
    }

    toast.success(`${formData.tipo === "ingreso" ? "Ingreso" : "Egreso"} registrado exitosamente`);
    setFormData({ tipo: "ingreso", descripcion: "", monto: "", fecha: getLocalDateString() });
    setShowForm(false);
    fetchFinanzas();
  };

  const ingresos = finanzas.filter((f) => f.tipo === "ingreso").reduce((sum, f) => sum + f.monto, 0);
  const egresos = finanzas.filter((f) => f.tipo === "egreso").reduce((sum, f) => sum + f.monto, 0);

  const handleSubirFoto = async () => {
  if (!selectedFile || !portafolioData.titulo) {
    toast.error("Selecciona una foto y agrega un título");
    return;
  }

  setUploading(true);

  const fileExt = selectedFile.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("Portafolio")
    .upload(fileName, selectedFile);

  if (uploadError) {
    toast.error("Error al subir la imagen");
    setUploading(false);
    return;
  }

  const { data: urlData } = supabase.storage
    .from("Portafolio")
    .getPublicUrl(fileName);

  const { error: dbError } = await supabase.from("portafolio").insert({
    titulo: portafolioData.titulo,
    categoria: portafolioData.categoria,
    descripcion: portafolioData.descripcion,
    imagen_url: urlData.publicUrl,
  });

  if (dbError) {
    toast.error("Error al guardar en base de datos");
    setUploading(false);
    return;
  }

  toast.success("¡Foto subida al portafolio!");
  setPortafolioData({ titulo: "", categoria: "gel", descripcion: "" });
  setSelectedFile(null);
  setShowPortafolioForm(false);
  setUploading(false);
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  const stats = [
    { title: "Citas Hoy", value: citas.length.toString(), change: "Hoy", icon: Calendar },
    { title: "Ingresos del Mes", value: `$${ingresos.toLocaleString("es-CL")}`, change: "Este mes", icon: DollarSign },
    { title: "Egresos del Mes", value: `$${egresos.toLocaleString("es-CL")}`, change: "Este mes", icon: Users },
    { title: "Utilidad Neta", value: `$${(ingresos - egresos).toLocaleString("es-CL")}`, change: "Este mes", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Panel de Administración</h1>
              <p className="text-muted-foreground text-sm md:text-base">Gestiona tu negocio de manera eficiente</p>
            </div>
            <Button variant="destructive" size="lg" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <Card key={i} className="p-6 border-2 border-border bg-gradient-card">
                <div className="p-3 rounded-2xl bg-muted mb-4 w-fit">
                  <stat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </Card>
            ))}
          </div>

          {/* Citas de hoy */}
          <Card className="p-6 border-2 border-border bg-gradient-card mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6">Citas de Hoy</h2>
            {citas.length === 0 ? (
              <p className="text-muted-foreground">No hay citas para hoy.</p>
            ) : (
              <div className="space-y-4">
                {citas.map((cita) => (
                  <div key={cita.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-muted/50 border border-border gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 text-primary font-bold text-sm shrink-0">
                        {cita.hora.slice(0, 5)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{cita.cliente_nombre}</p>
                        <p className="text-sm text-muted-foreground truncate">{cita.servicio}</p>
                        <p className="text-xs text-muted-foreground">{cita.cliente_telefono}</p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium w-fit">
                      {cita.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Finanzas */}
          <Card className="p-6 border-2 border-border bg-gradient-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-serif font-bold">Resumen Financiero del Mes</h2>
              <Button onClick={() => setShowForm(!showForm)} variant="default" size="sm" className="w-full sm:w-auto">
                {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {showForm ? "Cancelar" : "Registrar Movimiento"}
              </Button>
            </div>

            {/* Formulario */}
            {showForm && (
              <Card className="p-6 mb-6 border-2 border-primary/30 bg-muted/30">
                <h3 className="font-semibold mb-4">Nuevo Movimiento</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="mb-2 block">Tipo</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={formData.tipo === "ingreso" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, tipo: "ingreso" })}
                        className="flex-1"
                      >
                        Ingreso
                      </Button>
                      <Button
                        variant={formData.tipo === "egreso" ? "destructive" : "outline"}
                        onClick={() => setFormData({ ...formData, tipo: "egreso" })}
                        className="flex-1"
                      >
                        Egreso
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Fecha</Label>
                    <Input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Descripción</Label>
                    <Input
                      placeholder="Ej: Gel UV Premium - Cliente"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Monto ($)</Label>
                    <Input
                      type="number"
                      placeholder="25000"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleRegistrarMovimiento} className="w-full" size="lg">
                  Guardar Movimiento
                </Button>
              </Card>
            )}

            {/* Totales */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">Ingresos</span>
                <span className="text-2xl font-bold text-primary">${ingresos.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">Egresos</span>
                <span className="text-2xl font-bold text-destructive">${egresos.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border-2 border-primary">
                <span className="font-semibold">Utilidad Neta</span>
                <span className="text-2xl font-bold text-primary">${(ingresos - egresos).toLocaleString("es-CL")}</span>
              </div>
            </div>
            {/* Portafolio */}
<Card className="p-6 border-2 border-border bg-gradient-card mt-8">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <h2 className="text-xl md:text-2xl font-serif font-bold">Subir al Portafolio</h2>
    <Button onClick={() => setShowPortafolioForm(!showPortafolioForm)} variant="default" size="sm" className="w-full sm:w-auto">
      {showPortafolioForm ? <X className="mr-2 h-4 w-4" /> : <ImageIcon className="mr-2 h-4 w-4" />}
      {showPortafolioForm ? "Cancelar" : "Subir Foto"}
    </Button>
  </div>

  {showPortafolioForm && (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Título</Label>
        <Input
          placeholder="Ej: Gel UV Rosa Pastel"
          value={portafolioData.titulo}
          onChange={(e) => setPortafolioData({ ...portafolioData, titulo: e.target.value })}
        />
      </div>
      <div>
        <Label className="mb-2 block">Categoría</Label>
        <div className="flex gap-2">
          {["gel", "acrylic", "spa"].map((cat) => (
            <Button
              key={cat}
              variant={portafolioData.categoria === cat ? "default" : "outline"}
              onClick={() => setPortafolioData({ ...portafolioData, categoria: cat })}
              size="sm"
            >
              {cat === "gel" ? "Uñas Gel" : cat === "acrylic" ? "Acrílico" : "Spa"}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Descripción (opcional)</Label>
        <Input
          placeholder="Ej: Diseño primaveral con flores"
          value={portafolioData.descripcion}
          onChange={(e) => setPortafolioData({ ...portafolioData, descripcion: e.target.value })}
        />
      </div>
      <div>
        <Label className="mb-2 block">Foto</Label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="w-full p-3 rounded-xl border-2 border-border bg-background text-sm"
        />
      </div>
      <Button onClick={handleSubirFoto} className="w-full" size="lg" disabled={uploading}>
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Subiendo..." : "Publicar en Portafolio"}
      </Button>
    </div>
  )}
</Card>

            {/* Últimos movimientos */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Últimos movimientos</h3>
              <div className="space-y-2">
                {finanzas.slice(-5).reverse().map((f) => (
                  <div key={f.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 text-sm">
                    <span className="text-muted-foreground">{f.descripcion}</span>
                    <span className={f.tipo === "ingreso" ? "text-primary font-semibold" : "text-destructive font-semibold"}>
                      {f.tipo === "ingreso" ? "+" : "-"}${f.monto.toLocaleString("es-CL")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Admin;