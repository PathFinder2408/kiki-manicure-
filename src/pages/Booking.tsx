import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAvailableSlots } from "@/lib/availability";
import { getLocalDateString } from "@/lib/dateUtils";
import { formatCurrency, formatDisplayDate } from "@/lib/formatters";
import { downloadAppointmentICS, getGoogleCalendarUrl } from "@/lib/icsGenerator";
import { sendWhatsAppNotification } from "@/lib/sendWhatsApp";
import { useBookedSlots, useBusinessConfig, useServices } from "@/hooks/useSalonData";
import { supabase } from "@/supabase";

const bookingFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre completo")
    .max(80, "Nombre demasiado largo"),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresa un número de WhatsApp válido (mín. 8 dígitos)")
    .max(20, "Número demasiado largo"),
  email: z
    .string()
    .trim()
    .email("Ingresa un correo válido"),
  notes: z.string().trim().max(300, "Máximo 300 caracteres").optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  all: "Todos",
  gel: "Uñas Gel",
  acrilico: "Acrílicas",
  spa: "Spa de Manos",
};

const Booking = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const { data: services = [], isLoading: loadingServices } = useServices(true);
  const { data: config } = useBusinessConfig();

  const selectedDateStr = selectedDate ? getLocalDateString(selectedDate) : "";
  const { data: bookedSlots = [], isLoading: loadingSlots } = useBookedSlots(selectedDateStr);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset: resetForm,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { name: "", phone: "", email: "", notes: "" },
  });

  // Autocompletar nombre y correo si la clienta inició sesión con Google / Email
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        const fullName = (user.user_metadata?.full_name as string) || "";
        if (fullName && !getValues("name")) setValue("name", fullName);
        if (user.email && !getValues("email")) setValue("email", user.email);
      }
    });
  }, [getValues, setValue]);

  // Pre-selección si llega desde /servicios?servicio=...
  useEffect(() => {
    const paramSlug = searchParams.get("servicio");
    if (paramSlug && services.some((s) => s.slug === paramSlug)) {
      setSelectedSlug(paramSlug);
      setStep(2);
    }
  }, [searchParams, services]);

  const selectedServiceObj = useMemo(
    () => services.find((s) => s.slug === selectedSlug),
    [services, selectedSlug]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(services.map((s) => s.categoria)));
    return ["all", ...unique];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter((s) => s.categoria === selectedCategory);
  }, [services, selectedCategory]);

  const timeSlots = useMemo(() => {
    if (!selectedDateStr || !selectedServiceObj || !selectedDate) return [];
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const dayKey = String(selectedDate.getDay());
    const dayCfg = config?.horarios_semana?.[dayKey];
    const openTime = dayCfg?.apertura ?? config?.horario_apertura ?? "09:00";
    const closeTime = dayCfg?.cierre ?? config?.horario_cierre ?? "19:00";
    const secondShift =
      dayCfg?.bloque2_activo && dayCfg.apertura2 && dayCfg.cierre2
        ? { openTime: dayCfg.apertura2, closeTime: dayCfg.cierre2 }
        : null;

    return getAvailableSlots({
      dateStr: selectedDateStr,
      todayStr: getLocalDateString(now),
      nowMinutes,
      serviceDurationMin: selectedServiceObj.duracion_min,
      openTime,
      closeTime,
      intervalMin: config?.intervalo_min ?? 60,
      bookedSlots,
      secondShift,
    });
  }, [selectedDateStr, selectedDate, selectedServiceObj, config, bookedSlots]);

  const triggerCelebration = () => {
    const end = Date.now() + 1800;
    const colors = ["#6E2C3B", "#C8A27A", "#e8d5c0", "#a0525e"];
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const onSubmit = async (values: BookingFormValues) => {
    if (!selectedServiceObj || !selectedDateStr || !selectedTime) {
      toast.error("Faltan datos de tu reserva");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("citas").insert({
        cliente_nombre: values.name,
        cliente_email: values.email,
        cliente_telefono: values.phone,
        servicio: selectedServiceObj.slug,
        fecha: selectedDateStr,
        hora: selectedTime,
        estado: "pendiente",
        precio_acordado: selectedServiceObj.precio,
        duracion_min: selectedServiceObj.duracion_min,
        notas: values.notes || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Ese horario acaba de ser reservado por otra clienta. Por favor elige otro.");
          setSelectedTime("");
          setStep(2);
          queryClient.invalidateQueries({ queryKey: ["booked_slots", selectedDateStr] });
          return;
        }
        toast.error("No pudimos completar tu reserva. Intenta nuevamente.");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["booked_slots", selectedDateStr] });
      triggerCelebration();

      // Notificación segura vía Serverless Function (no bloquea la UX)
      sendWhatsAppNotification({
        nombre: values.name,
        servicio: `${selectedServiceObj.nombre} (${formatCurrency(selectedServiceObj.precio, config?.moneda)})`,
        fecha: formatDisplayDate(selectedDateStr),
        hora: selectedTime,
        telefono: values.phone,
        email: values.email,
      });

      setStep(4);
      toast.success("¡Reserva confirmada!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAll = () => {
    setSelectedSlug("");
    setSelectedDate(undefined);
    setSelectedTime("");
    resetForm();
    setStep(1);
  };

  const stepLabels = ["Servicio", "Fecha y Hora", "Tus Datos", "Confirmación"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Reserva Online Instantánea
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-2">
              Agenda tu Cita
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Disponibilidad en tiempo real · Confirmación inmediata
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
              {stepLabels.map((label, idx) => {
                const stepNum = idx + 1;
                const active = step === stepNum;
                const done = step > stepNum;
                return (
                  <div key={label} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : done
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? "✓" : stepNum}
                    </div>
                    <span
                      className={`mt-1.5 text-[11px] sm:text-xs font-medium ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: SERVICIO */}
          {step === 1 && (
            <Card className="p-5 sm:p-8 rounded-2xl border-border/60 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold">
                    1. Elige tu servicio
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Los horarios se ajustan automáticamente a la duración elegida.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {CATEGORY_LABELS[cat] ?? cat}
                    </button>
                  ))}
                </div>
              </div>

              {loadingServices ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Cargando servicios...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredServices.map((srv) => {
                    const isSelected = selectedSlug === srv.slug;
                    return (
                      <button
                        key={srv.slug}
                        type="button"
                        onClick={() => {
                          setSelectedSlug(srv.slug);
                          setSelectedTime("");
                        }}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm sm:text-base">{srv.nombre}</h3>
                          <span className="font-bold text-primary tabular-nums text-sm sm:text-base shrink-0">
                            {formatCurrency(srv.precio, config?.moneda)}
                          </span>
                        </div>
                        {srv.descripcion && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {srv.descripcion}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="tabular-nums">{srv.duracion_min} min</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  disabled={!selectedServiceObj}
                  onClick={() => setStep(2)}
                  className="rounded-xl w-full sm:w-auto"
                >
                  Continuar a Fecha y Hora
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: FECHA Y HORA */}
          {step === 2 && (
            <Card className="p-5 sm:p-8 rounded-2xl border-border/60 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold">
                    2. Elige fecha y horario
                  </h2>
                  {selectedServiceObj && (
                    <p className="text-sm text-muted-foreground">
                      Servicio:{" "}
                      <span className="font-medium text-foreground">
                        {selectedServiceObj.nombre}
                      </span>{" "}
                      ({selectedServiceObj.duracion_min} min ·{" "}
                      <span className="tabular-nums">
                        {formatCurrency(selectedServiceObj.precio, config?.moneda)}
                      </span>
                      )
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Cambiar servicio
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="flex justify-center border rounded-xl p-3 bg-card">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime("");
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date < today) return true;
                      const dayKey = String(date.getDay());
                      const dayCfg = config?.horarios_semana?.[dayKey];
                      if (dayCfg) return !dayCfg.activo;
                      const closedDays = config?.dias_cerrados ?? [0];
                      return closedDays.includes(date.getDay());
                    }}
                    className="rounded-md"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    Horarios disponibles
                    {selectedDateStr && (
                      <span className="text-muted-foreground font-normal">
                        ({formatDisplayDate(selectedDateStr)})
                      </span>
                    )}
                  </Label>

                  {!selectedDate ? (
                    <div className="border border-dashed rounded-xl p-8 text-center text-sm text-muted-foreground">
                      <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Selecciona un día en el calendario para ver las horas libres.
                    </div>
                  ) : loadingSlots ? (
                    <div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Consultando disponibilidad...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {timeSlots.map(({ time, available }) => (
                        <button
                          key={time}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium tabular-nums border transition-all ${
                            !available
                              ? "bg-muted/50 text-muted-foreground/40 border-border/40 line-through cursor-not-allowed"
                              : selectedTime === time
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-card hover:border-primary/50 border-border"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                  Volver
                </Button>
                <Button
                  size="lg"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                  className="rounded-xl"
                >
                  Continuar a tus datos
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: DATOS CLIENTE */}
          {step === 3 && (
            <Card className="p-5 sm:p-8 rounded-2xl border-border/60 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-serif font-semibold mb-6">
                3. Completa tus datos
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5 text-primary" /> Nombre completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ej. Sofía Martínez"
                      {...register("name")}
                      className="rounded-xl"
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-1.5 mb-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" /> WhatsApp de contacto
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      {...register("phone")}
                      className="rounded-xl"
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-1.5 mb-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" /> Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="sofia@ejemplo.com"
                      {...register("email")}
                      className="rounded-xl"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes" className="mb-1.5 block">
                      Notas o preferencias (opcional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Ej. Prefiero tonos nude, alergia a algún producto..."
                      rows={3}
                      {...register("notes")}
                      className="rounded-xl"
                    />
                    {errors.notes && (
                      <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>
                    )}
                  </div>
                </div>

                {/* Resumen lateral */}
                <div className="bg-muted/40 border rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-semibold text-base mb-4">Resumen de Reserva</h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">Servicio</dt>
                        <dd className="font-medium">{selectedServiceObj?.nombre}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Fecha y hora</dt>
                        <dd className="font-medium tabular-nums">
                          {formatDisplayDate(selectedDateStr)} · {selectedTime} hrs
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Duración estimada</dt>
                        <dd className="font-medium tabular-nums">
                          {selectedServiceObj?.duracion_min} minutos
                        </dd>
                      </div>
                      <div className="pt-3 border-t flex items-center justify-between">
                        <dt className="font-semibold">Total estimado</dt>
                        <dd className="text-lg font-bold text-primary tabular-nums">
                          {formatCurrency(selectedServiceObj?.precio ?? 0, config?.moneda)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="w-full rounded-xl"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirmando...
                        </>
                      ) : (
                        "Confirmar Reserva"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full rounded-xl"
                      onClick={() => setStep(2)}
                    >
                      Cambiar horario
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {/* STEP 4: CONFIRMACIÓN */}
          {step === 4 && selectedServiceObj && (
            <Card className="p-6 sm:p-10 rounded-2xl border-border/60 shadow-sm text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
                ¡Cita Agendada con Éxito!
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Gracias <span className="font-medium text-foreground">{getValues("name")}</span>. Tu
                espacio ha quedado reservado en {config?.nombre_salon ?? "Kiki Manicure"}.
              </p>

              <div className="bg-muted/40 rounded-xl p-4 text-left space-y-2 text-sm mb-6 border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-medium">{selectedServiceObj.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium tabular-nums">
                    {formatDisplayDate(selectedDateStr)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-medium tabular-nums">{selectedTime} hrs</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-primary tabular-nums">
                    {formatCurrency(selectedServiceObj.precio, config?.moneda)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl gap-2"
                >
                  <a
                    href={getGoogleCalendarUrl({
                      title: `${selectedServiceObj.nombre} - ${config?.nombre_salon ?? "Kiki Manicure"}`,
                      description: `Cita de ${selectedServiceObj.nombre} (${selectedServiceObj.duracion_min} min).`,
                      location: config?.direccion || "Kiki Manicure",
                      dateStr: selectedDateStr,
                      timeStr: selectedTime,
                      durationMin: selectedServiceObj.duracion_min,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CalendarPlus className="w-4 h-4" /> Google Calendar
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2"
                  onClick={() =>
                    downloadAppointmentICS({
                      title: `${selectedServiceObj.nombre} - ${config?.nombre_salon ?? "Kiki Manicure"}`,
                      description: `Cita de ${selectedServiceObj.nombre} (${selectedServiceObj.duracion_min} min).`,
                      location: config?.direccion || "Kiki Manicure",
                      dateStr: selectedDateStr,
                      timeStr: selectedTime,
                      durationMin: selectedServiceObj.duracion_min,
                    })
                  }
                >
                  <CalendarPlus className="w-4 h-4" /> iPhone / Calendario (.ics)
                </Button>
                <Button className="rounded-xl" onClick={handleResetAll}>
                  Agendar otra cita
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Booking;
