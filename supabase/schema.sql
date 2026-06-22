create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text unique not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('manager', 'user')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (organization_id, user_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  icon text not null default 'office',
  color text,
  is_active boolean not null default true,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,

  unique (organization_id, slug),
  unique (organization_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  assignee_id uuid not null references public.profiles(id) on delete restrict,
  created_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,

  title text not null,
  notes text not null default '',
  status text not null default 'progress' check (status in ('progress', 'done')),
  priority text not null default 'normal' check (priority in ('normal', 'high')),
  due_date date,
  due_label text,
  reminder jsonb not null default '{"enabled": false}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  deleted_at timestamptz,

  check (
    (status = 'done' and completed_at is not null)
    or (status <> 'done')
  )
);

create table if not exists public.task_updates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  notify_participants boolean not null default false,
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,

  unique (organization_id, name)
);

create table if not exists public.supplier_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,

  supplier_name text not null,
  description text not null,
  amount_text text not null default '',
  due_date date,
  notes text not null default '',
  document_notes text not null default '',

  all_assignees boolean not null default false,
  assignee_ids uuid[] not null default '{}'::uuid[],

  order_completed boolean not null default false,
  order_completed_at date,
  received_completed boolean not null default false,
  received_completed_at date,
  payment_completed boolean not null default false,
  payment_completed_at date,
  invoice_completed boolean not null default false,
  invoice_completed_at date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  check (all_assignees = true or cardinality(assignee_ids) > 0)
);

create table if not exists public.supplier_order_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_order_id uuid not null references public.supplier_orders(id) on delete cascade,
  url text,
  label text,
  link_type text not null default 'link'
    check (link_type in ('link', 'attachment_placeholder')),
  attachment_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,

  check (url is not null or attachment_path is not null or label is not null)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  dark_mode boolean not null default false,
  text_size text not null default 'regular',
  updated_at timestamptz not null default now()
);

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id);

create index if not exists categories_organization_id_idx
  on public.categories (organization_id);

create index if not exists categories_organization_slug_idx
  on public.categories (organization_id, slug)
  where deleted_at is null;

create index if not exists categories_active_idx
  on public.categories (organization_id, is_active)
  where deleted_at is null;

create index if not exists tasks_organization_id_idx
  on public.tasks (organization_id);

create index if not exists tasks_assignee_id_idx
  on public.tasks (assignee_id);

create index if not exists tasks_category_id_idx
  on public.tasks (category_id);

create index if not exists tasks_due_date_idx
  on public.tasks (due_date);

create index if not exists tasks_priority_due_date_idx
  on public.tasks (organization_id, priority, due_date)
  where deleted_at is null and status <> 'done';

create index if not exists tasks_completed_archive_idx
  on public.tasks (organization_id, completed_at)
  where deleted_at is null and status = 'done';

create index if not exists tasks_deleted_at_idx
  on public.tasks (organization_id, deleted_at)
  where deleted_at is not null;

create index if not exists task_updates_task_id_idx
  on public.task_updates (task_id);

create index if not exists task_updates_organization_id_idx
  on public.task_updates (organization_id);

create index if not exists suppliers_organization_id_idx
  on public.suppliers (organization_id);

create index if not exists suppliers_active_idx
  on public.suppliers (organization_id, name)
  where deleted_at is null;

create index if not exists supplier_orders_organization_id_idx
  on public.supplier_orders (organization_id);

create index if not exists supplier_orders_supplier_id_idx
  on public.supplier_orders (supplier_id);

create index if not exists supplier_orders_due_date_idx
  on public.supplier_orders (due_date);

create index if not exists supplier_orders_assignee_ids_idx
  on public.supplier_orders using gin (assignee_ids);

create index if not exists supplier_orders_open_idx
  on public.supplier_orders (organization_id, due_date)
  where deleted_at is null and (
    order_completed = false
    or received_completed = false
    or payment_completed = false
    or invoice_completed = false
  );

create index if not exists supplier_order_links_order_id_idx
  on public.supplier_order_links (supplier_order_id);

create index if not exists supplier_order_links_organization_id_idx
  on public.supplier_order_links (organization_id);
