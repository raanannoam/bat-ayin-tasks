-- Invitation email delivery: tracking columns + manager-gated RPCs for the Edge Function.
-- Run after org-admin.sql.

alter table bat_ayin.organization_invitations
  add column if not exists email_status text not null default 'unsent'
    check (email_status in ('unsent', 'sent', 'failed')),
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_error text;

-- Returns the invitation's send-relevant fields, but only to a manager of its organization.
-- Called by the Edge Function using the inviting manager's own JWT (anon key + forwarded
-- Authorization header) — this is the sole authorization gate before an email is sent.
create or replace function bat_ayin.get_invitation_for_email(p_invitation_id uuid)
returns table (
  id uuid,
  organization_id uuid,
  email text,
  role text,
  status text
)
language plpgsql
stable
security definer
set search_path = bat_ayin, public
as $$
declare
  v_invitation bat_ayin.organization_invitations%rowtype;
begin
  select * into v_invitation
  from bat_ayin.organization_invitations
  where id = p_invitation_id;

  -- Missing row and "not your organization" must be indistinguishable to the caller —
  -- otherwise a non-manager could probe invitation ids for existence.
  if v_invitation.id is null or not bat_ayin.is_org_manager(v_invitation.organization_id) then
    raise exception 'permission denied for organization invitation email'
      using errcode = '42501';
  end if;

  return query
  select
    v_invitation.id,
    v_invitation.organization_id,
    v_invitation.email,
    v_invitation.role,
    v_invitation.status;
end;
$$;

-- Records the outcome of a send attempt. Re-checks manager permission independently of
-- get_invitation_for_email, since this call is what actually mutates the row.
create or replace function bat_ayin.mark_invitation_email_result(
  p_invitation_id uuid,
  p_status text,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = bat_ayin, public
as $$
declare
  v_organization_id uuid;
begin
  if p_status not in ('sent', 'failed') then
    raise exception 'invalid invitation email status %', p_status;
  end if;

  select organization_id into v_organization_id
  from bat_ayin.organization_invitations
  where id = p_invitation_id;

  -- Same rationale as get_invitation_for_email: one error for both "missing" and "not yours".
  if v_organization_id is null or not bat_ayin.is_org_manager(v_organization_id) then
    raise exception 'permission denied for organization invitation email update'
      using errcode = '42501';
  end if;

  update bat_ayin.organization_invitations
  set
    email_status = p_status,
    email_error = p_error,
    email_sent_at = case when p_status = 'sent' then now() else email_sent_at end,
    updated_at = now()
  where id = p_invitation_id;
end;
$$;

revoke all on function bat_ayin.get_invitation_for_email(uuid) from public;
grant execute on function bat_ayin.get_invitation_for_email(uuid) to authenticated;

revoke all on function bat_ayin.mark_invitation_email_result(uuid, text, text) from public;
grant execute on function bat_ayin.mark_invitation_email_result(uuid, text, text) to authenticated;
