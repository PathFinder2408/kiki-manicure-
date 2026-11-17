-- ============================================================================
-- KIKI SPA — SPRINT 8: FICHA CLÍNICA CLIENTAS, RESEÑAS, PORTAL CLIENTA Y REDES
-- Ejecutar en Supabase SQL Editor.
-- ============================================================================

-- 1. Memoria / Registro personal de servicios entregados por clienta
CREATE TABLE IF NOT EXISTS public.clienta_atenciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clienta_id uuid NOT NULL REFERENCES public.clientas(id) ON DELETE CASCADE,
  fecha text NOT NULL,
  servicio text NOT NULL,
  productos_tonos text DEFAULT '',
  observaciones text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clienta_atenciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage clienta_atenciones" ON public.clienta_atenciones;
CREATE POLICY "Admin manage clienta_atenciones" ON public.clienta_atenciones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Reseñas / Evaluaciones de servicio desde el portal de clientas
CREATE TABLE IF NOT EXISTS public.resenas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre text NOT NULL,
  cliente_email text DEFAULT '',
  servicio text DEFAULT '',
  calificacion integer NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario text NOT NULL,
  aprobada boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read approved resenas" ON public.resenas;
CREATE POLICY "Public read approved resenas" ON public.resenas
  FOR SELECT TO anon, authenticated USING (aprobada = true);

DROP POLICY IF EXISTS "Public insert resenas" ON public.resenas;
CREATE POLICY "Public insert resenas" ON public.resenas
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage resenas" ON public.resenas;
CREATE POLICY "Admin manage resenas" ON public.resenas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Redes sociales en negocio_config
ALTER TABLE public.negocio_config
  ADD COLUMN IF NOT EXISTS facebook text DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok text DEFAULT '';

-- 4. RPC segura para que la clienta autenticada vea SOLO sus propias citas en /mi-agenda
DROP FUNCTION IF EXISTS public.get_my_appointments();
CREATE OR REPLACE FUNCTION public.get_my_appointments()
RETURNS TABLE (
  id text,
  servicio text,
  fecha text,
  hora text,
  estado text,
  precio_acordado integer,
  duracion_min integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id::text, c.servicio, c.fecha::text, c.hora::text, c.estado, c.precio_acordado, c.duracion_min
  FROM public.citas c
  WHERE lower(trim(c.cliente_email)) = lower(trim(COALESCE(auth.jwt() ->> 'email', '')))
  ORDER BY c.fecha DESC, c.hora DESC
  LIMIT 50;
$$;
