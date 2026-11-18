-- ============================================================================
-- KIKI SPA — SPRINT 9: NOTIFICACIONES PUSH NATIVAS (APP ADMIN)
-- Ejecutar en Supabase SQL Editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL DEFAULT '',
  endpoint text UNIQUE NOT NULL,
  subscription jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admin manage push_subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
