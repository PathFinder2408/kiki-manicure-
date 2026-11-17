-- ============================================================================
-- KIKI MANICURE / ANTIGRAVITY — SPRINT 7: BLOG DINÁMICO SPA & DERMATOLOGÍA
-- Ejecutar en Supabase SQL Editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  titulo text NOT NULL,
  categoria text NOT NULL DEFAULT 'cosmetologia',
  resumen text NOT NULL,
  contenido text NOT NULL,
  dato_pro text DEFAULT '',
  publicado boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.blog_posts (slug, titulo, categoria, resumen, contenido, dato_pro)
VALUES
  (
    'glazed-milky-nails-tendencia',
    'Efecto Glazed & Milky Nails: La Tendencia Clean Girl',
    'tendencias',
    'Los tonos lechosos translúcidos con acabado perlado sutil dominan la temporada por su elegancia atemporal y bajo mantenimiento.',
    'La manicura minimalista sigue liderando en salones de alta gama. A diferencia de los colores planos intensos, las bases milky permiten que la uña luzca saludable, luminosa y limpia durante semanas. Al combinarla con un polvo efecto perla ultrafino, se logra un brillo espejo sutil que favorece cualquier tono de piel.',
    'Combina con cualquier look y disimula el crecimiento natural hasta 3 semanas.'
  ),
  (
    'aceite-cuticulas-matriz-ungueal',
    'Aceite de Cutículas: Ciencia Detrás de la Hidratación',
    'dermatologia',
    'Aplicar aceite de jojoba o vitamina E en la matriz ungueal antes de dormir mejora la flexibilidad de la lámina y evita quiebres.',
    'Desde el punto de vista dermatológico, la cutícula actúa como un sello biológico que protege la matriz donde nace la uña. Cuando se reseca por detergentes o alcohol gel, aparecen padrastros y descamación. El aceite de jojoba posee una estructura molecular similar al sebo natural, penetrando sin dejar sensación grasa.',
    'Una matriz hidratada prolonga la adherencia del esmaltado en gel hasta un 30%.'
  ),
  (
    'cero-arrancado-gel-queratina',
    'Por Qué Nunca Debes Arrancar tu Esmaltado Permanente',
    'dermatologia',
    'Retirar el gel tirando de él arranca capas superficiales de queratina, debilitando la lámina ungueal por meses.',
    'La uña natural está formada por múltiples capas compactas de queratina. Cuando el esmalte en gel se adhiere mediante primer y lámpara UV/LED, forma una unión mecánica fuerte. Desprenderlo a la fuerza levanta los corneocitos superiores, dejando manchas blancas, sensibilidad térmica y adelgazamiento severo.',
    'El retiro profesional con torno suave o removedor protege el grosor natural.'
  ),
  (
    'proteccion-solar-manos-spa',
    'Fotoprotección y Parafina: Antienvejecimiento en Manos',
    'spa',
    'La piel del dorso de las manos es una de las zonas que primero muestra fotoenvejecimiento. El cuidado diario marca la diferencia.',
    'La piel del dorso de la mano es muy fina y casi no tiene glándulas sebáceas. La exposición diaria a rayos UVA genera manchas y pérdida de colágeno. Complementar el uso diario de protector solar FPS 50 con baños de parafina tibia en cabina restaura la barrera lipídica y devuelve suavidad inmediata.',
    'En cabina aplicamos hidratación profunda con parafina tibia y antioxidantes.'
  ),
  (
    'biotina-y-hidratacion-cosmetologia',
    'Cosmetología Ungueal: Mitos y Verdades del Fortalecedor',
    'cosmetologia',
    '¿Endurecedor o hidratante? Elegir el producto incorrecto puede volver tus uñas más quebradizas en lugar de fortalecerlas.',
    'Muchas personas aplican endurecedores con formaldehído pensando que evitarán que sus uñas se rompan. Sin embargo, una uña demasiado rígida se parte ante el mínimo golpe. El equilibrio cosmetológico real combina queratina hidrolizada con agentes emolientes que aportan elasticidad.',
    'Una uña sana es flexible, no rígida como el cristal.'
  )
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published blog_posts" ON public.blog_posts;
CREATE POLICY "Public read published blog_posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated USING (publicado = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage blog_posts" ON public.blog_posts;
CREATE POLICY "Admin manage blog_posts" ON public.blog_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
