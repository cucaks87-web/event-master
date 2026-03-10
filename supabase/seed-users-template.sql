-- Replace the UUIDs with auth.users IDs after creating accounts in Supabase Auth.
-- Emails below are placeholders.
insert into public.profiles (id, full_name, email, role, can_create_suggestion, can_view_financials, can_view_activity_feed)
values
  ('00000000-0000-0000-0000-000000000001', 'Safet',  'safet@example.com',  'user', true,  false, false),
  ('00000000-0000-0000-0000-000000000002', 'Goran',  'goran@example.com',  'user', true,  false, false),
  ('00000000-0000-0000-0000-000000000003', 'Šišić',  'sisic@example.com',  'user', true,  false, false),
  ('00000000-0000-0000-0000-000000000004', 'Dušan',  'dusan@example.com',  'user', true,  false, false),
  ('00000000-0000-0000-0000-000000000005', 'Tamara', 'tamara@example.com', 'user', true,  false, false),
  ('00000000-0000-0000-0000-000000000006', 'Dejan',  'dejan@example.com',  'admin', true,  true,  true),
  ('00000000-0000-0000-0000-000000000007', 'Saša',   'sasa@example.com',   'super_admin', true, true, true)
on conflict (id) do nothing;
