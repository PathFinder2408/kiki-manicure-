import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/useSalonData";

const CATEGORY_LABELS: Record<string, string> = {
  cosmetologia: "Cosmetología",
  dermatologia: "Dermatología",
  spa: "Spa & Bienestar",
  tendencias: "Tendencias",
};

export const BeautyTipsCarousel = () => {
  const { data: posts = [] } = useBlogPosts(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || posts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % posts.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused, posts.length]);

  useEffect(() => {
    if (activeIndex >= posts.length) {
      setActiveIndex(0);
    }
  }, [posts.length, activeIndex]);

  if (posts.length === 0) return null;

  const current = posts[activeIndex] ?? posts[0];
  const prev = () => setActiveIndex((i) => (i - 1 + posts.length) % posts.length);
  const next = () => setActiveIndex((i) => (i + 1) % posts.length);

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
              <Sparkles className="w-3.5 h-3.5" />
              {CATEGORY_LABELS[current.categoria] ?? current.categoria}
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {current.titulo}
            </h3>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {current.resumen}
            </p>

            {current.dato_pro && (
              <div className="pt-2 border-t border-border/60">
                <p className="text-xs sm:text-sm font-medium text-primary">
                  💡 Dato Pro:{" "}
                  <span className="text-foreground/80 font-normal">{current.dato_pro}</span>
                </p>
              </div>
            )}

            <div className="pt-1">
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline"
              >
                Explorar artículos en el Blog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
                aria-label="Artículo anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={next}
                aria-label="Siguiente artículo"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              {posts.map((post, idx) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ver artículo ${idx + 1}`}
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
