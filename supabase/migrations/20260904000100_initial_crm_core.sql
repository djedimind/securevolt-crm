begin;

create extension if not exists pgcrypto;

-- =========================================================
-- SHARED FUNCTIONS
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- USER PROFILES
-- Supabase Auth remains the identity provider.
-- This table stores CRM-facing user information.
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- ORGANIZATIONS / TENANTS
-- Every SaaS customer receives an organization.
-- SecureVolt Solutions will be organization #1.
-- =========================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),

  name text not null
    check (char_length(btrim(name)) > 0),

  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),

  status text not null default 'active'
    check (status in ('active', 'suspended', 'closed')),

  created_by uuid
    default auth.uid()
    references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- ORGANIZATION MEMBERSHIPS
-- =========================================================

create table public.organization_members (
  organization_id uuid not null
    references public.organizations(id) on delete cascade,

  user_id uuid not null
    references auth.users(id) on delete cascade,

  role text not null default 'viewer'
    check (
      role in (
        'owner',
        'admin',
        'manager',
        'sales',
        'operations',
        'viewer'
      )
    ),

  status text not null default 'active'
    check (status in ('active', 'invited', 'disabled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (organization_id, user_id)
);

-- =========================================================
-- COMPANIES
-- =========================================================

create table public.companies (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id) on delete cascade,

  name text not null
    check (char_length(btrim(name)) > 0),

  domain text,
  website text,
  phone text,
  industry text,

  relationship_status text not null default 'prospect'
    check (
      relationship_status in (
        'prospect',
        'customer',
        'former_customer',
        'partner',
        'inactive'
      )
    ),

  source text,

  owner_user_id uuid
    references auth.users(id) on delete set null,

  external_source text,
  external_id text,

  created_by uuid
    default auth.uid()
    references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, organization_id)
);

-- =========================================================
-- CONTACTS
-- =========================================================

create table public.contacts (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id) on delete cascade,

  company_id uuid,

  first_name text,
  last_name text,
  email text,
  phone text,
  job_title text,

  status text not null default 'active'
    check (status in ('active', 'inactive')),

  source text,

  owner_user_id uuid
    references auth.users(id) on delete set null,

  external_source text,
  external_id text,

  created_by uuid
    default auth.uid()
    references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, organization_id),

  constraint contacts_company_tenant_fk
    foreign key (company_id, organization_id)
    references public.companies(id, organization_id)
    on delete restrict
);

-- =========================================================
-- PIPELINES
-- =========================================================

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id) on delete cascade,

  name text not null,

  is_default boolean not null default false,
  is_active boolean not null default true,

  created_by uuid
    default auth.uid()
    references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, organization_id),
  unique (organization_id, name)
);

create unique index pipelines_one_default_per_org_idx
  on public.pipelines (organization_id)
  where is_default = true;

-- =========================================================
-- PIPELINE STAGES
-- =========================================================

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,

  pipeline_id uuid not null,

  name text not null,

  position integer not null default 0
    check (position >= 0),

  probability numeric(5,2) not null default 0
    check (probability >= 0 and probability <= 100),

  stage_type text not null default 'open'
    check (stage_type in ('open', 'won', 'lost')),

  color text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, organization_id, pipeline_id),
  unique (pipeline_id, position),

  constraint pipeline_stages_pipeline_tenant_fk
    foreign key (pipeline_id, organization_id)
    references public.pipelines(id, organization_id)
    on delete cascade
);

-- =========================================================
-- DEALS / OPPORTUNITIES
-- =========================================================

