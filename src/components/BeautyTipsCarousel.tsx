import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Droplets, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BeautyTip {
  tag: string;
  title: string;
  summary: string;
  fact: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BEAUTY_TIPS: BeautyTip[] = [
  {
    tag: "Tendencia · Clean Girl",
    title: "Efecto Glazed & Milky Nails",
    summary:
      "Los tonos lechosos translúcidos con acabado perlado sutil dominan la temporada por su elegancia atemporal y bajo mantenimiento.",
    fact: "Combina con cualquier look y disimula el crecimiento natural hasta 3 semanas.",
    icon: Sparkles,
  },
  {
    tag: "Cosmetología · Hidratación",
    title: "Aceite de Cutículas Diario",
    summary:
      "Aplicar aceite de jojoba o vitamina E en la matriz ungueal antes de dormir mejora la flexibilidad de la uña y evita quiebres.",
    fact: "Una matriz hidratada prolonga la adherencia del esmaltado en gel hasta un 30%.",
    icon: Droplets,
  },
  {
    tag: "Salud Ungueal · Técnica",
    title: "Cero Arrancado de Gel",
    summary:
      "Retirar el esmaltado permanente tirando de él arranca capas superficiales de queratina, debilitando la lámina por meses.",
    fact: "El retiro profesional con torno suave o removedor protege el grosor natural.",
    icon: ShieldCheck,
  },
  {
    tag: "Spa & Bienestar · Manos",
    title: "Protección Solar en Manos",
    summary:
      "La piel del dorso de las manos es una de las zonas que primero muestra fotoenvejecimiento. Usar FPS 50 diario mantiene su firmeza.",
    fact: "En cabina aplicamos hidratación profunda con parafina y antioxidantes.",
    icon: HeartHandshake,
  },
];

export const BeautyTipsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BEAUTY_TIPS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused]);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + BEAUTY_TIPS.length) % BEAUTY_TIPS.length);
  const next = () => setActiveIndex((i) => (i + 1) % BEAUTY_TIPS.length);

  const current = BEAUTY_TIPS[activeIndex];
  const Icon = current.icon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Card className="p-6 sm:p-10 rounded-2xl border-2 border-accent/25 bg-gradient-card shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Icon className="w-3.5 h-3.5" />
              {current.tag}
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {current.title}
            </h3>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {current.summary}
            </p>

            <div className="pt-2 border-t border-border/60">
              <p className="text-xs sm:text-sm font-medium text-primary">
                💡 Dato Pro: <span className="text-foreground/80 font-normal">{current.fact}</span>
              </p>
            </div>
          </div>

          <div className="flex md:flex-col items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={prev}
                aria-label="Tip anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={next}
                aria-label="Siguiente tip"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              {BEAUTY_TIPS.map((tip, idx) => (
                <button
                  key={tip.title}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ver tip ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeIndex ? "w-6 bg-primary" : "w-2 bg-primary/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
