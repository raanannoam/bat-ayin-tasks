-- Realistic pilot data for Yeshivat Bat Ayin.
-- Run AFTER pilot users exist in auth + profiles + organization_members.
-- Removes DEBUG/CRUD/test rows and inserts Hebrew pilot tasks + suppliers.

-- Soft-delete DEBUG / test tasks
update bat_ayin.tasks
set deleted_at = coalesce(deleted_at, now()),
    deleted_by = assignee_id
where deleted_at is null
  and (
    title like '[DEBUG]%'
    or title like '%validation%'
    or title like 'משימת בדיקה%'
    or title like 'repo create%'
    or title like 'local adapter%'
    or title like 'validation task%'
  );

-- Soft-delete DEBUG / test supplier orders
update bat_ayin.supplier_orders
set deleted_at = coalesce(deleted_at, now()),
    deleted_by = created_by
where deleted_at is null
  and (
    supplier_name like '[DEBUG]%'
    or supplier_name like '%validation%'
    or description like '%cp6-%'
    or description like '%debug%'
  );

-- Hard-delete already-soft-deleted DEBUG rows (cleanup)
delete from bat_ayin.task_updates tu
using bat_ayin.tasks t
where tu.task_id = t.id and t.deleted_at is not null;

delete from bat_ayin.tasks where deleted_at is not null;

delete from bat_ayin.supplier_order_links sol
using bat_ayin.supplier_orders so
where sol.order_id = so.id and so.deleted_at is not null;

delete from bat_ayin.supplier_orders where deleted_at is not null;

-- Seed realistic tasks (assignees must exist in profiles + org_members)
with org as (
  select '00000000-0000-0000-0000-000000000001'::uuid as id
),
profiles as (
  select p.id, p.display_name
  from public.profiles p
  join bat_ayin.organization_members om on om.user_id = p.id
  join org on om.organization_id = org.id
  where om.is_active = true
),
cats as (
  select id, slug from bat_ayin.categories
  where organization_id = (select id from org) and deleted_at is null
),
seed(title, assignee_name, cat_slug, status, priority, due_date, notes) as (
  values
    ('ניקוי בית מדרש', 'צבי', 'maintenance', 'progress', 'normal', current_date, 'לפני שבת — כולל רצפה וספרים'),
    ('הזמנת ציוד למטבח', 'צבי', 'kitchen', 'progress', 'normal', current_date + 1, 'מחסניות, כלי הגשה, סכום משוער ₪800'),
    ('תיקון מזגן', 'צבי', 'maintenance', 'progress', 'high', null, 'אולם לימוד — קר בלילה'),
    ('סידור מחסן', 'צבי', 'office', 'progress', 'normal', null, 'סימון מדפים ומלאי'),
    ('רכישת חומרי ניקיון', 'צבי', 'kitchen', 'done', 'normal', current_date - 2, 'אושר עד — נרכש')
)
insert into bat_ayin.tasks (
  organization_id, category_id, assignee_id, created_by,
  title, notes, status, priority, due_date, completed_at
)
select
  org.id,
  c.id,
  p.id,
  p.id,
  s.title,
  s.notes,
  s.status,
  s.priority,
  s.due_date,
  case when s.status = 'done' then now() - interval '1 day' else null end
from seed s
cross join org
join profiles p on p.display_name = s.assignee_name
left join cats c on c.slug = s.cat_slug
where not exists (
  select 1 from bat_ayin.tasks t
  where t.organization_id = org.id and t.title = s.title and t.deleted_at is null
);

-- Seed supplier orders
with org as (
  select '00000000-0000-0000-0000-000000000001'::uuid as id
),
manager as (
  select p.id
  from public.profiles p
  join bat_ayin.organization_members om on om.user_id = p.id
  join org on om.organization_id = org.id
  where om.role = 'manager' and om.is_active = true
  order by p.display_name
  limit 1
),
seed(supplier_name, description, amount_text, due_date, all_assignees) as (
  values
    ('אייס', 'חלב, גבינות, יogurt', '₪420', current_date + 3, true),
    ('הום סנטר', 'כלים וציוד למטבח', '₪890', current_date + 7, true),
    ('שופרסל', 'מוצרי מזון יבשים', '₪650', current_date + 5, true),
    ('אושר עד', 'ירקות ופירות', '₪380', current_date + 2, true),
    ('טמבור', 'צבע וחומרי תחזוקה', '₪520', current_date + 10, true),
    ('חשמל ישיר', 'נורות וכבלים', '₪290', current_date + 4, true)
)
insert into bat_ayin.supplier_orders (
  organization_id, supplier_name, description, amount_text, due_date,
  all_assignees, assignee_ids, created_by,
  order_completed, order_completed_at
)
select
  org.id,
  s.supplier_name,
  s.description,
  s.amount_text,
  s.due_date,
  s.all_assignees,
  '{}'::uuid[],
  m.id,
  case when s.supplier_name = 'אייס' then true else false end,
  case when s.supplier_name = 'אייס' then now() - interval '1 day' else null end
from seed s
cross join org
cross join manager m
where not exists (
  select 1 from bat_ayin.supplier_orders so
  where so.organization_id = org.id and so.supplier_name = s.supplier_name and so.deleted_at is null
);
