import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import type { BlogPost, NegocioConfig, Servicio } from "@/types/salon";
import type { BookedSlot } from "@/lib/availability";

const FALLBACK_SERVICES: Servicio[] = [
  { id: "1", slug: "gel-basic", nombre: "Gel UV Básico", categoria: "gel", descripcion: "Esmaltado permanente de larga duración.", duracion_min: 45, precio: 20000, activo: true, orden: 1 },
  { id: "2", slug: "gel-design", nombre: "Gel UV con Diseño", categoria: "gel", descripcion: "Esmaltado en gel con nail art personalizado.", duracion_min: 60, precio: 25000, activo: true, orden: 2 },
  { id: "3", slug: "gel-premium", nombre: "Gel UV Premium", categoria: "gel", descripcion: "Diseño avanzado, pedrería o efectos especiales.", duracion_min: 75, precio: 35000, activo: true, orden: 3 },
  { id: "4", slug: "acrylic-basic", nombre: "Extensión Acrílica Básica", categoria: "acrilico", descripcion: "Esculpido acrílico resistente con esmaltado liso.", duracion_min: 90, precio: 30000, activo: true, orden: 4 },
  { id: "5", slug: "acrylic-design", nombre: "Acrílico con Diseño", categoria: "acrilico", descripcion: "Extensión acrílica con arte y acabado de lujo.", duracion_min: 105, precio: 35000, activo: true, orden: 5 },
  { id: "6", slug: "spa-express", nombre: "Manicura Express", categoria: "spa", descripcion: "Limpieza de cutículas, limado e hidratación rápida.", duracion_min: 30, precio: 12000, activo: true, orden: 6 },
  { id: "7", slug: "spa-classic", nombre: "Spa de Manos Clásico", categoria: "spa", descripcion: "Exfoliación, masaje relajante e hidratación profunda.", duracion_min: 45, precio: 18000, activo: true, orden: 7 },
  { id: "8", slug: "spa-premium", nombre: "Spa de Manos Premium", categoria: "spa", descripcion: "Tratamiento completo con parafina y esmaltado.", duracion_min: 60, precio: 25000, activo: true, orden: 8 },
];

const DEFAULT_WEEKLY_SCHEDULE = {
  "0": { activo: false, apertura: "15:00", cierre: "18:00" },
  "1": { activo: true, apertura: "09:00", cierre: "19:00" },
  "2": { activo: true, apertura: "09:00", cierre: "19:00" },
  "3": { activo: true, apertura: "09:00", cierre: "19:00" },
  "4": { activo: true, apertura: "09:00", cierre: "19:00" },
  "5": { activo: true, apertura: "09:00", cierre: "19:00" },
  "6": { activo: true, apertura: "09:00", cierre: "18:00" },
};

const FALLBACK_CONFIG: NegocioConfig = {
  id: 1,
  nombre_salon: "Kiki Manicure",
  subtitulo: "Manicura Profesional & Spa de Manos",
  telefono_contacto: "",
  instagram: "",
  direccion: "Salón Kiki Manicure",
  horario_apertura: "09:00",
  horario_cierre: "19:00",
  intervalo_min: 60,
  dias_cerrados: [0],
  moneda: "CLP",
  horarios_semana: DEFAULT_WEEKLY_SCHEDULE,
};

