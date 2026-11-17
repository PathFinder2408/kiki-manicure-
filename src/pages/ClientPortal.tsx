import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, CalendarPlus, LogOut, Mail, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { InlineSalonLoader } from "@/components/SalonLoader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InstallAppButton } from "@/components/admin/InstallAppButton";
import { formatCurrency, formatDisplayDate } from "@/lib/formatters";
import { downloadAppointmentICS, getGoogleCalendarUrl } from "@/lib/icsGenerator";
import { useBusinessConfig } from "@/hooks/useSalonData";
import { supabase } from "@/supabase";

interface MyAppointment {
  id: number;
  servicio: string;
  fecha: string;
  hora: string;
  estado: string;
  precio_acordado: number;
  duracion_min: number;
}

const ClientPortal = () => {
  const { data: config } = useBusinessConfig();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [emailInput, setEmailInput] = useState("");
  const [sendingLink, setSendingLink] = useState(false);

  const [citas, setCitas] = useState<MyAppointment[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewService, setReviewService] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [sendingReview, setSendingReview] = useState(false);

  const loadMyAppointments = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_my_appointments");
    if (!error && data) {
      setCitas(data as MyAppointment[]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const url = new URL(window.location.href);
    const oauthError =
      url.searchParams.get("error_description") || url.searchParams.get("error");
    const hasAuthParams =
      url.searchParams.has("code") ||
      window.location.hash.includes("access_token=");

    if (oauthError) {
      toast.error(`Error al iniciar con Google: ${oauthError}`);
      window.history.replaceState({}, document.title, "/mi-agenda");
    }

    const applySession = (
      session: { user?: { email?: string; user_metadata?: Record<string, unknown> } } | null
    ) => {
      if (!mounted) return;
      const user = session?.user;
      setUserEmail(user?.email ?? null);
      setUserName(
        (user?.user_metadata?.full_name as string) ||
          user?.email?.split("@")[0] ||
          ""
      );
      if (user) {
        loadMyAppointments();
        if (hasAuthParams) {
          toast.success("¡Bienvenida! Sesión iniciada correctamente");
          window.history.replaceState({}, document.title, "/mi-agenda");
        }
      }
      setLoadingAuth(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        if (session || !hasAuthParams) {
          applySession(session);
        }
      } else if (event === "SIGNED_OUT") {
        applySession(null);
      }
    });

    // Respaldo por si INITIAL_SESSION no se dispara a tiempo
    const fallbackTimer = setTimeout(async () => {
      if (!mounted) return;
      const { data } = await supabase.auth.getSession();
      applySession(data.session);
    }, hasAuthParams ? 2200 : 400);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [loadMyAppointments]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/mi-agenda`,
      },
    });
    if (error) {
      toast.error("No se pudo iniciar con Google. Intenta con tu correo.");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSendingLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailInput.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/mi-agenda`,
        },
      });
      if (error) {
        toast.error("No pudimos enviar el enlace. Revisa tu correo.");
        return;
      }
      toast.success("¡Revisa tu correo! Te enviamos un enlace mágico para entrar en 1 clic.");
    } finally {
      setSendingLink(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSendingReview(true);
    try {
      const { error } = await supabase.from("resenas").insert({
        cliente_nombre: userName || "Clienta Verificada",
        cliente_email: userEmail ?? "",
        servicio: reviewService.trim() || "Atención en Kiki Spa",
        calificacion: rating,
        comentario: reviewComment.trim(),
        aprobada: true,
      });

      if (error) {
        toast.error("Error al enviar tu evaluación");
        return;
      }

      toast.success("¡Gracias por tu evaluación! Tu opinión nos ayuda a mejorar.");
      setReviewComment("");
      setReviewService("");
      setRating(5);
    } finally {
      setSendingReview(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setCitas([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-3xl space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Portal de Clientas
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Mi Agenda & Evaluaciones</h1>
            <p className="text-sm text-muted-foreground">
              Revisa tus citas agendadas, guárdalas en tu calendario y evalúa tu experiencia.
            </p>
            <div className="pt-2 flex justify-center">
              <InstallAppButton compact label="Descargar App Clienta" />
            </div>
          </div>

          {loadingAuth ? (
            <div className="max-w-md mx-auto">
              <InlineSalonLoader context="client" />
            </div>
          ) : !userEmail ? (
            <Card className="p-6 sm:p-8 rounded-2xl border-border/60 max-w-md mx-auto space-y-5 text-center">
              <div>
                <h2 className="font-serif text-xl font-semibold mb-1">Ingresa con tu cuenta</h2>
                <p className="text-xs text-muted-foreground">
                  Usa el mismo correo con el que agendas tus citas.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoogleLogin}
                className="w-full rounded-xl gap-2 font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
                Continuar con Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">o con enlace a tu correo</span>
                </div>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-3 text-left">
                <div>
                  <Label className="text-xs">Tu correo electrónico</Label>
                  <Input
                    type="email"
                    placeholder="tu@correo.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
                <Button type="submit" disabled={sendingLink} className="w-full rounded-xl gap-2">
                  <Mail className="w-4 h-4" />
                  {sendingLink ? "Enviando enlace..." : "Enviar enlace de acceso"}
                </Button>
              </form>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-5 rounded-2xl border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Bienvenida</p>
                  <p className="font-serif font-semibold text-lg">{userName || userEmail}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/agendar">
                    <Button size="sm" className="rounded-xl gap-1.5">
                      <Calendar className="w-4 h-4" /> Nueva Cita
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="rounded-xl gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Salir
                  </Button>
                </div>
              </Card>

              {/* Mis Citas */}
              <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
                <h2 className="font-serif text-xl font-semibold mb-4">Mis Citas</h2>
                {citas.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
                    Aún no tienes citas asociadas a {userEmail}.
                  </div>
                ) : (
                  <div className="divide-y">
                    {citas.map((c) => (
                      <div
                        key={c.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-primary tabular-nums">
                              {formatDisplayDate(c.fecha)} · {c.hora.slice(0, 5)} hrs
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted capitalize">
                              {c.estado}
                            </span>
                          </div>
                          <p className="text-sm font-medium mt-0.5">{c.servicio}</p>
                          {c.precio_acordado > 0 && (
                            <p className="text-xs text-muted-foreground tabular-nums">
                              {formatCurrency(c.precio_acordado, config?.moneda)}
                            </p>
                          )}
                        </div>

                        {c.estado !== "cancelada" && (
                          <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1">
                              <a
                                href={getGoogleCalendarUrl({
                                  title: `${c.servicio} - ${config?.nombre_salon ?? "Kiki Spa"}`,
                                  description: "Cita agendada en Kiki Spa.",
                                  location: config?.direccion || "Kiki Spa",
                                  dateStr: c.fecha,
                                  timeStr: c.hora.slice(0, 5),
                                  durationMin: c.duracion_min || 60,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" /> Google
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs gap-1"
                              onClick={() =>
                                downloadAppointmentICS({
                                  title: `${c.servicio} - ${config?.nombre_salon ?? "Kiki Spa"}`,
                                  description: "Cita agendada en Kiki Spa.",
                                  location: config?.direccion || "Kiki Spa",
                                  dateStr: c.fecha,
                                  timeStr: c.hora.slice(0, 5),
                                  durationMin: c.duracion_min || 60,
                                })
                              }
                            >
                              <CalendarPlus className="w-3.5 h-3.5" /> .ics
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Evaluar Servicio */}
              <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
                <h2 className="font-serif text-xl font-semibold mb-1">Evalúa tu Experiencia</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Cuéntanos cómo te sentiste con tu atención en {config?.nombre_salon ?? "Kiki Spa"}.
                </p>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <Label className="text-xs block mb-2">Calificación</Label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                          aria-label={`${star} estrellas`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Servicio recibido (opcional)</Label>
                    <Input
                      value={reviewService}
                      onChange={(e) => setReviewService(e.target.value)}
                      placeholder="Ej. Gel UV con Diseño / Spa de Manos"
                      className="mt-1 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Tu comentario</Label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Me encantó el acabado y la atención..."
                      rows={3}
                      className="mt-1 rounded-xl"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={sendingReview} className="rounded-xl">
                    {sendingReview ? "Enviando..." : "Enviar Evaluación"}
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;
