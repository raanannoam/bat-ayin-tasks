create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text unique not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('manager', 'user')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  primary key (organization_id, user_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  icon text not null default 'office',
  is_active boolean not null default true,
  sort_order integer,
  created_at timestamptz not null default now(),

  unique (organization_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  assignee_id uuid not null references public.profiles(id),
  created_by uuid references public.profiles(id),

  title text not null,
  notes text not null default '',
  status text not null check (status in ('progress', 'done')),
  priority text not null check (priority in ('normal', 'high')),
  due_date date,

  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.task_updates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  dark_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id);

create index if not exists categories_organization_id_idx
  on public.categories (organization_id);

create index if not exists tasks_organization_id_idx
  on public.tasks (organization_id);

create index if not exists tasks_assignee_id_idx
  on public.tasks (assignee_id);

create index if not exists tasks_category_id_idx
  on public.tasks (category_id);

create index if not exists tasks_due_date_idx
  on public.tasks (due_date);

create index if not exists task_updates_task_id_idx
  on public.task_updates (task_id);

create index if not exists task_updates_organization_id_idx
  on public.task_updates (organization_id);

