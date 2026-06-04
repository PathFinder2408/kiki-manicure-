import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import TiltCard from "@/components/TiltCard";
import ReviewCarousel from "@/components/ReviewCarousel";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useMotionEffects";
import heroImage from "@/assets/hero-nails.jpg";
import gelNails from "@/assets/gel-nails.jpg";
import acrylicNails from "@/assets/acrylic-nails.jpg";
import handSpa from "@/assets/hand-spa.jpg";

const Home = () => {
  const parallaxRef = useParallax(0.35);
  const servicesHeaderRef = useScrollAnimation('animate-fade-in-up');
  const servicesGridRef = useStaggerAnimation('animate-fade-in-up', 200);
  const reviewsRef = useScrollAnimation('animate-fade-in-up');
  const ctaRef = useScrollAnimation('animate-scale-in');

  const services = [
    {
      title: "Uñas Gel",
      description: "Diseños duraderos y brillantes que realzan tu estilo",
      price: "Desde $25.000",
      image: gelNails,
      duration: "60 min",
    },
    {
      title: "Uñas Acrílicas",
      description: "Extensiones perfectas con acabados profesionales",
      price: "Desde $35.000",
      image: acrylicNails,
      duration: "90 min",
    },
    {
      title: "Spa de Manos",
      description: "Tratamiento relajante para manos suaves y cuidadas",
      price: "Desde $20.000",
      image: handSpa,
      duration: "45 min",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section with Parallax + Gradient Blobs */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Parallax background */}
        <div 
          ref={parallaxRef}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            top: '-10%',
            bottom: '-10%',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        {/* Floating gradient blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-hero-entry">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Manicura Profesional</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-tight">
              Belleza en Cada
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-text pb-2">
                Detalle
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Experimenta el arte de la manicura con diseños únicos y cuidado personalizado
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/agendar">
                <Button size="lg" variant="hero" className="min-w-[200px]">
                  <Calendar className="mr-2 h-5 w-5" />
                  Reservar Cita
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  Ver Portafolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section — with Tilt 3D Cards */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-12" ref={servicesHeaderRef}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra variedad de tratamientos especializados para realzar tu belleza
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" ref={servicesGridRef}>
            {services.map((service, index) => (
              <TiltCard 
                key={index}
                className="group overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 shadow-soft hover:shadow-hover bg-gradient-card"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-soft">
                    {service.duration}
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-serif font-bold">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-2xl font-bold text-primary">{service.price}</span>
                    <Link to="/agendar">
                      <Button variant="default">
                        Reservar
                      </Button>
                    </Link>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/servicios">
              <Button size="lg" variant="outline">
                Ver Todos los Servicios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section — Animated Carousel */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl" ref={reviewsRef}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              Lo Que Dicen Nuestras Clientas
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              La satisfacción de nuestras clientas es nuestro mejor logro
            </p>
          </div>

          <ReviewCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center" ref={ctaRef}>
          <TiltCard className="p-8 md:p-12 bg-gradient-hero border-2 border-accent/20 shadow-hover">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
              ¿Lista para tu Transformación?
            </h2>
            <p className="text-lg sm:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Agenda tu cita hoy y descubre la diferencia de un servicio profesional y personalizado
            </p>
            <Link to="/agendar">
              <Button size="lg" variant="default" className="bg-card text-foreground hover:bg-card/90 min-w-[250px]">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Ahora
              </Button>
            </Link>
          </TiltCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-4">
            <span className="brand-elegant text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-text">
              <span className="brand-kiki">Kiki</span>
              <span className="brand-separator" />
              <span className="brand-manicure">Manicure</span>
            </span>
          </div>
          <p className="text-muted-foreground mb-6">
            Belleza y elegancia en cada detalle
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/portfolio" className="hover:text-primary transition-colors">Portafolio</Link>
            <Link to="/servicios" className="hover:text-primary transition-colors">Servicios</Link>
            <Link to="/agendar" className="hover:text-primary transition-colors">Agendar</Link>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            © 2025 Kiki Manicure. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
