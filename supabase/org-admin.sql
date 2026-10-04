-- Organization Administration: invitations table, member RPCs, last-manager protection.
-- Run after schema.sql and rls.sql.

alter table bat_ayin.organization_members
  add column if not exists first_login_at timestamptz,
  add column if not exists last_activity_at timestamptz;

create table if not exists bat_ayin.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bat_ayin.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('manager', 'user')),
  invited_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  token_hash text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Collapse any pre-existing duplicate pending invitations per (organization, email)
-- before enforcing uniqueness below — keeps the newest pending row per email, revokes
-- older duplicates. No-op if there are no duplicates.
with ranked as (
  select id, row_number() over (
    partition by organization_id, lower(email)
    order by created_at desc, id desc
  ) as rn
  from bat_ayin.organization_invitations
  where status = 'pending'
)
update bat_ayin.organization_invitations oi
set status = 'revoked', updated_at = now()
from ranked
where oi.id = ranked.id
  and ranked.rn > 1;

drop index if exists bat_ayin.organization_invitations_org_email_idx;

-- Unique (not just indexed) so two concurrent prepare_organization_invitation calls for
-- the same (organization, email) can't both pass the pending-invitation check and both
-- insert — the second insert hits this constraint and is translated to the same
-- "pending invitation already exists" error inside the function below.
create unique index if not exists organization_invitations_org_email_pending_idx
  on bat_ayin.organization_invitations (organization_id, lower(email))
  where status = 'pending';

create or replace function bat_ayin.count_active_managers(target_organization_id uuid)
returns integer
language sql
stable
security definer
set search_path = bat_ayin, public
as $$
  select count(*)::integer
  from bat_ayin.organization_members om
  where om.organization_id = target_organization_id
    and om.role = 'manager'
    and om.is_active = true;
$$;

create or replace function bat_ayin.prevent_last_manager_membership_change()
returns trigger
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
declare
  active_managers integer;
begin
  if old.role = 'manager' and old.is_active = true then
    if (new.role <> 'manager' or new.is_active = false) then
      select bat_ayin.count_active_managers(old.organization_id) into active_managers;
      if active_managers <= 1 then
        raise exception 'cannot remove or demote the last active manager'
          using errcode = 'P0001';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_last_manager_membership_change on bat_ayin.organization_members;
create trigger prevent_last_manager_membership_change
before update on bat_ayin.organization_members
for each row
execute function bat_ayin.prevent_last_manager_membership_change();

create or replace function bat_ayin.list_organization_members(p_organization_id uuid)
returns table (
  user_id uuid,
  display_name text,
  email text,
  role text,
  is_active boolean,
  first_login_at timestamptz,
  last_activity_at timestamptz,
  member_since timestamptz
)
language plpgsql
stable
security definer
set search_path = bat_ayin, public, auth
as $$
begin
  if not bat_ayin.is_org_manager(p_organization_id) then
    raise exception 'permission denied for organization members list'
      using errcode = '42501';
  end if;

  return query
  select
    om.user_id,
    p.display_name,
    p.email,
    om.role,
    om.is_active,
    coalesce(om.first_login_at, u.created_at, p.created_at) as first_login_at,
    coalesce(om.last_activity_at, u.last_sign_in_at) as last_activity_at,
    om.created_at as member_since
  from bat_ayin.organization_members om
  join public.profiles p on p.id = om.user_id
  left join auth.users u on u.id = om.user_id
  where om.organization_id = p_organization_id
  order by p.display_name collate "C";
end;
$$;

create or replace function bat_ayin.update_organization_member_role(
  p_organization_id uuid,
  p_user_id uuid,
  p_new_role text
)
returns void
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
declare
  current_row bat_ayin.organization_members%rowtype;
