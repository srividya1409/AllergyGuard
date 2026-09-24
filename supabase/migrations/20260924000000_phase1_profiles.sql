-- Phase 1: profiles, allergens, emergency contacts, medications.
--
-- Allergy data belongs to a profile (a person), not directly to an auth user.
-- Each profile has an owner_id, so one account can later manage several
-- profiles (family / caregiver use case). Child tables reference profiles.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Predefined allergen list from docs/PLAN.md, Phase 1.
create type public.allergen_code as enum (
  'milk',
  'egg',
  'peanut',
  'tree_nuts',
  'soy',
  'wheat_gluten',
  'fish',
  'shellfish',
  'sesame',
  'mustard'
);

create type public.allergen_severity as enum ('mild', 'moderate', 'severe');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_owner_id_idx on public.profiles (owner_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profile_allergens
-- A row is EITHER a predefined allergen OR a custom free-text allergen.
-- ---------------------------------------------------------------------------

create table public.profile_allergens (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  allergen     public.allergen_code,
  custom_name  text check (char_length(btrim(custom_name)) between 1 and 100),
  severity     public.allergen_severity,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint profile_allergens_one_kind check (
    (allergen is not null and custom_name is null)
    or (allergen is null and custom_name is not null)
  )
);

create index profile_allergens_profile_id_idx on public.profile_allergens (profile_id);

create trigger profile_allergens_set_updated_at
  before update on public.profile_allergens
  for each row execute function public.set_updated_at();

-- No duplicate allergens per profile (custom names compared case-insensitively).
create unique index profile_allergens_unique_predefined
  on public.profile_allergens (profile_id, allergen)
  where allergen is not null;

create unique index profile_allergens_unique_custom
  on public.profile_allergens (profile_id, lower(btrim(custom_name)))
  where custom_name is not null;

-- ---------------------------------------------------------------------------
-- emergency_contacts
-- ---------------------------------------------------------------------------

create table public.emergency_contacts (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  name         text not null check (char_length(btrim(name)) between 1 and 100),
  -- Optional leading +, then digits, spaces, hyphens, dots or parentheses,
  -- with 7-15 actual digits (E.164 max is 15). Accepts "+91 98765 43210",
  -- "9876543210", "044-2345-6789".
  phone        text not null
               constraint emergency_contacts_phone_format check (
                 phone ~ '^\+?[0-9(][0-9 ().-]*[0-9]$'
                 and char_length(regexp_replace(phone, '[^0-9]', '', 'g')) between 7 and 15
               ),
  relationship text check (char_length(relationship) <= 50),
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index emergency_contacts_profile_id_idx on public.emergency_contacts (profile_id);

-- At most one primary contact per profile.
create unique index emergency_contacts_one_primary
  on public.emergency_contacts (profile_id)
  where is_primary;

create trigger emergency_contacts_set_updated_at
  before update on public.emergency_contacts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- medications
-- expiry_date is nullable (user may not have the pack to hand during
-- onboarding); Phase 7 reminders only fire for rows that have one.
-- ---------------------------------------------------------------------------

create table public.medications (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 100),
  dose        text check (char_length(dose) <= 100),
  expiry_date date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index medications_profile_id_idx on public.medications (profile_id);
create index medications_expiry_date_idx on public.medications (expiry_date)
  where expiry_date is not null;

create trigger medications_set_updated_at
  before update on public.medications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Users can only touch profiles they own, and child rows of those profiles.
-- (select auth.uid()) is wrapped so Postgres evaluates it once per query.
-- ---------------------------------------------------------------------------

alter table public.profiles           enable row level security;
alter table public.profile_allergens  enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.medications        enable row level security;

-- profiles ------------------------------------------------------------------

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "profiles_delete_own" on public.profiles
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Child tables --------------------------------------------------------------
-- The ownership check goes through profiles. Because profiles itself has RLS,
-- the subquery can only ever see the caller's own profiles.

create policy "profile_allergens_select_own" on public.profile_allergens
  for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "profile_allergens_insert_own" on public.profile_allergens
  for insert to authenticated
  with check (exists (select 1 from public.profiles p
                      where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "profile_allergens_update_own" on public.profile_allergens
  for update to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.profiles p
                      where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "profile_allergens_delete_own" on public.profile_allergens
  for delete to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "emergency_contacts_select_own" on public.emergency_contacts
  for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "emergency_contacts_insert_own" on public.emergency_contacts
  for insert to authenticated
  with check (exists (select 1 from public.profiles p
                      where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "emergency_contacts_update_own" on public.emergency_contacts
  for update to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.profiles p
                      where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "emergency_contacts_delete_own" on public.emergency_contacts
  for delete to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "medications_select_own" on public.medications
  for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "medications_insert_own" on public.medications
  for insert to authenticated
  with check (exists (select 1 from public.profiles p
                      where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "medications_update_own" on public.medications
  for update to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.profiles p
                      where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "medications_delete_own" on public.medications
  for delete to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.owner_id = (select auth.uid())));