export function useServices(onlyActive = true) {
  return useQuery({
    queryKey: ["servicios", onlyActive],
    queryFn: async (): Promise<Servicio[]> => {
      let query = supabase.from("servicios").select("*").order("orden", { ascending: true });
      if (onlyActive) {
        query = query.eq("activo", true);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return FALLBACK_SERVICES;
      }
      return data as Servicio[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useBusinessConfig() {
  return useQuery({
    queryKey: ["negocio_config"],
    queryFn: async (): Promise<NegocioConfig> => {
      const { data, error } = await supabase
        .from("negocio_config")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data) {
        return FALLBACK_CONFIG;
      }
      return data as NegocioConfig;
    },
    staleTime: 1000 * 60 * 5,
  });
}

const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "glazed-milky-nails-tendencia",
    titulo: "Efecto Glazed & Milky Nails: La Tendencia Clean Girl",
    categoria: "tendencias",
    resumen: "Los tonos lechosos translúcidos con acabado perlado sutil dominan la temporada por su elegancia atemporal y bajo mantenimiento.",
    contenido: "La manicura minimalista sigue liderando en salones de alta gama. A diferencia de los colores planos intensos, las bases milky permiten que la uña luzca saludable, luminosa y limpia durante semanas.",
    dato_pro: "Combina con cualquier look y disimula el crecimiento natural hasta 3 semanas.",
    publicado: true,
  },
  {
    id: "2",
    slug: "aceite-cuticulas-matriz-ungueal",
    titulo: "Aceite de Cutículas: Ciencia Detrás de la Hidratación",
    categoria: "dermatologia",
    resumen: "Aplicar aceite de jojoba o vitamina E en la matriz ungueal antes de dormir mejora la flexibilidad de la lámina y evita quiebres.",
    contenido: "Desde el punto de vista dermatológico, la cutícula actúa como un sello biológico que protege la matriz donde nace la uña. El aceite de jojoba posee una estructura similar al sebo natural.",
    dato_pro: "Una matriz hidratada prolonga la adherencia del esmaltado en gel hasta un 30%.",
    publicado: true,
  },
  {
    id: "3",
    slug: "cero-arrancado-gel-queratina",
    titulo: "Por Qué Nunca Debes Arrancar tu Esmaltado Permanente",
    categoria: "dermatologia",
    resumen: "Retirar el gel tirando de él arranca capas superficiales de queratina, debilitando la lámina ungueal por meses.",
    contenido: "La uña natural está formada por capas compactas de queratina. Desprender el gel a la fuerza levanta los corneocitos superiores, dejando sensibilidad y adelgazamiento.",
    dato_pro: "El retiro profesional con torno suave o removedor protege el grosor natural.",
    publicado: true,
  },
  {
    id: "4",
    slug: "proteccion-solar-manos-spa",
    titulo: "Fotoprotección y Parafina: Antienvejecimiento en Manos",
    categoria: "spa",
    resumen: "La piel del dorso de las manos es una de las zonas que primero muestra fotoenvejecimiento. El cuidado diario marca la diferencia.",
    contenido: "La exposición diaria a rayos UVA genera manchas y pérdida de colágeno. Complementar el FPS 50 diario con baños de parafina tibia en cabina restaura la barrera lipídica.",
    dato_pro: "En cabina aplicamos hidratación profunda con parafina tibia y antioxidantes.",
    publicado: true,
  },
];

export function useBlogPosts(onlyPublished = true) {
  return useQuery({
    queryKey: ["blog_posts", onlyPublished],
    queryFn: async (): Promise<BlogPost[]> => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (onlyPublished) {
        query = query.eq("publicado", true);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return FALLBACK_BLOG_POSTS;
      }
      return data as BlogPost[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export interface PublicBeautyArticle {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
}

export function usePublicBeautyNews() {
  return useQuery({
    queryKey: ["public_beauty_news"],
    queryFn: async (): Promise<PublicBeautyArticle[]> => {
      const res = await fetch("/api/beauty-news");
      if (!res.ok) return [];
      const json = (await res.json()) as { ok?: boolean; items?: PublicBeautyArticle[] };
      return json.items ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useBookedSlots(dateStr?: string) {
  return useQuery({
    queryKey: ["booked_slots", dateStr],
    enabled: Boolean(dateStr),
    queryFn: async (): Promise<BookedSlot[]> => {
      if (!dateStr) return [];
      const { data, error } = await supabase.rpc("get_booked_slots", {
        p_fecha: dateStr,
      });
      if (error || !data) return [];
      return data as BookedSlot[];
    },
    staleTime: 1000 * 30,
  });
}
