
-- Table pour archiver les saisons complètes
CREATE TABLE public.season_archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id uuid REFERENCES public.championship_config(id) ON DELETE SET NULL,
  title text NOT NULL,
  year text NOT NULL,
  archived_at timestamp with time zone NOT NULL DEFAULT now(),
  config_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  drivers_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  races_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  standings_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.season_archives ENABLE ROW LEVEL SECURITY;

-- Anyone can view archives
CREATE POLICY "Anyone can view season archives"
  ON public.season_archives FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Only admins can insert season archives"
  ON public.season_archives FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Only admins can delete season archives"
  ON public.season_archives FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Only admins can update season archives"
  ON public.season_archives FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