begin
  if not bat_ayin.is_org_manager(p_organization_id) then
    raise exception 'permission denied for member role update'
      using errcode = '42501';
  end if;

  if p_new_role not in ('manager', 'user') then
    raise exception 'invalid role %', p_new_role;
  end if;

  select * into current_row
  from bat_ayin.organization_members
  where organization_id = p_organization_id
    and user_id = p_user_id;

  if current_row.user_id is null then
    raise exception 'organization member not found';
  end if;

  if current_row.role = p_new_role then
    return;
  end if;

  update bat_ayin.organization_members
  set
    role = p_new_role,
    updated_at = now()
  where organization_id = p_organization_id
    and user_id = p_user_id;
end;
$$;

create or replace function bat_ayin.set_organization_member_active(
  p_organization_id uuid,
  p_user_id uuid,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
declare
  current_row bat_ayin.organization_members%rowtype;
begin
  if not bat_ayin.is_org_manager(p_organization_id) then
    raise exception 'permission denied for member activation update'
      using errcode = '42501';
  end if;

  select * into current_row
  from bat_ayin.organization_members
  where organization_id = p_organization_id
    and user_id = p_user_id;

  if current_row.user_id is null then
    raise exception 'organization member not found';
  end if;

  if current_row.is_active = p_is_active then
    return;
  end if;

  update bat_ayin.organization_members
  set
    is_active = p_is_active,
    updated_at = now()
  where organization_id = p_organization_id
    and user_id = p_user_id;
end;
$$;

create or replace function bat_ayin.prepare_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_role text default 'user'
)
returns uuid
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
declare
  normalized_email text;
  invitation_id uuid;
  existing_member_id uuid;
  existing_invitation_id uuid;
begin
  if not bat_ayin.is_org_manager(p_organization_id) then
    raise exception 'permission denied for organization invitation'
      using errcode = '42501';
  end if;

  normalized_email := lower(trim(p_email));
  if normalized_email = '' or position('@' in normalized_email) = 0 then
    raise exception 'invalid invitation email';
  end if;

  if p_role not in ('manager', 'user') then
    raise exception 'invalid invitation role %', p_role;
  end if;

  -- An email already belonging to an active member must not get a second,
  -- conflicting invitation — role changes for existing members go through
  -- update_organization_member_role, never through re-inviting.
  select om.user_id into existing_member_id
  from bat_ayin.organization_members om
  join public.profiles p on p.id = om.user_id
  where om.organization_id = p_organization_id
    and om.is_active = true
    and lower(trim(p.email)) = normalized_email
  limit 1;

  if existing_member_id is not null then
    raise exception 'invitation target is already an active organization member'
      using errcode = 'P0001';
  end if;

  -- One pending invitation per email at a time — block instead of silently
  -- replacing, so the manager gets clear feedback instead of a surprise swap.
  select id into existing_invitation_id
  from bat_ayin.organization_invitations
  where organization_id = p_organization_id
    and lower(email) = normalized_email
    and status = 'pending'
    and (expires_at is null or expires_at > now())
  limit 1;

  if existing_invitation_id is not null then
    raise exception 'a pending invitation already exists for this email'
      using errcode = 'P0001';
  end if;

  -- Re-checked at the constraint level: two concurrent calls can both pass the
  -- existing_invitation_id check above before either commits, so the unique partial
  -- index is the real guard against duplicate pending rows — this just gives it the
  -- same friendly error message as the plain pre-check above.
  begin
    insert into bat_ayin.organization_invitations (
      organization_id,
      email,
      role,
      invited_by,
      status
    )
    values (
      p_organization_id,
      normalized_email,
      p_role,
      auth.uid(),
      'pending'
    )
    returning id into invitation_id;
  exception
    when unique_violation then
      raise exception 'a pending invitation already exists for this email'
        using errcode = 'P0001';
  end;

  return invitation_id;
end;
$$;

