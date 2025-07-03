
-- Ajouter le rôle admin à l'utilisateur j.cleonis1982@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('cfcd0543-f08f-4c87-9c10-b492d9155065', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
