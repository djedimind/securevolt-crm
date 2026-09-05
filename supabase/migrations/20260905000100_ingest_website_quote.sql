begin;

create or replace function public.ingest_website_quote(
  p_request_id text,
  p_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_request_type text,
  p_quantity text,
  p_delivery_location text,
  p_timeline text,
  p_requirements text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_owner_id uuid;
  v_pipeline_id uuid;
  v_stage_id uuid;

  v_company_id uuid;
  v_contact_id uuid;
  v_deal_id uuid;

  v_first_name text;
  v_last_name text;
  v_quantity integer;
begin

  -- -------------------------------------------------------
  -- Validate required values
  -- -------------------------------------------------------

  if nullif(btrim(p_request_id), '') is null then
    raise exception 'Request ID is required';
  end if;

  if nullif(btrim(p_name), '') is null then
    raise exception 'Name is required';
  end if;

  if nullif(btrim(p_company), '') is null then
    raise exception 'Company is required';
  end if;

  if nullif(btrim(p_email), '') is null then
    raise exception 'Email is required';
  end if;

  if nullif(btrim(p_request_type), '') is null then
    raise exception 'Request type is required';
  end if;

  if nullif(btrim(p_requirements), '') is null then
    raise exception 'Project requirements are required';
  end if;

  -- -------------------------------------------------------
  -- Resolve SecureVolt tenant
  -- -------------------------------------------------------

  select o.id
  into v_org_id
  from public.organizations o
  where o.slug = 'securevolt-solutions'
    and o.status = 'active'
  limit 1;

  if v_org_id is null then
    raise exception 'SecureVolt organization not found';
  end if;

  -- -------------------------------------------------------
  -- Request idempotency
  -- If the same request ID is submitted twice, return the
  -- existing deal instead of creating another opportunity.
  -- -------------------------------------------------------

  select
    d.id,
    d.company_id,
    d.primary_contact_id
  into
    v_deal_id,
    v_company_id,
    v_contact_id
  from public.deals d
  where d.organization_id = v_org_id
    and d.external_source = 'securevolt_website'
    and d.external_id = p_request_id
  limit 1;

  if v_deal_id is not null then
    return jsonb_build_object(
      'organization_id', v_org_id,
      'company_id', v_company_id,
      'contact_id', v_contact_id,
      'deal_id', v_deal_id,
      'duplicate', true
    );
  end if;

  -- -------------------------------------------------------
  -- Resolve SecureVolt owner
  -- -------------------------------------------------------

  select m.user_id
  into v_owner_id
  from public.organization_members m
  where m.organization_id = v_org_id
    and m.role = 'owner'
    and m.status = 'active'
  order by m.created_at
  limit 1;

  if v_owner_id is null then
    raise exception 'SecureVolt owner not found';
  end if;

  -- -------------------------------------------------------
  -- Resolve default pipeline and New Opportunity stage
  -- -------------------------------------------------------

  select p.id
  into v_pipeline_id
  from public.pipelines p
  where p.organization_id = v_org_id
    and p.is_default = true
    and p.is_active = true
  limit 1;

  if v_pipeline_id is null then
    raise exception 'Default SecureVolt sales pipeline not found';
  end if;

  select ps.id
  into v_stage_id
  from public.pipeline_stages ps
  where ps.organization_id = v_org_id
    and ps.pipeline_id = v_pipeline_id
    and ps.position = 1
    and ps.stage_type = 'open'
    and ps.is_active = true
  limit 1;

  if v_stage_id is null then
    raise exception 'New Opportunity stage not found';
  end if;

  -- -------------------------------------------------------
  -- Normalize contact name
  -- -------------------------------------------------------

  v_first_name := split_part(btrim(p_name), ' ', 1);

  v_last_name :=
    nullif(
      btrim(
        regexp_replace(
          btrim(p_name),
          '^\S+\s*',
          ''
        )
      ),
      ''
    );

  -- Only store procurement volume as an integer when the
  -- submitted field is actually numeric.
  v_quantity := null;

  if nullif(btrim(coalesce(p_quantity, '')), '') is not null
     and btrim(p_quantity) ~ '^[0-9]+$'
  then
    begin
      v_quantity := btrim(p_quantity)::integer;
    exception
      when others then
        v_quantity := null;
    end;
  end if;

  -- -------------------------------------------------------
  -- Company
  -- Reuse an existing company with the same normalized name.
  -- -------------------------------------------------------

  select c.id
  into v_company_id
  from public.companies c
  where c.organization_id = v_org_id
    and lower(btrim(c.name)) = lower(btrim(p_company))
  order by c.created_at
  limit 1;

  if v_company_id is null then

    insert into public.companies (
      organization_id,
      name,
      relationship_status,
      source,
      owner_user_id,
      created_by
    )
    values (
      v_org_id,
      btrim(p_company),
      'prospect',
      'securevolt_website',
      v_owner_id,
      v_owner_id
    )
    returning id into v_company_id;

  end if;

  -- -------------------------------------------------------
  -- Contact
  -- -------------------------------------------------------

  select c.id
  into v_contact_id
  from public.contacts c
  where c.organization_id = v_org_id
    and lower(btrim(c.email)) = lower(btrim(p_email))
  limit 1;

  if v_contact_id is null then

    insert into public.contacts (
      organization_id,
      company_id,
      first_name,
      last_name,
      email,
      phone,
      status,
      source,
      owner_user_id,
      created_by
    )
    values (
      v_org_id,
      v_company_id,
      v_first_name,
      v_last_name,
      btrim(p_email),
      nullif(btrim(coalesce(p_phone, '')), ''),
      'active',
      'securevolt_website',
      v_owner_id,
      v_owner_id
    )
    returning id into v_contact_id;

  else

    update public.contacts
    set
      company_id = v_company_id,
      first_name = v_first_name,
      last_name = v_last_name,
      phone = coalesce(
        nullif(btrim(coalesce(p_phone, '')), ''),
        phone
      ),
      owner_user_id = coalesce(owner_user_id, v_owner_id)
    where id = v_contact_id;

  end if;

  -- -------------------------------------------------------
  -- Deal / Opportunity
  -- -------------------------------------------------------

  insert into public.deals (
    organization_id,
    company_id,
    primary_contact_id,
    pipeline_id,
    stage_id,

    name,
    description,

    owner_user_id,

    request_type,
    procurement_volume,
    delivery_location,
    required_timeline,
    project_requirements,

    source,

    verification_status,
    risk_level,

    external_source,
    external_id,

    created_by
  )
  values (
    v_org_id,
    v_company_id,
    v_contact_id,
    v_pipeline_id,
    v_stage_id,

    btrim(p_company) || ' — ' || btrim(p_request_type),
    'Commercial quote request submitted through securevoltsolutions.com',

    v_owner_id,

    btrim(p_request_type),
    v_quantity,
    nullif(btrim(coalesce(p_delivery_location, '')), ''),
    nullif(btrim(coalesce(p_timeline, '')), ''),
    btrim(p_requirements),

    'securevolt_website',

    'pending',
    'unrated',

    'securevolt_website',
    p_request_id,

    v_owner_id
  )
  returning id into v_deal_id;

  return jsonb_build_object(
    'organization_id', v_org_id,
    'company_id', v_company_id,
    'contact_id', v_contact_id,
    'deal_id', v_deal_id,
    'duplicate', false
  );

end;
$$;

-- Website ingestion is privileged server functionality.
-- It must not be callable by browser/public CRM users.

revoke execute
on function public.ingest_website_quote(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from public, anon, authenticated;

grant execute
on function public.ingest_website_quote(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to service_role;

commit;