create or replace function bat_ayin.list_organization_invitations(p_organization_id uuid)
returns table (
  id uuid,
  email text,
  role text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = bat_ayin, public
as $$
begin
  if not bat_ayin.is_org_manager(p_organization_id) then
    raise exception 'permission denied for organization invitations list'
      using errcode = '42501';
  end if;

  return query
  select
    oi.id,
    oi.email,
    oi.role,
    oi.created_at
  from bat_ayin.organization_invitations oi
  where oi.organization_id = p_organization_id
    and oi.status = 'pending'
    and (oi.expires_at is null or oi.expires_at > now())
  order by oi.created_at desc;
end;
$$;

create or replace function bat_ayin.revoke_organization_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
declare
  v_organization_id uuid;
  v_status text;
begin
  select organization_id, status into v_organization_id, v_status
  from bat_ayin.organization_invitations
  where id = p_invitation_id;

  -- Missing row and "not your organization" must be indistinguishable to the caller —
  -- otherwise a manager could probe invitation ids for existence across organizations.
  if v_organization_id is null or not bat_ayin.is_org_manager(v_organization_id) then
    raise exception 'permission denied for organization invitation'
      using errcode = '42501';
  end if;

  if v_status <> 'pending' then
    raise exception 'invitation is not pending';
  end if;

  update bat_ayin.organization_invitations
  set status = 'revoked', updated_at = now()
  where id = p_invitation_id
    and status = 'pending';
end;
$$;

create or replace function bat_ayin.accept_pending_invitation()
returns boolean
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
declare
  v_user_id uuid;
  v_email text;
  v_invitation record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  v_email := lower(trim(auth.email()));
  if v_email is null or v_email = '' then
    return false;
  end if;

  select * into v_invitation
  from bat_ayin.organization_invitations
  where lower(email) = v_email
    and status = 'pending'
    and (expires_at is null or expires_at > now())
  limit 1;

  if v_invitation.id is null then
    return false;
  end if;

  insert into bat_ayin.organization_members (
    organization_id,
    user_id,
    role,
    is_active
  )
  values (
    v_invitation.organization_id,
    v_user_id,
    v_invitation.role,
    true
  )
  on conflict (organization_id, user_id)
  do update set
    role = excluded.role,
    is_active = true,
    updated_at = now();

  update bat_ayin.organization_invitations
  set
    status = 'accepted',
    updated_at = now()
  where id = v_invitation.id;

  return true;
end;
$$;

revoke all on function bat_ayin.list_organization_members(uuid) from public;
grant execute on function bat_ayin.list_organization_members(uuid) to authenticated;

revoke all on function bat_ayin.accept_pending_invitation() from public;
grant execute on function bat_ayin.accept_pending_invitation() to authenticated;

revoke all on function bat_ayin.update_organization_member_role(uuid, uuid, text) from public;
grant execute on function bat_ayin.update_organization_member_role(uuid, uuid, text) to authenticated;

revoke all on function bat_ayin.set_organization_member_active(uuid, uuid, boolean) from public;
grant execute on function bat_ayin.set_organization_member_active(uuid, uuid, boolean) to authenticated;

revoke all on function bat_ayin.prepare_organization_invitation(uuid, text, text) from public;
grant execute on function bat_ayin.prepare_organization_invitation(uuid, text, text) to authenticated;

revoke all on function bat_ayin.list_organization_invitations(uuid) from public;
grant execute on function bat_ayin.list_organization_invitations(uuid) to authenticated;

revoke all on function bat_ayin.revoke_organization_invitation(uuid) from public;
grant execute on function bat_ayin.revoke_organization_invitation(uuid) to authenticated;

alter table bat_ayin.organization_invitations enable row level security;

drop policy if exists "managers can read organization invitations" on bat_ayin.organization_invitations;
create policy "managers can read organization invitations"
on bat_ayin.organization_invitations
for select
using (bat_ayin.is_org_manager(organization_id));

drop policy if exists "managers can manage organization invitations" on bat_ayin.organization_invitations;
create policy "managers can manage organization invitations"
on bat_ayin.organization_invitations
for all
using (bat_ayin.is_org_manager(organization_id))
with check (bat_ayin.is_org_manager(organization_id));
