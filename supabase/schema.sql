-- Hall Booking production starter schema for Supabase
-- Safe-ish rerun version for Supabase SQL Editor

create extension if not exists pgcrypto;

-- TABLES

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  allow_multiple_events_per_day boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  role text not null check (role in ('user','admin','super_admin')) default 'user',
  can_create_suggestion boolean not null default true,
  can_view_financials boolean not null default false,
  can_view_activity_feed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.halls (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  hall_id uuid not null references public.halls(id) on delete restrict,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  event_type text not null,
  client_name text,
  client_phone text,
  guest_count int default 0,
  price numeric(12,2) default 0,
  deposit numeric(12,2) default 0,
  paid numeric(12,2) default 0,
  note text,
  status text not null check (
    status in (
      'upit',
      'čeka potvrdu',
      'rezervisano',
      'potvrđeno depozitom',
      'potpuno plaćeno',
      'realizovano',
      'otkazano'
    )
  ) default 'čeka potvrdu',
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservation_time_check check (end_time > start_time),
  constraint reservation_money_check check (price >= 0 and deposit >= 0 and paid >= 0)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- INDEXES

create index if not exists reservations_event_date_idx
  on public.reservations(event_date);

create index if not exists reservations_hall_date_idx
  on public.reservations(hall_id, event_date);

create index if not exists audit_log_created_at_idx
  on public.audit_log(created_at desc);

-- FUNCTIONS

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'super_admin'
  );
$$;

create or replace function public.can_view_financials()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role in ('admin', 'super_admin')
        or p.can_view_financials
      )
  );
$$;

create or replace function public.can_view_activity_feed()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'super_admin'
        or p.can_view_activity_feed
      )
  );
$$;

create or replace function public.can_create_suggestion()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role in ('admin', 'super_admin')
        or p.can_create_suggestion
      )
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log(actor_id, entity_type, entity_id, action, details)
    values (
      auth.uid(),
      tg_table_name,
      new.id,
      'insert',
      jsonb_build_object('new', to_jsonb(new))
    );
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log(actor_id, entity_type, entity_id, action, details)
    values (
      auth.uid(),
      tg_table_name,
      new.id,
      'update',
      jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_log(actor_id, entity_type, entity_id, action, details)
    values (
      auth.uid(),
      tg_table_name,
      old.id,
      'delete',
      jsonb_build_object('old', to_jsonb(old))
    );
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.block_conflicting_reservations()
returns trigger
language plpgsql
as $$
declare
  allow_multi boolean;
  conflict_exists boolean;
begin
  select allow_multiple_events_per_day
  into allow_multi
  from public.app_settings
  limit 1;

  if allow_multi is null then
    allow_multi := false;
  end if;

  if allow_multi then
    select exists (
      select 1
      from public.reservations r
      where r.id <> coalesce(new.id, gen_random_uuid())
        and r.hall_id = new.hall_id
        and r.event_date = new.event_date
        and r.status <> 'otkazano'
        and not (
          r.end_time <= new.start_time
          or new.end_time <= r.start_time
        )
    )
    into conflict_exists;
  else
    select exists (
      select 1
      from public.reservations r
      where r.id <> coalesce(new.id, gen_random_uuid())
        and r.hall_id = new.hall_id
        and r.event_date = new.event_date
        and r.status <> 'otkazano'
    )
    into conflict_exists;
  end if;

  if conflict_exists then
    raise exception 'Rezervacija već postoji za izabranu salu i termin';
  end if;

  return new;
end;
$$;

-- TRIGGERS

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists reservations_updated_at on public.reservations;
create trigger reservations_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();

drop trigger if exists reservations_conflict_guard on public.reservations;
create trigger reservations_conflict_guard
before insert or update on public.reservations
for each row
execute function public.block_conflicting_reservations();

drop trigger if exists reservations_audit on public.reservations;
create trigger reservations_audit
after insert or update or delete on public.reservations
for each row
execute function public.write_audit_log();

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit
after insert or update or delete on public.profiles
for each row
execute function public.write_audit_log();

-- RLS

alter table public.app_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.halls enable row level security;
alter table public.reservations enable row level security;
alter table public.audit_log enable row level security;

-- app_settings policies

drop policy if exists "settings readable by authenticated" on public.app_settings;
create policy "settings readable by authenticated"
on public.app_settings
for select
to authenticated
using (true);

drop policy if exists "settings writable by super admin" on public.app_settings;
create policy "settings writable by super admin"
on public.app_settings
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- profiles policies

drop policy if exists "profiles self or admin read" on public.profiles;
create policy "profiles self or admin read"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

drop policy if exists "profiles self update limited" on public.profiles;
create policy "profiles self update limited"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles admin manage" on public.profiles;
create policy "profiles admin manage"
on public.profiles
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- halls policies

drop policy if exists "halls read all authenticated" on public.halls;
create policy "halls read all authenticated"
on public.halls
for select
to authenticated
using (true);

drop policy if exists "halls super admin manage" on public.halls;
create policy "halls super admin manage"
on public.halls
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- reservations policies

drop policy if exists "reservations read all authenticated" on public.reservations;
create policy "reservations read all authenticated"
on public.reservations
for select
to authenticated
using (true);

drop policy if exists "reservations suggestions insert" on public.reservations;
create policy "reservations suggestions insert"
on public.reservations
for insert
to authenticated
with check (
  public.can_create_suggestion()
  and (
    public.is_admin()
    or (
      coalesce(price, 0) = 0
      and coalesce(deposit, 0) = 0
      and coalesce(paid, 0) = 0
      and status in ('upit', 'čeka potvrdu')
    )
  )
);

drop policy if exists "reservations admin update" on public.reservations;
create policy "reservations admin update"
on public.reservations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "reservations admin delete" on public.reservations;
create policy "reservations admin delete"
on public.reservations
for delete
to authenticated
using (public.is_admin());

-- audit log policies

drop policy if exists "audit only super admin or allowed viewers" on public.audit_log;
create policy "audit only super admin or allowed viewers"
on public.audit_log
for select
to authenticated
using (public.can_view_activity_feed());

-- SEED DEFAULTS

insert into public.app_settings (allow_multiple_events_per_day)
select false
where not exists (
  select 1 from public.app_settings
);

insert into public.halls (name, sort_order)
values
  ('VIP', 1),
  ('Restoran', 2),
  ('Master sala', 3)
on conflict (name) do nothing;