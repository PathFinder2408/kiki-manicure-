import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/supabase";

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "Todos" },
    { id: "gel", label: "Uñas Gel" },
    { id: "acrylic", label: "Uñas Acrílicas" },
    { id: "spa", label: "Spa de Manos" },
  ];

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("portafolio")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPhotos(data);
    setLoading(false);
  };

  const filteredPhotos = selectedCategory === "all"
    ? photos
    : photos.filter((p) => p.categoria === selectedCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">Nuestro Portafolio</h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Descubre nuestra colección de diseños únicos y trabajos realizados
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex-1 min-w-[140px] sm:flex-none sm:min-w-[120px] text-xs sm:text-sm"
              >
                {category.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-20">Cargando...</div>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              No hay fotos en esta categoría aún.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredPhotos.map((photo) => (
                <Card
                  key={photo.id}
                  className="group overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 shadow-soft hover:shadow-hover bg-gradient-card"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={photo.imagen_url}
                      alt={photo.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-6 w-full">
                        <h3 className="text-xl font-serif font-bold text-white mb-1">{photo.titulo}</h3>
                        {photo.descripcion && (
                          <p className="text-white/80 text-sm">{photo.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <p className="text-lg text-muted-foreground mb-6">¿Te gustaría un diseño personalizado?</p>
            <Button size="lg" variant="hero">Agenda tu Cita</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Portfolio;