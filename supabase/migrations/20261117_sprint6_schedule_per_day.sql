-- ============================================================================
-- KIKI MANICURE / ANTIGRAVITY — SPRINT 6: HORARIOS POR DÍA DE LA SEMANA
-- Ejecutar en Supabase SQL Editor.
-- ============================================================================

ALTER TABLE public.negocio_config
  ADD COLUMN IF NOT EXISTS horarios_semana jsonb NOT NULL DEFAULT '{
    "0": {"activo": false, "apertura": "15:00", "cierre": "18:00"},
    "1": {"activo": true,  "apertura": "09:00", "cierre": "19:00"},
    "2": {"activo": true,  "apertura": "09:00", "cierre": "19:00"},
    "3": {"activo": true,  "apertura": "09:00", "cierre": "19:00"},
    "4": {"activo": true,  "apertura": "09:00", "cierre": "19:00"},
    "5": {"activo": true,  "apertura": "09:00", "cierre": "19:00"},
    "6": {"activo": true,  "apertura": "09:00", "cierre": "18:00"}
  }'::jsonb;
