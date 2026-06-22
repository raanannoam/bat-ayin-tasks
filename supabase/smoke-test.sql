-- Supabase smoke test for the database foundation.
--
-- Before running:
-- 1. Run schema.sql.
-- 2. Run rls.sql.
-- 3. Run seed.sql.
-- 4. Create three temporary users in Supabase Authentication > Users.
-- 5. Replace the UUIDs below with their auth.users IDs.
--
-- This script is wrapped in a transaction and rolls back at the end.

begin;

create temp table smoke_ids (
  manager_id uuid not null,
  user_id uuid not null,
  other_user_id uuid not null,
  organization_id uuid not null
);

insert into smoke_ids
values (
  '00000000-0000-0000-0000-00000000aaa1',
  '00000000-0000-0000-0000-00000000aaa2',
  '00000000-0000-0000-0000-00000000aaa3',
  '00000000-0000-0000-0000-000000000001'
);

do $$
begin
  if exists (
    select 1
    from smoke_ids
    where manager_id = '00000000-0000-0000-0000-00000000aaa1'
       or user_id = '00000000-0000-0000-0000-00000000aaa2'
       or other_user_id = '00000000-0000-0000-0000-00000000aaa3'
  ) then
    raise notice 'Replace manager_id, user_id, and other_user_id before relying on this test.';
  end if;
end $$;

-- Base seed verification.
select 'organization exists' as check_name, count(*) = 1 as passed
from bat_ayin.organizations
where id = '00000000-0000-0000-0000-000000000001'
  and name = 'ישיבת בת עין';

select 'categories exist' as check_name, count(*) = 6 as passed
from bat_ayin.categories
where organization_id = '00000000-0000-0000-0000-000000000001';

-- Create profiles and memberships as an admin/session owner.
insert into public.profiles (id, display_name, email)
select manager_id, 'צבי Smoke', 'tzvi-smoke@example.com'
from smoke_ids
on conflict (id) do update
set display_name = excluded.display_name,
    email = excluded.email;

insert into public.profiles (id, display_name, email)
select user_id, 'עדינה Smoke', 'adina-smoke@example.com'
from smoke_ids
on conflict (id) do update
set display_name = excluded.display_name,
    email = excluded.email;

insert into public.profiles (id, display_name, email)
select other_user_id, 'אבי Smoke', 'avi-smoke@example.com'
from smoke_ids
on conflict (id) do update
set display_name = excluded.display_name,
    email = excluded.email;

insert into bat_ayin.organization_members (organization_id, user_id, role)
select organization_id, manager_id, 'manager'
from smoke_ids
on conflict (organization_id, user_id) do update
set role = excluded.role,
    is_active = true;

insert into bat_ayin.organization_members (organization_id, user_id, role)
select organization_id, user_id, 'user'
from smoke_ids
on conflict (organization_id, user_id) do update
set role = excluded.role,
    is_active = true;

insert into bat_ayin.organization_members (organization_id, user_id, role)
select organization_id, other_user_id, 'user'
from smoke_ids
on conflict (organization_id, user_id) do update
set role = excluded.role,
    is_active = true;

select 'profiles can be created' as check_name, count(*) = 3 as passed
from public.profiles
where email in ('tzvi-smoke@example.com', 'adina-smoke@example.com', 'avi-smoke@example.com');

select 'organization_members works' as check_name, count(*) = 3 as passed
from bat_ayin.organization_members
where organization_id = '00000000-0000-0000-0000-000000000001'
  and user_id in (
    (select manager_id from smoke_ids),
    (select user_id from smoke_ids),
    (select other_user_id from smoke_ids)
  );

insert into bat_ayin.tasks (
  id,
  organization_id,
  category_id,
  assignee_id,
  created_by,
  title,
  notes,
  status,
  priority,
  due_date
)
select
  '20000000-0000-0000-0000-000000000001',
  organization_id,
  '10000000-0000-0000-0000-000000000001',
  user_id,
  manager_id,
  'Smoke own task',
  'Created for RLS smoke test',
  'progress',
  'normal',
  current_date
