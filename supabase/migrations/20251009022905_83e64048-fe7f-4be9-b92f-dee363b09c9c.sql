-- Add end_date column to races table to support multi-day events
ALTER TABLE public.races 
ADD COLUMN end_date date;

COMMENT ON COLUMN public.races.end_date IS 'Date de fin de la course (optionnelle, pour les événements sur plusieurs jours)';