create table public.deals (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id) on delete cascade,

  company_id uuid,
  primary_contact_id uuid,

  pipeline_id uuid not null,
  stage_id uuid not null,

  name text not null,
  description text,

  owner_user_id uuid
    references auth.users(id) on delete set null,

  request_type text,

  procurement_volume integer
    check (
      procurement_volume is null
      or procurement_volume >= 0
    ),

  delivery_location text,
  required_timeline text,
  project_requirements text,

  estimated_value numeric(14,2)
    check (
      estimated_value is null
      or estimated_value >= 0
    ),

  currency char(3) not null default 'USD',

  expected_margin_pct numeric(5,2)
    check (
      expected_margin_pct is null
      or (
        expected_margin_pct >= 0
        and expected_margin_pct <= 100
      )
    ),

  expected_close_date date,

  source text,

  verification_status text not null default 'pending'
    check (
      verification_status in (
        'pending',
        'in_review',
        'verified',
        'failed',
        'not_required'
      )
    ),

  risk_level text not null default 'unrated'
    check (
      risk_level in (
        'unrated',
        'low',
        'medium',
        'high',
        'critical'
      )
    ),

  closed_at timestamptz,
  closed_lost_reason text,

  external_source text,
  external_id text,

  created_by uuid
    default auth.uid()
    references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, organization_id),

  constraint deals_company_tenant_fk
    foreign key (company_id, organization_id)
    references public.companies(id, organization_id)
    on delete restrict,

  constraint deals_contact_tenant_fk
    foreign key (primary_contact_id, organization_id)
    references public.contacts(id, organization_id)
    on delete restrict,

  constraint deals_pipeline_tenant_fk
    foreign key (pipeline_id, organization_id)
    references public.pipelines(id, organization_id)
    on delete restrict,

  constraint deals_stage_tenant_fk
    foreign key (
      stage_id,
      organization_id,
      pipeline_id
    )
    references public.pipeline_stages(
      id,
      organization_id,
      pipeline_id
    )
    on delete restrict
);

-- =========================================================
-- ACTIVITIES
-- =========================================================

create table public.activities (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id) on delete cascade,

  deal_id uuid,
  company_id uuid,
  contact_id uuid,

  activity_type text not null
    check (
      activity_type in (
        'note',
        'email',
        'call',
        'meeting',
        'stage_change',
        'system'
      )
    ),

  direction text
    check (
      direction is null
      or direction in ('inbound', 'outbound', 'internal')
    ),

  subject text,
  body text,

  occurred_at timestamptz not null default now(),

  created_by uuid
    default auth.uid()
    references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint activities_deal_tenant_fk
    foreign key (deal_id, organization_id)
    references public.deals(id, organization_id)
    on delete cascade,

  constraint activities_company_tenant_fk
    foreign key (company_id, organization_id)
    references public.companies(id, organization_id)
    on delete restrict,

  constraint activities_contact_tenant_fk
    foreign key (contact_id, organization_id)
    references public.contacts(id, organization_id)
    on delete restrict
);

-- =========================================================
-- TASKS
-- =========================================================

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id) on delete cascade,

  deal_id uuid,
  company_id uuid,
  contact_id uuid,

  title text not null,
  description text,

  status text not null default 'open'
    check (
      status in (
        'open',
        'in_progress',
        'completed',
        'canceled'
      )
    ),

  priority text not null default 'normal'
    check (
      priority in (
        'low',
        'normal',
        'high',
        'urgent'
      )
    ),

  assigned_to uuid
    references auth.users(id) on delete set null,

  due_at timestamptz,
  completed_at timestamptz,

  created_by uuid
    default auth.uid()
    references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tasks_deal_tenant_fk
    foreign key (deal_id, organization_id)
    references public.deals(id, organization_id)
    on delete cascade,

  constraint tasks_company_tenant_fk
    foreign key (company_id, organization_id)
    references public.companies(id, organization_id)
    on delete restrict,

  constraint tasks_contact_tenant_fk
    foreign key (contact_id, organization_id)
    references public.contacts(id, organization_id)
    on delete restrict
);

-- =========================================================
-- INDEXES
-- =========================================================

create index organization_members_user_idx
  on public.organization_members(user_id);

create index companies_org_idx
  on public.companies(organization_id);

create index contacts_org_idx
  on public.contacts(organization_id);

create index contacts_company_idx
  on public.contacts(company_id);

create unique index contacts_org_email_uidx
  on public.contacts(
    organization_id,
    lower(email)
  )
  where email is not null
    and btrim(email) <> '';

create unique index companies_org_domain_uidx
  on public.companies(
    organization_id,
    lower(domain)
  )
  where domain is not null
    and btrim(domain) <> '';

create index pipeline_stages_pipeline_idx
  on public.pipeline_stages(pipeline_id, position);

create index deals_org_idx
  on public.deals(organization_id);

create index deals_stage_idx
  on public.deals(stage_id);

create index deals_company_idx
  on public.deals(company_id);

create index deals_owner_idx
  on public.deals(owner_user_id);

create index activities_org_occurred_idx
  on public.activities(organization_id, occurred_at desc);

create index activities_deal_idx
  on public.activities(deal_id);

create index tasks_org_status_due_idx
  on public.tasks(organization_id, status, due_at);

create index tasks_assigned_to_idx
  on public.tasks(assigned_to);

create unique index companies_external_id_uidx
  on public.companies(
    organization_id,
    external_source,
    external_id
  )
  where external_id is not null;

