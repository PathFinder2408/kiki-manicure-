-- ============================================================================
-- KIKI MANICURE / ANTIGRAVITY — SPRINT 1 MIGRATION
-- Script idempotente para ejecutar en Supabase SQL Editor.
-- Mejora la seguridad (RLS), previene double-booking y prepara el modelo
-- para catálogo dinámico, configuración White-Label y finanzas avanzadas.
-- ============================================================================

-- 1. Evolución de tabla `citas` (estados, precio acordado, duración, notas)
ALTER TABLE public.citas
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS precio_acordado integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duracion_min integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS notas text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'citas_estado_check'
  ) THEN
    ALTER TABLE public.citas
      ADD CONSTRAINT citas_estado_check
      CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio'));
  END IF;
END $$;

-- Resolver duplicados históricos sin borrar registros (deja activa la reserva más reciente y marca duplicados previos como 'cancelada')
WITH ranked AS (
  SELECT
    ctid,
    ROW_NUMBER() OVER (PARTITION BY fecha, hora ORDER BY created_at DESC, ctid DESC) AS rn
  FROM public.citas
  WHERE estado NOT IN ('cancelada', 'no_asistio')
)
UPDATE public.citas c
SET
  estado = 'cancelada',
  notas = COALESCE(c.notas || ' | ', '') || 'Duplicado histórico resuelto en migración'
FROM ranked r
WHERE c.ctid = r.ctid
  AND r.rn > 1;

-- Índice único parcial: impide que 2 citas activas ocupen el mismo día y hora
CREATE UNIQUE INDEX IF NOT EXISTS idx_citas_unique_active_slot
  ON public.citas (fecha, hora)
  WHERE estado NOT IN ('cancelada', 'no_asistio');

-- 2. Evolución de tabla `finanzas` (categoría, método de pago, vínculo a cita)
ALTER TABLE public.finanzas
  ADD COLUMN IF NOT EXISTS categoria text NOT NULL DEFAULT 'servicios',
  ADD COLUMN IF NOT EXISTS metodo_pago text NOT NULL DEFAULT 'efectivo',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

DO $$
DECLARE
  v_citas_id_type text;
BEGIN
  SELECT data_type INTO v_citas_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'citas' AND column_name = 'id';

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'finanzas' AND column_name = 'cita_id'
  ) THEN
    IF v_citas_id_type = 'uuid' THEN
      ALTER TABLE public.finanzas ADD COLUMN cita_id uuid REFERENCES public.citas(id) ON DELETE SET NULL;
    ELSE
      ALTER TABLE public.finanzas ADD COLUMN cita_id bigint REFERENCES public.citas(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'finanzas_metodo_pago_check'
  ) THEN
    ALTER TABLE public.finanzas
      ADD CONSTRAINT finanzas_metodo_pago_check
      CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'otro'));
  END IF;
END $$;

-- 3. Catálogo dinámico de servicios (editable desde /admin)
CREATE TABLE IF NOT EXISTS public.servicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  nombre text NOT NULL,
  categoria text NOT NULL,
  descripcion text DEFAULT '',
  duracion_min integer NOT NULL DEFAULT 60,
  precio integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.servicios (slug, nombre, categoria, descripcion, duracion_min, precio, orden)
VALUES
  ('gel-basic', 'Gel UV Básico', 'gel', 'Esmaltado permanente de larga duración con acabado brillante.', 45, 20000, 1),
  ('gel-design', 'Gel UV con Diseño', 'gel', 'Esmaltado en gel con nail art personalizado.', 60, 25000, 2),
  ('gel-premium', 'Gel UV Premium', 'gel', 'Diseño avanzado, pedrería o efectos especiales en gel.', 75, 35000, 3),
  ('acrylic-basic', 'Extensión Acrílica Básica', 'acrilico', 'Esculpido acrílico resistente con esmaltado liso.', 90, 30000, 4),
  ('acrylic-design', 'Acrílico con Diseño', 'acrilico', 'Extensión acrílica con arte y acabado de lujo.', 105, 35000, 5),
  ('spa-express', 'Manicura Express', 'spa', 'Limpieza de cutículas, limado e hidratación rápida.', 30, 12000, 6),
  ('spa-classic', 'Spa de Manos Clásico', 'spa', 'Exfoliación, masaje relajante e hidratación profunda.', 45, 18000, 7),
  ('spa-premium', 'Spa de Manos Premium', 'spa', 'Tratamiento completo con parafina y esmaltado.', 60, 25000, 8)
ON CONFLICT (slug) DO NOTHING;

-- 4. Configuración White-Label del Salón
CREATE TABLE IF NOT EXISTS public.negocio_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nombre_salon text NOT NULL DEFAULT 'Kiki Manicure',
  subtitulo text NOT NULL DEFAULT 'Manicura Profesional & Spa de Manos',
  telefono_contacto text DEFAULT '',
  instagram text DEFAULT '',
  direccion text DEFAULT '',
  horario_apertura text NOT NULL DEFAULT '09:00',
  horario_cierre text NOT NULL DEFAULT '19:00',
  intervalo_min integer NOT NULL DEFAULT 60,
  dias_cerrados integer[] NOT NULL DEFAULT '{0}', -- 0 = Domingo
  moneda text NOT NULL DEFAULT 'CLP'
);

INSERT INTO public.negocio_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 5. Función RPC segura para consultar horarios ocupados sin exponer datos de clientas
CREATE OR REPLACE FUNCTION public.get_booked_slots(p_fecha date)
RETURNS TABLE (hora text, duracion_min integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_char(c.hora::time, 'HH24:MI') AS hora, c.duracion_min
  FROM public.citas c
  WHERE c.fecha::text = p_fecha::text
    AND c.estado NOT IN ('cancelada', 'no_asistio');
$$;

-- 6. Seguridad Row Level Security (RLS)
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finanzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portafolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negocio_config ENABLE ROW LEVEL SECURITY;

-- Políticas para `citas`: público solo inserta; admin autenticado gestiona todo
DROP POLICY IF EXISTS "Public insert citas" ON public.citas;
CREATE POLICY "Public insert citas" ON public.citas
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage citas" ON public.citas;
CREATE POLICY "Admin manage citas" ON public.citas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para `finanzas`: SOLO admin autenticado
DROP POLICY IF EXISTS "Admin only finanzas" ON public.finanzas;
CREATE POLICY "Admin only finanzas" ON public.finanzas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para `servicios`, `negocio_config`, `portafolio`: lectura pública, edición admin
DROP POLICY IF EXISTS "Public read servicios" ON public.servicios;
CREATE POLICY "Public read servicios" ON public.servicios
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage servicios" ON public.servicios;
CREATE POLICY "Admin manage servicios" ON public.servicios
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read config" ON public.negocio_config;
CREATE POLICY "Public read config" ON public.negocio_config
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage config" ON public.negocio_config;
CREATE POLICY "Admin manage config" ON public.negocio_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read portafolio" ON public.portafolio;
CREATE POLICY "Public read portafolio" ON public.portafolio
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage portafolio" ON public.portafolio;
CREATE POLICY "Admin manage portafolio" ON public.portafolio
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