from smoke_ids;

insert into bat_ayin.tasks (
  id,
  organization_id,
  category_id,
  assignee_id,
  created_by,
  title,
  notes,
  status,
  priority,
  due_date
)
select
  '20000000-0000-0000-0000-000000000002',
  organization_id,
  '10000000-0000-0000-0000-000000000002',
  other_user_id,
  manager_id,
  'Smoke other task',
  'Created for RLS smoke test',
  'progress',
  'high',
  current_date + 1
from smoke_ids;

-- Manager sees all tasks.
set local role authenticated;
select set_config('request.jwt.claim.sub', (select manager_id::text from smoke_ids), true);

select 'manager can see all tasks' as check_name, count(*) = 2 as passed
from bat_ayin.tasks
where id in (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002'
);

update bat_ayin.tasks
set notes = 'Manager updated all tasks'
where id in (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002'
);

select 'manager can update all tasks' as check_name, count(*) = 2 as passed
from bat_ayin.tasks
where notes = 'Manager updated all tasks'
  and id in (
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002'
  );

delete from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000002';

select 'manager can delete all tasks' as check_name, count(*) = 0 as passed
from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000002';

reset role;

-- Restore the other user's task for regular-user access checks.
insert into bat_ayin.tasks (
  id,
  organization_id,
  category_id,
  assignee_id,
  created_by,
  title,
  notes,
  status,
  priority,
  due_date
)
select
  '20000000-0000-0000-0000-000000000002',
  organization_id,
  '10000000-0000-0000-0000-000000000002',
  other_user_id,
  manager_id,
  'Smoke other task',
  'Created for RLS smoke test',
  'progress',
  'high',
  current_date + 1
from smoke_ids;

-- Regular user sees only assigned tasks.
set local role authenticated;
select set_config('request.jwt.claim.sub', (select user_id::text from smoke_ids), true);

select 'user can see only assigned tasks' as check_name, count(*) = 1 as passed
from bat_ayin.tasks
where id in (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002'
);

select 'user cannot access other users tasks' as check_name, count(*) = 0 as passed
from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000002';

update bat_ayin.tasks
set title = 'Smoke user updated own task',
    notes = 'Regular user can edit own task',
    status = 'done',
    due_date = current_date + 2,
    priority = 'high',
    category_id = '10000000-0000-0000-0000-000000000003'
where id = '20000000-0000-0000-0000-000000000001';

select 'user can update own task' as check_name, count(*) = 1 as passed
from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000001'
  and title = 'Smoke user updated own task'
  and status = 'done'
  and priority = 'high'
  and category_id = '10000000-0000-0000-0000-000000000003';

update bat_ayin.tasks
set title = 'Should not update hidden task'
where id = '20000000-0000-0000-0000-000000000002';

reset role;

select 'user cannot update other users tasks' as check_name, title <> 'Should not update hidden task' as passed
from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000002';

set local role authenticated;
select set_config('request.jwt.claim.sub', (select user_id::text from smoke_ids), true);

do $$
declare
  blocked boolean := false;
  other_id uuid := (select other_user_id from smoke_ids);
begin
  begin
    update bat_ayin.tasks
    set assignee_id = other_id
    where id = '20000000-0000-0000-0000-000000000001';
  exception when others then
    blocked := true;
  end;

  if not blocked then
    raise exception 'Expected assignee_id reassignment to be blocked';
  end if;
end $$;

select 'user cannot update assignee_id' as check_name, assignee_id = (select user_id from smoke_ids) as passed
from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000001';

delete from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000001';

select 'user can delete own task' as check_name, count(*) = 0 as passed
from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000001';

delete from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000002';

reset role;

select 'user cannot delete other users tasks' as check_name, count(*) = 1 as passed
from bat_ayin.tasks
where id = '20000000-0000-0000-0000-000000000002';

rollback;
