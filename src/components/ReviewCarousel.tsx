import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Card } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  name: string;
  review: string;
  rating: number;
  initials?: string;
}

const reviews: Review[] = [
  {
    name: "María González",
    review: "¡Increíble trabajo! Mis uñas nunca habían lucido tan bien. El ambiente es muy acogedor y Kiki es súper profesional.",
    rating: 5,
  },
  {
    name: "Valentina Silva",
    review: "Profesionalismo y creatividad en cada detalle. Totalmente recomendado, siempre salgo feliz.",
    rating: 5,
  },
  {
    name: "Camila Rojas",
    review: "Las mejores uñas de gel que me han hecho. Duran semanas sin despegarse. ¡100% recomendado!",
    rating: 5,
  },
  {
    name: "Sofía Herrera",
    review: "Me encanta el spa de manos, es súper relajante. Kiki siempre cuida cada detalle y el resultado es hermoso.",
    rating: 5,
  },
  {
    name: "Javiera Muñoz",
    review: "Llevo más de un año viniendo y cada vez me sorprende con diseños nuevos. ¡La mejor manicurista!",
    rating: 5,
  },
  {
    name: "Catalina Fuentes",
    review: "Encontré a Kiki por Instagram y desde la primera cita quedé encantada. Atención de primera y precios justos.",
    rating: 5,
  },
];

const ReviewCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();

    // Auto-play
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 4000);

    // Pausa al hover
    const rootNode = emblaApi.rootNode();
    const stopAutoplay = () => clearInterval(interval);
    const startAutoplay = () => {
      // No reiniciamos aquí para evitar resets múltiples,
      // el autoplay se maneja con el interval original
    };

    rootNode.addEventListener("mouseenter", stopAutoplay);
    rootNode.addEventListener("mouseleave", startAutoplay);

    return () => {
      clearInterval(interval);
      rootNode.removeEventListener("mouseenter", stopAutoplay);
      rootNode.removeEventListener("mouseleave", startAutoplay);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <Card className="p-6 h-full shadow-soft bg-card border-2 border-border hover:border-primary/30 transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-accent text-accent"
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{review.review}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {getInitials(review.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.name}</p>
                    <p className="text-xs text-muted-foreground">Clienta verificada</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full shadow-soft bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary hidden md:flex"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full shadow-soft bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary hidden md:flex"
        onClick={scrollNext}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-primary w-8"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewCarousel;
