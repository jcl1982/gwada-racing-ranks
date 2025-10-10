-- Create function to clear previous standings for a championship
CREATE OR REPLACE FUNCTION clear_previous_standings(p_championship_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.previous_standings
  WHERE championship_id = p_championship_id;
END;
$$;