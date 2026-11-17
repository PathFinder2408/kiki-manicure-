import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBlogPosts } from "@/hooks/useSalonData";
import { formatDisplayDate } from "@/lib/formatters";
import type { BlogPost } from "@/types/salon";

const CATEGORY_LABELS: Record<string, string> = {
  all: "Todos",
  cosmetologia: "Cosmetología",
  dermatologia: "Dermatología",
  spa: "Spa & Bienestar",
  tendencias: "Tendencias",
};

const Blog = () => {
  const { data: posts = [], isLoading } = useBlogPosts(true);
  const [selectedCat, setSelectedCat] = useState("all");
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const filtered = useMemo(() => {
    if (selectedCat === "all") return posts;
    return posts.filter((p) => p.categoria === selectedCat);
  }, [posts, selectedCat]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Revista & Actualidad
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
              Blog de Cosmetología & Spa
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Artículos actualizados sobre dermatología ungueal, cuidado de manos y tendencias de salón.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCat(key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCat === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 rounded-2xl h-56 animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Card
                  key={post.id}
                  className="p-6 rounded-2xl border-border/60 bg-gradient-card flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                        {CATEGORY_LABELS[post.categoria] ?? post.categoria}
                      </span>
                      {post.created_at && (
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {formatDisplayDate(post.created_at.slice(0, 10))}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-serif font-bold leading-snug">
                      {post.titulo}
                    </h2>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.resumen}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-border/60 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0 text-primary hover:text-primary/80 gap-1.5"
                      onClick={() => setActivePost(post)}
                    >
                      <BookOpen className="w-4 h-4" /> Leer artículo
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* CTA inferior */}
          <div className="mt-14 text-center">
            <Card className="p-8 rounded-2xl border-accent/25 bg-primary/5 max-w-2xl mx-auto">
              <h3 className="font-serif text-2xl font-bold mb-2">
                ¿Quieres aplicar estos cuidados con nosotras?
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Reserva tu sesión de manicura o spa de manos en menos de un minuto.
              </p>
              <Link to="/agendar">
                <Button className="rounded-xl gap-2">
                  <Calendar className="w-4 h-4" /> Agendar Cita
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal lector de artículo */}
      <Dialog open={Boolean(activePost)} onOpenChange={(open) => !open && setActivePost(null)}>
        <DialogContent className="rounded-2xl sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {activePost && (
            <>
              <DialogHeader>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary w-fit mb-2">
                  {CATEGORY_LABELS[activePost.categoria] ?? activePost.categoria}
                </span>
                <DialogTitle className="font-serif text-2xl leading-snug">
                  {activePost.titulo}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm leading-relaxed text-foreground/90">
                <p className="font-medium text-muted-foreground">{activePost.resumen}</p>
                <p className="whitespace-pre-line">{activePost.contenido}</p>
                {activePost.dato_pro && (
                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm">
                    <strong className="text-primary">💡 Dato Pro:</strong> {activePost.dato_pro}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blog;
