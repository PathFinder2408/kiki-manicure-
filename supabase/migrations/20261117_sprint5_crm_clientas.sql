-- ============================================================================
-- KIKI MANICURE / ANTIGRAVITY — SPRINT 5: CRM DE CLIENTAS (CRUD + AUTO-REGISTRO)
-- Ejecutar en Supabase SQL Editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clientas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text UNIQUE NOT NULL,
  email text DEFAULT '',
  notas text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Backfill inicial desde citas existentes (sin duplicar por teléfono)
INSERT INTO public.clientas (nombre, telefono, email)
SELECT DISTINCT ON (trim(cliente_telefono))
  trim(cliente_nombre),
  trim(cliente_telefono),
  COALESCE(trim(cliente_email), '')
FROM public.citas
WHERE trim(COALESCE(cliente_telefono, '')) <> ''
ORDER BY trim(cliente_telefono), created_at DESC
ON CONFLICT (telefono) DO NOTHING;

-- Seguridad RLS: solo admin autenticado lee/edita/elimina clientas
ALTER TABLE public.clientas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage clientas" ON public.clientas;
CREATE POLICY "Admin manage clientas" ON public.clientas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger automático: al agendar una cita nueva, registra a la clienta si no existe
CREATE OR REPLACE FUNCTION public.auto_register_clienta_from_cita()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text;
BEGIN
  v_phone := trim(COALESCE(NEW.cliente_telefono, ''));
  IF v_phone = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.clientas (nombre, telefono, email)
  VALUES (
    trim(COALESCE(NEW.cliente_nombre, 'Clienta')),
    v_phone,
    trim(COALESCE(NEW.cliente_email, ''))
  )
  ON CONFLICT (telefono) DO UPDATE
    SET email = CASE
      WHEN COALESCE(public.clientas.email, '') = '' AND EXCLUDED.email <> ''
      THEN EXCLUDED.email
      ELSE public.clientas.email
    END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_register_clienta ON public.citas;
CREATE TRIGGER trg_auto_register_clienta
  AFTER INSERT ON public.citas
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_register_clienta_from_cita();