create unique index contacts_external_id_uidx
  on public.contacts(
    organization_id,
    external_source,
    external_id
  )
  where external_id is not null;

create unique index deals_external_id_uidx
  on public.deals(
    organization_id,
    external_source,
    external_id
  )
  where external_id is not null;

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row execute function public.set_updated_at();

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger pipelines_set_updated_at
before update on public.pipelines
for each row execute function public.set_updated_at();

create trigger pipeline_stages_set_updated_at
before update on public.pipeline_stages
for each row execute function public.set_updated_at();

create trigger deals_set_updated_at
before update on public.deals
for each row execute function public.set_updated_at();

create trigger activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- =========================================================
-- AUTOMATIC PROFILE CREATION
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    display_name
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================================================
-- TENANT SECURITY HELPERS
-- =========================================================

create or replace function public.is_org_member(
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_org_role(
  p_organization_id uuid,
  p_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = any(p_roles)
  );
$$;

revoke all on function public.is_org_member(uuid)
from public;

revoke all on function public.has_org_role(uuid, text[])
from public;

grant execute on function public.is_org_member(uuid)
to authenticated;

grant execute on function public.has_org_role(uuid, text[])
to authenticated;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;

-- Profiles

create policy profiles_select_self
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Organizations

create policy organizations_select_member
on public.organizations
for select
to authenticated
using (
  public.is_org_member(id)
  or created_by = auth.uid()
);

create policy organizations_insert_self
on public.organizations
for insert
to authenticated
with check (
  created_by = auth.uid()
);

create policy organizations_update_admin
on public.organizations
for update
to authenticated
using (
  public.has_org_role(
    id,
    array['owner','admin']
  )
)
with check (
  public.has_org_role(
    id,
    array['owner','admin']
  )
);

create policy organizations_delete_owner
on public.organizations
for delete
to authenticated
using (
  public.has_org_role(
    id,
    array['owner']
  )
);

-- Organization memberships

create policy organization_members_select
on public.organization_members
for select
to authenticated
using (
  public.is_org_member(organization_id)
);

create policy organization_members_insert
on public.organization_members
for insert
to authenticated
with check (
  (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.created_by = auth.uid()
    )
  )
  or public.has_org_role(
    organization_id,
    array['owner','admin']
  )
);

create policy organization_members_update
on public.organization_members
for update
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner','admin']
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner','admin']
  )
);

create policy organization_members_delete
on public.organization_members
for delete
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner','admin']
  )
);

-- Standard tenant policies

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'companies',
    'contacts',
    'pipelines',
    'pipeline_stages',
    'deals',
    'activities',
    'tasks'
  ]
  loop

    execute format(
      'create policy %I
       on public.%I
       for select
       to authenticated
       using (public.is_org_member(organization_id))',
      table_name || '_select',
      table_name
    );

    execute format(
      'create policy %I
       on public.%I
       for insert
       to authenticated
       with check (
         public.has_org_role(
           organization_id,
           array[''owner'',''admin'',''manager'',''sales'',''operations'']
         )
       )',
      table_name || '_insert',
      table_name
    );

    execute format(
      'create policy %I
       on public.%I
       for update
       to authenticated
       using (
         public.has_org_role(
           organization_id,
           array[''owner'',''admin'',''manager'',''sales'',''operations'']
         )
       )
       with check (
         public.has_org_role(
           organization_id,
           array[''owner'',''admin'',''manager'',''sales'',''operations'']
         )
       )',
      table_name || '_update',
      table_name
    );

    execute format(
      'create policy %I
       on public.%I
       for delete
       to authenticated
       using (
         public.has_org_role(
           organization_id,
           array[''owner'',''admin'']
         )
       )',
      table_name || '_delete',
      table_name
    );

  end loop;
end $$;

-- =========================================================
-- DATA API PRIVILEGES
-- Anonymous users receive NO CRM table access.
-- Authenticated users receive privileges, with RLS enforcing
-- what records each user can actually access.
-- =========================================================

grant usage on schema public to authenticated;

grant select, update
on public.profiles
to authenticated;

grant select, insert, update, delete
on public.organizations,
   public.organization_members,
   public.companies,
   public.contacts,
   public.pipelines,
   public.pipeline_stages,
   public.deals,
   public.activities,
   public.tasks
to authenticated;

revoke all
on public.profiles,
   public.organizations,
   public.organization_members,
   public.companies,
   public.contacts,
   public.pipelines,
   public.pipeline_stages,
   public.deals,
   public.activities,
   public.tasks
from anon;

commit;
