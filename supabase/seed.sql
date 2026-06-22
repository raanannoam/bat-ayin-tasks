insert into bat_ayin.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'ישיבת בת עין')
on conflict (id) do update
set name = excluded.name;

insert into bat_ayin.categories (id, organization_id, slug, name, icon, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'kitchen', 'מטבח', 'kitchen', 10),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'maintenance', 'תחזוקה', 'maintenance', 20),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'study', 'לימוד', 'study', 30),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'money', 'כספים', 'money', 40),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'events', 'אירועים', 'events', 50),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'office', 'משרד', 'office', 60)
on conflict (organization_id, name) do update
set slug = excluded.slug,
    icon = excluded.icon,
    sort_order = excluded.sort_order,
    is_active = true;

-- Known member placeholders.
-- Run this section after the matching Google Auth users exist and profiles
-- have been created with these emails. Replace the emails with real ones.
with known_members(display_name, email, role) as (
  values
    ('עדינה', 'adina@example.com', 'user'),
    ('אבי', 'avi@example.com', 'user'),
    ('חיה', 'chaya@example.com', 'user'),
    ('צבי', 'tzvi@example.com', 'manager')
)
insert into bat_ayin.organization_members (organization_id, user_id, role, is_active)
select
  '00000000-0000-0000-0000-000000000001',
  p.id,
  km.role,
  true
from known_members km
join public.profiles p on p.email = km.email
on conflict (organization_id, user_id) do update
set role = excluded.role,
    is_active = true;
