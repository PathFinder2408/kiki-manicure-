import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import type { NegocioConfig, Servicio } from "@/types/salon";
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
