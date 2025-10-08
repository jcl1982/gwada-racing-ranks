-- Ajouter le rôle admin à l'utilisateur j.cleonis1982@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'j.cleonis1982@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;