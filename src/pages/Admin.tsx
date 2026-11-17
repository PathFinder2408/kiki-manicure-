import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  DollarSign,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AdminAgendaTab } from "@/components/admin/AdminAgendaTab";
import { AdminBlogTab } from "@/components/admin/AdminBlogTab";
import { AdminCatalogTab } from "@/components/admin/AdminCatalogTab";
import { AdminClientsTab } from "@/components/admin/AdminClientsTab";
import { AdminFinanceTab } from "@/components/admin/AdminFinanceTab";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { CobrarCitaModal } from "@/components/admin/CobrarCitaModal";
import { InstallAppButton } from "@/components/admin/InstallAppButton";
import { useBlogPosts, useBusinessConfig, useServices } from "@/hooks/useSalonData";
import { getCurrentMonthKey, getLocalDateString, getMonthBounds } from "@/lib/dateUtils";
import { getFarewellMessage, getMindfulMessage, getTimeGreeting, resolveDisplayName } from "@/lib/greetings";
import { supabase } from "@/supabase";
import type {
  Cita,
  CitaEstado,
  Clienta,
  Finanza,
  MetodoPago,
  PortafolioItem,
  TipoMovimiento,
} from "@/types/salon";

type AdminTab = "overview" | "agenda" | "finances" | "clients" | "catalog" | "blog" | "settings";

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "finances", label: "Finanzas", icon: DollarSign },
  { id: "clients", label: "Clientas", icon: Users },
  { id: "catalog", label: "Catálogo", icon: Sparkles },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "settings", label: "Negocio", icon: Settings },
];

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [adminName, setAdminName] = useState<string>("");
  const [mindfulQuote] = useState<string>(() => getMindfulMessage());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [clientas, setClientas] = useState<Clienta[]>([]);
  const [finanzasMes, setFinanzasMes] = useState<Finanza[]>([]);
  const [portafolio, setPortafolio] = useState<PortafolioItem[]>([]);
  const [citaToCharge, setCitaToCharge] = useState<Cita | null>(null);

  const { data: servicios = [] } = useServices(false);
  const { data: blogPosts = [] } = useBlogPosts(false);
  const { data: config } = useBusinessConfig();
  const moneda = config?.moneda ?? "CLP";

  const fetchCitas = useCallback(async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .order("fecha", { ascending: false })
      .order("hora", { ascending: true })
      .limit(200);
    if (!error && data) setCitas(data as Cita[]);
  }, []);

  const fetchFinanzas = useCallback(async () => {
    const { start, end } = getMonthBounds(selectedMonth);
    const { data, error } = await supabase
      .from("finanzas")
      .select("*")
      .gte("fecha", start)
      .lte("fecha", end)
      .order("fecha", { ascending: false });
    if (!error && data) setFinanzasMes(data as Finanza[]);
  }, [selectedMonth]);

  const fetchPortafolio = useCallback(async () => {
    const { data, error } = await supabase
      .from("portafolio")
      .select("*")
      .order("id", { ascending: false });
    if (!error && data) setPortafolio(data as PortafolioItem[]);
  }, []);

  const fetchClientas = useCallback(async () => {
    const { data, error } = await supabase
      .from("clientas")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setClientas(data as Clienta[]);
  }, []);

  useEffect(() => {
    // Cambia el manifest PWA al de Dueña mientras esté en /admin
    const manifestLink = document.querySelector('link[rel="manifest"]');
    const previousHref = manifestLink?.getAttribute("href");
    manifestLink?.setAttribute("href", "/admin-manifest.webmanifest");

    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setAdminName(
          resolveDisplayName(u.email, u.user_metadata?.full_name as string | undefined)
        );
      }
    });

    fetchCitas();
    fetchFinanzas();
    fetchPortafolio();
    fetchClientas();

    return () => {
      if (manifestLink && previousHref) {
        manifestLink.setAttribute("href", previousHref);
      }
    };
  }, [fetchCitas, fetchFinanzas, fetchPortafolio, fetchClientas]);

  const citasHoy = useMemo(() => {
    const hoy = getLocalDateString();
    return citas
      .filter((c) => c.fecha === hoy)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [citas]);

  const handleUpdateEstado = async (citaId: number, estado: CitaEstado) => {
    const { error } = await supabase
      .from("citas")
      .update({ estado })
      .eq("id", citaId);

    if (error) {
      toast.error("No se pudo actualizar el estado");
      return;
    }

    toast.success(`Cita marcada como ${estado}`);
    fetchCitas();
  };

  const handleCobrarConfirm = async (
    cita: Cita,
    monto: number,
    metodoPago: MetodoPago
  ) => {
    const { error: finError } = await supabase.from("finanzas").insert({
      tipo: "ingreso",
      descripcion: `Cita: ${cita.cliente_nombre} (${cita.servicio})`,
      monto,
      fecha: getLocalDateString(),
      categoria: "servicios",
      metodo_pago: metodoPago,
      cita_id: cita.id,
    });

    if (finError) {
      toast.error("Error al registrar el ingreso en caja");
      return;
    }

    const { error: citaError } = await supabase
      .from("citas")
      .update({ estado: "completada", precio_acordado: monto })
      .eq("id", cita.id);

    if (citaError) {
      toast.error("Ingreso guardado, pero falló al cerrar la cita");
    } else {
      toast.success("¡Cita cerrada y cobro registrado en Finanzas!");
    }

    fetchCitas();
    fetchFinanzas();
  };

  const handleAddMovimiento = async (payload: {
    tipo: TipoMovimiento;
    descripcion: string;
    monto: number;
    fecha: string;
    categoria: string;
    metodo_pago: MetodoPago;
  }): Promise<boolean> => {
    const { error } = await supabase.from("finanzas").insert(payload);
    if (error) {
      toast.error("Error al registrar movimiento");
      return false;
    }
    toast.success("Movimiento registrado");
    fetchFinanzas();
    return true;
  };

  const handleDeleteMovimiento = async (id: number) => {
    const { error } = await supabase.from("finanzas").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar movimiento");
      return;
    }
    toast.success("Movimiento eliminado");
    fetchFinanzas();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(getFarewellMessage(), { duration: 4500 });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card px-4 py-6 justify-between">
        <div>
          <div className="px-2 mb-8">
            <p className="font-serif font-bold text-xl text-foreground">
              {config?.nombre_salon ?? "Kiki Manicure"}
            </p>
            <p className="text-xs text-muted-foreground">Panel de Gestión & Finanzas</p>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <InstallAppButton alwaysShow appTitle="Kiki Admin" label="Descargar App Admin" />
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 rounded-xl"
            onClick={() => navigate("/")}
          >
            <ExternalLink className="w-4 h-4" /> Ver Web Pública
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-xl text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar Móvil y Header */}
        <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-lg sm:text-xl truncate">
              {adminName
                ? `${getTimeGreeting()}, ${adminName}`
                : NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {mindfulQuote}
            </p>
          </div>

          <div className="flex items-center gap-2 lg:hidden shrink-0">
            <InstallAppButton compact alwaysShow appTitle="Kiki Admin" label="App Admin" />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="rounded-xl">
              Web
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </header>

        {/* Navegación móvil horizontal */}
        <div className="lg:hidden border-b bg-card px-4 py-2 flex gap-2 overflow-x-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <AdminOverviewTab
              citasHoy={citasHoy}
              finanzasMes={finanzasMes}
              moneda={moneda}
              onCobrarCita={setCitaToCharge}
              onGoToAgenda={() => setActiveTab("agenda")}
            />
          )}

          {activeTab === "agenda" && (
            <AdminAgendaTab
              citas={citas}
              moneda={moneda}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onUpdateEstado={handleUpdateEstado}
              onCobrarCita={setCitaToCharge}
            />
          )}

          {activeTab === "finances" && (
            <AdminFinanceTab
              finanzas={finanzasMes}
              moneda={moneda}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onAddMovimiento={handleAddMovimiento}
              onDeleteMovimiento={handleDeleteMovimiento}
            />
          )}

          {activeTab === "clients" && (
            <AdminClientsTab
              clientas={clientas}
              citas={citas}
              moneda={moneda}
              onRefreshClientas={fetchClientas}
            />
          )}

          {activeTab === "catalog" && (
            <AdminCatalogTab
              servicios={servicios}
              portafolio={portafolio}
              moneda={moneda}
              onRefreshServicios={() =>
                queryClient.invalidateQueries({ queryKey: ["servicios"] })
              }
              onRefreshPortafolio={fetchPortafolio}
            />
          )}

          {activeTab === "blog" && (
            <AdminBlogTab
              posts={blogPosts}
              onRefresh={() => queryClient.invalidateQueries({ queryKey: ["blog_posts"] })}
            />
          )}

          {activeTab === "settings" && config && (
            <AdminSettingsTab
              config={config}
              onSaved={() =>
                queryClient.invalidateQueries({ queryKey: ["negocio_config"] })
              }
            />
          )}
        </main>
      </div>

      <CobrarCitaModal
        cita={citaToCharge}
        onClose={() => setCitaToCharge(null)}
        onConfirm={handleCobrarConfirm}
      />
    </div>
  );
};

export default Admin;
