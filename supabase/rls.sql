alter table public.profiles enable row level security;

alter table bat_ayin.organizations enable row level security;
alter table bat_ayin.organization_members enable row level security;
alter table bat_ayin.categories enable row level security;
alter table bat_ayin.tasks enable row level security;
alter table bat_ayin.task_updates enable row level security;
alter table bat_ayin.suppliers enable row level security;
alter table bat_ayin.supplier_orders enable row level security;
alter table bat_ayin.supplier_order_links enable row level security;
alter table bat_ayin.user_preferences enable row level security;

create or replace function bat_ayin.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = bat_ayin, public
as $$
  select exists (
    select 1
    from bat_ayin.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.is_active = true
  );
$$;

create or replace function bat_ayin.is_org_manager(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = bat_ayin, public
as $$
  select exists (
    select 1
    from bat_ayin.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.role = 'manager'
      and om.is_active = true
  );
$$;

create or replace function bat_ayin.shares_organization(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = bat_ayin, public
as $$
  select exists (
    select 1
    from bat_ayin.organization_members viewer
    join bat_ayin.organization_members subject
      on subject.organization_id = viewer.organization_id
    where viewer.user_id = auth.uid()
      and viewer.is_active = true
      and subject.user_id = target_user_id
      and subject.is_active = true
  );
$$;

create or replace function bat_ayin.can_access_task(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = bat_ayin, public
as $$
  select exists (
    select 1
    from bat_ayin.tasks t
    where t.id = target_task_id
      and (
        t.assignee_id = auth.uid()
        or bat_ayin.is_org_manager(t.organization_id)
      )
  );
$$;

create or replace function bat_ayin.can_access_supplier_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = bat_ayin, public
as $$
  select exists (
    select 1
    from bat_ayin.supplier_orders o
    where o.id = target_order_id
      and o.deleted_at is null
      and bat_ayin.is_org_member(o.organization_id)
      and (
        bat_ayin.is_org_manager(o.organization_id)
        or o.all_assignees
        or auth.uid() = any(o.assignee_ids)
      )
  );
$$;

create or replace function bat_ayin.can_update_supplier_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = bat_ayin, public
as $$
  select exists (
    select 1
    from bat_ayin.supplier_orders o
    where o.id = target_order_id
      and o.deleted_at is null
      and bat_ayin.is_org_member(o.organization_id)
      and (
        bat_ayin.is_org_manager(o.organization_id)
        or auth.uid() = any(o.assignee_ids)
      )
  );
$$;

create or replace function bat_ayin.prevent_regular_user_reassignment()
returns trigger
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
begin
  if bat_ayin.is_org_manager(old.organization_id) then
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

drop trigger if exists prevent_regular_user_reassignment on bat_ayin.tasks;
create trigger prevent_regular_user_reassignment
before update on bat_ayin.tasks
for each row
execute function bat_ayin.prevent_regular_user_reassignment();

create or replace function bat_ayin.validate_task_references()
returns trigger
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
begin
  if new.category_id is not null and not exists (
    select 1
    from bat_ayin.categories c
    where c.id = new.category_id
      and c.organization_id = new.organization_id
      and c.is_active = true
  ) then
    raise exception 'task category must belong to the task organization';
  end if;

  if not exists (
    select 1
    from bat_ayin.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.assignee_id
      and om.is_active = true
  ) then
    raise exception 'task assignee must be an active organization member';
  end if;

  if new.created_by is not null and not exists (
    select 1
    from bat_ayin.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.created_by
      and om.is_active = true
  ) then
    raise exception 'task creator must be an active organization member';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_task_references on bat_ayin.tasks;
create trigger validate_task_references
before insert or update on bat_ayin.tasks
for each row
execute function bat_ayin.validate_task_references();

create or replace function bat_ayin.set_task_updated_at()
returns trigger
language plpgsql
set search_path = bat_ayin, public
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

drop trigger if exists set_task_updated_at on bat_ayin.tasks;
create trigger set_task_updated_at
before update on bat_ayin.tasks
for each row
execute function bat_ayin.set_task_updated_at();

create or replace function bat_ayin.validate_task_update_references()
returns trigger
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
begin
  if not exists (
    select 1
    from bat_ayin.tasks t
    where t.id = new.task_id
      and t.organization_id = new.organization_id
  ) then
    raise exception 'task update must belong to the same organization as its task';
  end if;

  if not exists (
    select 1
    from bat_ayin.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.author_id
      and om.is_active = true
  ) then
    raise exception 'task update author must be an active organization member';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_task_update_references on bat_ayin.task_updates;
create trigger validate_task_update_references
before insert or update on bat_ayin.task_updates
for each row
execute function bat_ayin.validate_task_update_references();

create or replace function bat_ayin.prevent_regular_user_supplier_order_reassignment()
returns trigger
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
begin
  if bat_ayin.is_org_manager(old.organization_id) then
    return new;
  end if;

  if old.organization_id <> new.organization_id then
    raise exception 'regular users cannot move supplier orders between organizations';
  end if;

  if old.all_assignees <> new.all_assignees
     or old.assignee_ids <> new.assignee_ids then
    raise exception 'regular users cannot reassign supplier orders';
  end if;

  if old.deleted_at is distinct from new.deleted_at then
    raise exception 'regular users cannot soft delete supplier orders';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_regular_user_supplier_order_reassignment on bat_ayin.supplier_orders;
create trigger prevent_regular_user_supplier_order_reassignment
before update on bat_ayin.supplier_orders
for each row
execute function bat_ayin.prevent_regular_user_supplier_order_reassignment();

create or replace function bat_ayin.validate_supplier_order_references()
returns trigger
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
declare
  assignee_id uuid;
begin
  if new.supplier_id is not null and not exists (
    select 1
    from bat_ayin.suppliers s
    where s.id = new.supplier_id
      and s.organization_id = new.organization_id
      and s.deleted_at is null
  ) then
    raise exception 'supplier must belong to the order organization';
  end if;

  if new.created_by is not null and not exists (
    select 1
    from bat_ayin.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.created_by
      and om.is_active = true
  ) then
    raise exception 'supplier order creator must be an active organization member';
  end if;

  if new.all_assignees then
    return new;
  end if;

  foreach assignee_id in array new.assignee_ids loop
    if not exists (
      select 1
      from bat_ayin.organization_members om
      where om.organization_id = new.organization_id
        and om.user_id = assignee_id
        and om.is_active = true
    ) then
      raise exception 'supplier order assignee must be an active organization member';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists validate_supplier_order_references on bat_ayin.supplier_orders;
create trigger validate_supplier_order_references
before insert or update on bat_ayin.supplier_orders
for each row
execute function bat_ayin.validate_supplier_order_references();

create or replace function bat_ayin.validate_supplier_order_link_references()
returns trigger
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
begin
  if not exists (
    select 1
    from bat_ayin.supplier_orders o
    where o.id = new.supplier_order_id
      and o.organization_id = new.organization_id
  ) then
    raise exception 'supplier order link must belong to the same organization as its order';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_supplier_order_link_references on bat_ayin.supplier_order_links;
create trigger validate_supplier_order_link_references
before insert or update on bat_ayin.supplier_order_links
for each row
execute function bat_ayin.validate_supplier_order_link_references();

grant execute on all functions in schema bat_ayin to authenticated, anon, service_role;

alter default privileges in schema bat_ayin
  grant execute on functions to authenticated, anon, service_role;

drop policy if exists "users can read profiles in their organization" on public.profiles;
create policy "users can read profiles in their organization"
on public.profiles
for select
using (id = auth.uid() or bat_ayin.shares_organization(id));

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

drop policy if exists "members can read their organizations" on bat_ayin.organizations;
create policy "members can read their organizations"
on bat_ayin.organizations
for select
using (bat_ayin.is_org_member(id));

drop policy if exists "members can read organization memberships" on bat_ayin.organization_members;
create policy "members can read organization memberships"
on bat_ayin.organization_members
for select
using (bat_ayin.is_org_member(organization_id));

drop policy if exists "managers can manage organization memberships" on bat_ayin.organization_members;
create policy "managers can manage organization memberships"
on bat_ayin.organization_members
for all
using (bat_ayin.is_org_manager(organization_id))
with check (bat_ayin.is_org_manager(organization_id));

drop policy if exists "members can read active categories" on bat_ayin.categories;
create policy "members can read active categories"
on bat_ayin.categories
for select
using (is_active = true and bat_ayin.is_org_member(organization_id));

drop policy if exists "managers can manage categories" on bat_ayin.categories;
create policy "managers can manage categories"
on bat_ayin.categories
for all
using (bat_ayin.is_org_manager(organization_id))
with check (bat_ayin.is_org_manager(organization_id));

drop policy if exists "users can read own tasks and managers can read all" on bat_ayin.tasks;
create policy "users can read own tasks and managers can read all"
on bat_ayin.tasks
for select
using (assignee_id = auth.uid() or bat_ayin.is_org_manager(organization_id));

drop policy if exists "users can create own tasks" on bat_ayin.tasks;
create policy "users can create own tasks"
on bat_ayin.tasks
for insert
with check (
  assignee_id = auth.uid()
  and created_by = auth.uid()
  and bat_ayin.is_org_member(organization_id)
);

drop policy if exists "managers can create tasks for organization members" on bat_ayin.tasks;
create policy "managers can create tasks for organization members"
on bat_ayin.tasks
for insert
with check (
  bat_ayin.is_org_manager(organization_id)
  and created_by = auth.uid()
  and exists (
    select 1
    from bat_ayin.organization_members om
    where om.organization_id = tasks.organization_id
      and om.user_id = tasks.assignee_id
      and om.is_active = true
  )
);

drop policy if exists "users can update own tasks" on bat_ayin.tasks;
create policy "users can update own tasks"
on bat_ayin.tasks
for update
using (assignee_id = auth.uid())
with check (
  assignee_id = auth.uid()
  and bat_ayin.is_org_member(organization_id)
);

drop policy if exists "managers can update all tasks" on bat_ayin.tasks;
create policy "managers can update all tasks"
on bat_ayin.tasks
for update
using (bat_ayin.is_org_manager(organization_id))
with check (bat_ayin.is_org_manager(organization_id));

drop policy if exists "users can delete own tasks" on bat_ayin.tasks;
create policy "users can delete own tasks"
on bat_ayin.tasks
for delete
using (assignee_id = auth.uid());

drop policy if exists "managers can delete all tasks" on bat_ayin.tasks;
create policy "managers can delete all tasks"
on bat_ayin.tasks
for delete
using (bat_ayin.is_org_manager(organization_id));

drop policy if exists "users can read updates for accessible tasks" on bat_ayin.task_updates;
create policy "users can read updates for accessible tasks"
on bat_ayin.task_updates
for select
using (bat_ayin.can_access_task(task_id));

drop policy if exists "users can add updates to accessible tasks" on bat_ayin.task_updates;
create policy "users can add updates to accessible tasks"
on bat_ayin.task_updates
for insert
with check (
  author_id = auth.uid()
  and bat_ayin.can_access_task(task_id)
  and bat_ayin.is_org_member(organization_id)
);

drop policy if exists "managers can delete updates" on bat_ayin.task_updates;
create policy "managers can delete updates"
on bat_ayin.task_updates
for delete
using (bat_ayin.is_org_manager(organization_id));

drop policy if exists "members can read active suppliers" on bat_ayin.suppliers;
create policy "members can read active suppliers"
on bat_ayin.suppliers
for select
using (
  deleted_at is null
  and bat_ayin.is_org_member(organization_id)
);

drop policy if exists "managers can manage suppliers" on bat_ayin.suppliers;
create policy "managers can manage suppliers"
on bat_ayin.suppliers
for all
using (bat_ayin.is_org_manager(organization_id))
with check (bat_ayin.is_org_manager(organization_id));

drop policy if exists "users can read accessible supplier orders" on bat_ayin.supplier_orders;
create policy "users can read accessible supplier orders"
on bat_ayin.supplier_orders
for select
using (
  deleted_at is null
  and bat_ayin.is_org_member(organization_id)
  and (
    bat_ayin.is_org_manager(organization_id)
    or all_assignees
    or auth.uid() = any(assignee_ids)
  )
);

drop policy if exists "managers can create supplier orders" on bat_ayin.supplier_orders;
create policy "managers can create supplier orders"
on bat_ayin.supplier_orders
for insert
with check (
  bat_ayin.is_org_manager(organization_id)
  and created_by = auth.uid()
  and bat_ayin.is_org_member(organization_id)
);

drop policy if exists "members can create assigned supplier orders" on bat_ayin.supplier_orders;
create policy "members can create assigned supplier orders"
on bat_ayin.supplier_orders
for insert
with check (
  bat_ayin.is_org_member(organization_id)
  and created_by = auth.uid()
  and (
    all_assignees
    or auth.uid() = any(assignee_ids)
  )
);

drop policy if exists "users can update assigned supplier orders" on bat_ayin.supplier_orders;
create policy "users can update assigned supplier orders"
on bat_ayin.supplier_orders
for update
using (
  deleted_at is null
  and auth.uid() = any(assignee_ids)
  and bat_ayin.is_org_member(organization_id)
)
with check (
  deleted_at is null
  and auth.uid() = any(assignee_ids)
  and bat_ayin.is_org_member(organization_id)
);

drop policy if exists "managers can update all supplier orders" on bat_ayin.supplier_orders;
create policy "managers can update all supplier orders"
on bat_ayin.supplier_orders
for update
using (bat_ayin.is_org_manager(organization_id))
with check (bat_ayin.is_org_manager(organization_id));

drop policy if exists "managers can delete supplier orders" on bat_ayin.supplier_orders;
create policy "managers can delete supplier orders"
on bat_ayin.supplier_orders
for delete
using (bat_ayin.is_org_manager(organization_id));

drop policy if exists "users can read links for accessible supplier orders" on bat_ayin.supplier_order_links;
create policy "users can read links for accessible supplier orders"
on bat_ayin.supplier_order_links
for select
using (
  deleted_at is null
  and bat_ayin.can_access_supplier_order(supplier_order_id)
);

drop policy if exists "users can add links to updatable supplier orders" on bat_ayin.supplier_order_links;
create policy "users can add links to updatable supplier orders"
on bat_ayin.supplier_order_links
for insert
with check (
  bat_ayin.can_update_supplier_order(supplier_order_id)
  and bat_ayin.is_org_member(organization_id)
);

drop policy if exists "users can update links on updatable supplier orders" on bat_ayin.supplier_order_links;
create policy "users can update links on updatable supplier orders"
on bat_ayin.supplier_order_links
for update
using (bat_ayin.can_update_supplier_order(supplier_order_id))
with check (
  bat_ayin.can_update_supplier_order(supplier_order_id)
  and bat_ayin.is_org_member(organization_id)
);

drop policy if exists "managers can delete supplier order links" on bat_ayin.supplier_order_links;
create policy "managers can delete supplier order links"
on bat_ayin.supplier_order_links
for delete
using (bat_ayin.is_org_manager(organization_id));

drop policy if exists "users can delete links on updatable supplier orders" on bat_ayin.supplier_order_links;
create policy "users can delete links on updatable supplier orders"
on bat_ayin.supplier_order_links
for delete
using (bat_ayin.can_update_supplier_order(supplier_order_id));

drop policy if exists "users can read own preferences" on bat_ayin.user_preferences;
create policy "users can read own preferences"
on bat_ayin.user_preferences
for select
using (user_id = auth.uid());

drop policy if exists "users can create own preferences" on bat_ayin.user_preferences;
create policy "users can create own preferences"
on bat_ayin.user_preferences
for insert
with check (user_id = auth.uid());

drop policy if exists "users can update own preferences" on bat_ayin.user_preferences;
create policy "users can update own preferences"
on bat_ayin.user_preferences
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
