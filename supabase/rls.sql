alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_updates enable row level security;
alter table public.user_preferences enable row level security;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.is_active = true
  );
$$;

create or replace function public.is_org_manager(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.role = 'manager'
      and om.is_active = true
  );
$$;

create or replace function public.shares_organization(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members viewer
    join public.organization_members subject
      on subject.organization_id = viewer.organization_id
    where viewer.user_id = auth.uid()
      and viewer.is_active = true
      and subject.user_id = target_user_id
      and subject.is_active = true
  );
$$;

create or replace function public.can_access_task(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tasks t
    where t.id = target_task_id
      and (
        t.assignee_id = auth.uid()
        or public.is_org_manager(t.organization_id)
      )
  );
$$;

create or replace function public.prevent_regular_user_reassignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_org_manager(old.organization_id) then
    return new;
  end if;

  if old.organization_id <> new.organization_id then
    raise exception 'regular users cannot move tasks between organizations';
  end if;

  if old.assignee_id <> auth.uid() or new.assignee_id <> old.assignee_id then
    raise exception 'regular users cannot reassign tasks';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_regular_user_reassignment on public.tasks;
create trigger prevent_regular_user_reassignment
before update on public.tasks
for each row
execute function public.prevent_regular_user_reassignment();

create or replace function public.validate_task_references()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and c.organization_id = new.organization_id
      and c.is_active = true
  ) then
    raise exception 'task category must belong to the task organization';
  end if;

  if not exists (
    select 1
    from public.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.assignee_id
      and om.is_active = true
  ) then
    raise exception 'task assignee must be an active organization member';
  end if;

  if new.created_by is not null and not exists (
    select 1
    from public.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.created_by
      and om.is_active = true
  ) then
    raise exception 'task creator must be an active organization member';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_task_references on public.tasks;
create trigger validate_task_references
before insert or update on public.tasks
for each row
execute function public.validate_task_references();

create or replace function public.set_task_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();

  if new.status = 'done' and old.status <> 'done' then
    new.completed_at = coalesce(new.completed_at, now());
  elsif new.status <> 'done' then
    new.completed_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_task_updated_at on public.tasks;
create trigger set_task_updated_at
before update on public.tasks
for each row
execute function public.set_task_updated_at();

create or replace function public.validate_task_update_references()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.tasks t
    where t.id = new.task_id
      and t.organization_id = new.organization_id
  ) then
    raise exception 'task update must belong to the same organization as its task';
  end if;

  if not exists (
    select 1
    from public.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.author_id
      and om.is_active = true
  ) then
    raise exception 'task update author must be an active organization member';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_task_update_references on public.task_updates;
create trigger validate_task_update_references
before insert or update on public.task_updates
for each row
execute function public.validate_task_update_references();

drop policy if exists "members can read their organizations" on public.organizations;
create policy "members can read their organizations"
on public.organizations
for select
using (public.is_org_member(id));

drop policy if exists "users can read profiles in their organization" on public.profiles;
create policy "users can read profiles in their organization"
on public.profiles
for select
using (id = auth.uid() or public.shares_organization(id));

drop policy if exists "users can create their own profile" on public.profiles;
create policy "users can create their own profile"
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "members can read organization memberships" on public.organization_members;
create policy "members can read organization memberships"
on public.organization_members
for select
using (public.is_org_member(organization_id));

drop policy if exists "managers can manage organization memberships" on public.organization_members;
create policy "managers can manage organization memberships"
on public.organization_members
for all
using (public.is_org_manager(organization_id))
with check (public.is_org_manager(organization_id));

drop policy if exists "members can read active categories" on public.categories;
create policy "members can read active categories"
on public.categories
for select
using (is_active = true and public.is_org_member(organization_id));

drop policy if exists "managers can manage categories" on public.categories;
create policy "managers can manage categories"
on public.categories
for all
using (public.is_org_manager(organization_id))
with check (public.is_org_manager(organization_id));

drop policy if exists "users can read own tasks and managers can read all" on public.tasks;
create policy "users can read own tasks and managers can read all"
on public.tasks
for select
using (assignee_id = auth.uid() or public.is_org_manager(organization_id));

drop policy if exists "users can create own tasks" on public.tasks;
create policy "users can create own tasks"
on public.tasks
for insert
with check (
  assignee_id = auth.uid()
  and created_by = auth.uid()
  and public.is_org_member(organization_id)
);

drop policy if exists "managers can create tasks for organization members" on public.tasks;
create policy "managers can create tasks for organization members"
on public.tasks
for insert
with check (
  public.is_org_manager(organization_id)
  and created_by = auth.uid()
  and exists (
    select 1
    from public.organization_members om
    where om.organization_id = tasks.organization_id
      and om.user_id = tasks.assignee_id
      and om.is_active = true
  )
);

drop policy if exists "users can update own tasks" on public.tasks;
create policy "users can update own tasks"
on public.tasks
for update
using (assignee_id = auth.uid())
with check (
  assignee_id = auth.uid()
  and public.is_org_member(organization_id)
);

drop policy if exists "managers can update all tasks" on public.tasks;
create policy "managers can update all tasks"
on public.tasks
for update
using (public.is_org_manager(organization_id))
with check (public.is_org_manager(organization_id));

drop policy if exists "users can delete own tasks" on public.tasks;
create policy "users can delete own tasks"
on public.tasks
for delete
using (assignee_id = auth.uid());

drop policy if exists "managers can delete all tasks" on public.tasks;
create policy "managers can delete all tasks"
on public.tasks
for delete
using (public.is_org_manager(organization_id));

drop policy if exists "users can read updates for accessible tasks" on public.task_updates;
create policy "users can read updates for accessible tasks"
on public.task_updates
for select
using (public.can_access_task(task_id));

drop policy if exists "users can add updates to accessible tasks" on public.task_updates;
create policy "users can add updates to accessible tasks"
on public.task_updates
for insert
with check (
  author_id = auth.uid()
  and public.can_access_task(task_id)
  and public.is_org_member(organization_id)
);

drop policy if exists "managers can delete updates" on public.task_updates;
create policy "managers can delete updates"
on public.task_updates
for delete
using (public.is_org_manager(organization_id));

drop policy if exists "users can read own preferences" on public.user_preferences;
create policy "users can read own preferences"
on public.user_preferences
for select
using (user_id = auth.uid());

drop policy if exists "users can create own preferences" on public.user_preferences;
create policy "users can create own preferences"
on public.user_preferences
for insert
with check (user_id = auth.uid());

drop policy if exists "users can update own preferences" on public.user_preferences;
create policy "users can update own preferences"
on public.user_preferences
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
