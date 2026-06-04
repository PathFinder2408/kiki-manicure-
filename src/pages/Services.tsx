import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/useScrollAnimation";

const Services = () => {
  const headerRef = useScrollAnimation('animate-fade-in-up');
  const infoCardsRef = useStaggerAnimation('animate-fade-in-up', 200);

  const services = [
    {
      category: "Uñas Gel",
      items: [
        {
          name: "Gel UV Básico",
          description: "Aplicación de gel UV en uñas naturales con color sólido",
          duration: "45 min",
          price: "$20.000",
        },
        {
          name: "Gel UV con Diseño",
          description: "Gel UV con nail art personalizado y detalles artísticos",
          duration: "60 min",
          price: "$25.000",
        },
        {
          name: "Gel UV Premium",
          description: "Gel UV con diseños complejos, piedras y acabados especiales",
          duration: "75 min",
          price: "$35.000",
        },
      ],
    },
    {
      category: "Uñas Acrílicas",
      items: [
        {
          name: "Extensión Acrílica Básica",
          description: "Extensión de uñas con acrílico y color sólido",
          duration: "90 min",
          price: "$30.000",
        },
        {
          name: "Acrílico con Diseño",
          description: "Extensión acrílica con nail art y decoraciones",
          duration: "105 min",
          price: "$35.000",
        },
        {
          name: "Acrílico Esculpido Premium",
          description: "Escultura completa con diseños elaborados y acabados de lujo",
          duration: "120 min",
          price: "$45.000",
        },
      ],
    },
    {
      category: "Spa de Manos",
      items: [
        {
          name: "Manicura Express",
          description: "Limpieza, limado, cutículas y esmaltado básico",
          duration: "30 min",
          price: "$12.000",
        },
        {
          name: "Spa de Manos Clásico",
          description: "Exfoliación, mascarilla hidratante y manicura completa",
          duration: "45 min",
          price: "$18.000",
        },
        {
          name: "Spa de Manos Premium",
          description: "Tratamiento completo con parafina, masaje y hidratación profunda",
          duration: "60 min",
          price: "$25.000",
        },
      ],
    },
    {
      category: "Servicios Adicionales",
      items: [
        {
          name: "Retiro de Gel/Acrílico",
          description: "Retiro profesional sin daño a la uña natural",
          duration: "30 min",
          price: "$8.000",
        },
        {
          name: "Reparación de Uña",
          description: "Reparación de una uña quebrada o desprendida",
          duration: "15 min",
          price: "$5.000",
        },
        {
          name: "Cambio de Color",
          description: "Cambio de esmalte manteniendo extensión o gel",
          duration: "30 min",
          price: "$10.000",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12" ref={headerRef}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Servicios Profesionales</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Nuestros Servicios
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Ofrecemos una amplia gama de tratamientos especializados para el cuidado y embellecimiento de tus manos
            </p>
          </div>

          {/* Services by Category */}
          <div className="space-y-12">
            {services.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-3xl font-serif font-bold mb-6 text-primary">
                  {category.category}
                </h2>
                <div className="grid gap-6">
                  {category.items.map((service, serviceIndex) => (
                    <Card
                      key={serviceIndex}
                      className="p-6 shadow-soft hover:shadow-hover transition-all duration-300 border-2 border-border hover:border-primary bg-gradient-card"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">
                            {service.name}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{service.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-4 md:flex-col md:items-end w-full md:w-auto mt-2 md:mt-0">
                          <span className="text-2xl font-bold text-primary">
                            {service.price}
                          </span>
                          <Link to="/agendar" className="w-full sm:w-auto">
                            <Button variant="default" className="w-full sm:w-auto">
                              <Calendar className="mr-2 h-4 w-4" />
                              Reservar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-16" ref={infoCardsRef}>
            <Card className="p-8 bg-muted/50 border-2 border-border">
              <h3 className="text-2xl font-serif font-bold mb-4">
                Política de Cancelación
              </h3>
              <p className="text-muted-foreground">
                Por favor, avisa con al menos 24 horas de anticipación si necesitas cancelar o reprogramar tu cita. Las cancelaciones tardías pueden estar sujetas a un cargo del 50%.
              </p>
            </Card>
            <Card className="p-8 bg-gradient-hero border-2 border-accent/20">
              <h3 className="text-2xl font-serif font-bold mb-4">
                Garantía de Calidad
              </h3>
              <p className="text-foreground/80">
                Todos nuestros servicios incluyen garantía de satisfacción. Si tienes algún problema dentro de las primeras 48 horas, te lo corregiremos sin costo adicional.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Services;
