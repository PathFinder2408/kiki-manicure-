import { useState } from "react";
import confetti from 'canvas-confetti';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from '@/supabase';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { sendWhatsAppNotification } from "@/lib/sendWhatsApp";
import { getLocalDateString } from "@/lib/dateUtils";

const Booking = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const services = [
    { value: "gel-basic", label: "Gel UV Básico - $20.000", duration: "45 min" },
    { value: "gel-design", label: "Gel UV con Diseño - $25.000", duration: "60 min" },
    { value: "gel-premium", label: "Gel UV Premium - $35.000", duration: "75 min" },
    { value: "acrylic-basic", label: "Extensión Acrílica Básica - $30.000", duration: "90 min" },
    { value: "acrylic-design", label: "Acrílico con Diseño - $35.000", duration: "105 min" },
    { value: "spa-express", label: "Manicura Express - $12.000", duration: "30 min" },
    { value: "spa-classic", label: "Spa de Manos Clásico - $18.000", duration: "45 min" },
    { value: "spa-premium", label: "Spa de Manos Premium - $25.000", duration: "60 min" },
  ];

  const availableTimes = [
    "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fechaStr = selectedDate ? getLocalDateString(selectedDate) : '';
    const servicioLabel = services.find((s) => s.value === selectedService)?.label || selectedService;

    const { error } = await supabase.from('citas').insert({
      cliente_nombre: formData.name,
      cliente_email: formData.email,
      cliente_telefono: formData.phone,
      servicio: selectedService,
      fecha: fechaStr,
      hora: selectedTime,
    });

    if (error) {
      toast.error("Error al agendar. Intenta de nuevo.");
      return;
    }

    // 🎉 Celebración con confetti
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#c4a882', '#8b3a4a', '#d4b896', '#a0525e', '#e8d5c0'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Enviar notificación WhatsApp a Kiki (no bloquea la reserva)
    sendWhatsAppNotification({
      nombre: formData.name,
      servicio: servicioLabel,
      fecha: selectedDate?.toLocaleDateString('es-CL') || fechaStr,
      hora: selectedTime,
      telefono: formData.phone,
    });

    toast.success("¡Reserva confirmada! Te enviaremos un recordatorio por WhatsApp.", {
      description: `${formData.name}, tu cita está agendada para el ${selectedDate?.toLocaleDateString('es-CL')} a las ${selectedTime}`,
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Agenda tu Cita
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground px-2">
              Reserva tu espacio en solo 3 pasos
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step >= num
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {num}
                  </div>
                  {num < 3 && (
                    <div
                      className={`w-12 h-1 rounded ${
                        step > num ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8 shadow-hover border-2 border-border bg-gradient-card">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="space-y-6 animate-step-enter" key="step-1">
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-2">
                    Selecciona tu Servicio
                  </h2>
                  <p className="text-muted-foreground">
                    Elige el tratamiento que deseas realizar
                  </p>
                </div>

                <div className="space-y-3">
                  {services.map((service) => (
                    <button
                      key={service.value}
                      onClick={() => setSelectedService(service.value)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedService === service.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                        <span className="font-medium text-base sm:text-lg">{service.label.split(' - ')[0]}</span>
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          <span className="text-primary font-semibold">{service.label.split(' - ')[1]}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                            <Clock className="h-4 w-4" />
                            {service.duration}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!selectedService}
                  className="w-full"
                >
                  Continuar
                </Button>
              </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <div className="space-y-6 animate-step-enter" key="step-2">
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-2">
                    Selecciona Fecha y Hora
                  </h2>
                  <p className="text-muted-foreground">
                    Elige el día y horario que prefieras
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-2 block">Fecha</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-xl border-2 border-border p-3"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Hora Disponible</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            selectedTime === time
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 w-full sm:w-auto"
                  >
                    Volver
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep(3)}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 w-full sm:w-auto"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-step-enter" key="step-3">
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-2">
                    Tus Datos de Contacto
                  </h2>
                  <p className="text-muted-foreground">
                    Para confirmar y enviarte recordatorios
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      Nombre Completo
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="María González"
                      required
                      className="h-12 rounded-xl border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+56 9 1234 5678"
                      required
                      className="h-12 rounded-xl border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="maria@ejemplo.com"
                      required
                      className="h-12 rounded-xl border-2"
                    />
                  </div>
                </div>

                {/* Summary */}
                <Card className="p-4 bg-muted/50 border-2 border-primary/20">
                  <h3 className="font-semibold mb-3">Resumen de tu Reserva</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Servicio:</span>
                      <span className="font-medium">
                        {services.find((s) => s.value === selectedService)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-medium">
                        {selectedDate?.toLocaleDateString("es-CL")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hora:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 w-full sm:w-auto"
                  >
                    Volver
                  </Button>
                  <Button type="submit" size="lg" variant="hero" className="flex-1 w-full sm:w-auto">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Confirmar Reserva
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Booking;
