begin;

create or replace function public.get_dashboard(
  p_organization_id uuid default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_dashboard jsonb;
begin

  -- =======================================================
  -- AUTHENTICATION
  -- =======================================================

  if auth.uid() is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  -- =======================================================
  -- RESOLVE TENANT
  --
  -- If the application supplies an organization ID,
  -- verify that the authenticated user belongs to it.
  --
  -- If no organization is supplied, use the first active
  -- organization membership for the authenticated user.
  -- =======================================================

  if p_organization_id is not null then

    if not public.is_org_member(p_organization_id) then
      raise exception 'Access denied to organization'
        using errcode = '42501';
    end if;

    v_org_id := p_organization_id;

  else

    select m.organization_id
    into v_org_id
    from public.organization_members m
    join public.organizations o
      on o.id = m.organization_id
    where m.user_id = auth.uid()
      and m.status = 'active'
      and o.status = 'active'
    order by
      case m.role
        when 'owner' then 1
        when 'admin' then 2
        when 'manager' then 3
        when 'sales' then 4
        when 'operations' then 5
        else 6
      end,
      m.created_at
    limit 1;

  end if;

  if v_org_id is null then
    raise exception 'No active CRM organization found'
      using errcode = '42501';
  end if;

  -- =======================================================
  -- BUILD DASHBOARD
  -- =======================================================

  with default_pipeline as (

    select
      p.id,
      p.organization_id,
      p.name
    from public.pipelines p
    where p.organization_id = v_org_id
      and p.is_default = true
      and p.is_active = true
    limit 1

  ),

  deal_rows as (

    select
      d.id as deal_id,
      d.organization_id,
      d.pipeline_id,
      d.stage_id,

      d.name as deal_name,
      d.description,

      d.request_type,
      d.procurement_volume,
      d.delivery_location,
      d.required_timeline,
      d.project_requirements,

      d.estimated_value,
      d.currency,
      d.expected_margin_pct,
      d.expected_close_date,

      d.verification_status,
      d.risk_level,

      d.source,
      d.external_source,
      d.external_id as request_id,

      d.owner_user_id,

      d.created_at,
      d.updated_at,

      c.id as company_id,
      c.name as company_name,
      c.domain as company_domain,
      c.phone as company_phone,
      c.industry as company_industry,

      ct.id as contact_id,
      ct.first_name,
      ct.last_name,

      concat_ws(
        ' ',
        ct.first_name,
        ct.last_name
      ) as contact_name,

      ct.email as contact_email,
      ct.phone as contact_phone,
      ct.job_title as contact_job_title,

      ps.name as stage_name,
      ps.position as stage_position,
      ps.probability as stage_probability,
      ps.stage_type

    from public.deals d

    join default_pipeline p
      on p.id = d.pipeline_id
     and p.organization_id = d.organization_id

    join public.pipeline_stages ps
      on ps.id = d.stage_id
     and ps.pipeline_id = d.pipeline_id
     and ps.organization_id = d.organization_id

    left join public.companies c
      on c.id = d.company_id
     and c.organization_id = d.organization_id

    left join public.contacts ct
      on ct.id = d.primary_contact_id
     and ct.organization_id = d.organization_id

    where d.organization_id = v_org_id

  ),

  kpis as (

    select

      count(*) filter (
        where stage_name = 'New Opportunity'
      ) as new_opportunities,

      coalesce(
        sum(estimated_value) filter (
          where stage_type = 'open'
        ),
        0
      ) as pipeline_value,

      count(*) filter (
        where stage_name = 'Quote Sent'
      ) as quotes_sent,

      count(*) filter (
        where stage_type = 'won'
      ) as deals_won

    from deal_rows

  ),

  stage_rollups as (

    select
      ps.id as stage_id,
      ps.name as stage_name,
      ps.position,
      ps.probability,
      ps.stage_type,

      count(dr.deal_id) as deal_count,

      coalesce(
        sum(dr.estimated_value),
        0
      ) as stage_value,

      coalesce(
        jsonb_agg(
          jsonb_build_object(

            'deal_id',
            dr.deal_id,

            'deal_name',
            dr.deal_name,

            'company_id',
            dr.company_id,

            'company_name',
            dr.company_name,

            'contact_id',
            dr.contact_id,

            'contact_name',
            dr.contact_name,

            'contact_email',
            dr.contact_email,

            'contact_phone',
            dr.contact_phone,

            'request_type',
            dr.request_type,

            'procurement_volume',
            dr.procurement_volume,

            'delivery_location',
            dr.delivery_location,

            'required_timeline',
            dr.required_timeline,

            'project_requirements',
            dr.project_requirements,

            'estimated_value',
            dr.estimated_value,

            'currency',
            dr.currency,

            'expected_margin_pct',
            dr.expected_margin_pct,

            'expected_close_date',
            dr.expected_close_date,

            'verification_status',
            dr.verification_status,

            'risk_level',
            dr.risk_level,

            'owner_user_id',
            dr.owner_user_id,

            'source',
            dr.source,

            'request_id',
            dr.request_id,

            'created_at',
            dr.created_at,

            'updated_at',
            dr.updated_at
          )

          order by dr.created_at desc
        )

        filter (
          where dr.deal_id is not null
        ),

        '[]'::jsonb
      ) as opportunities

    from public.pipeline_stages ps

    join default_pipeline p
      on p.id = ps.pipeline_id
     and p.organization_id = ps.organization_id

    left join deal_rows dr
      on dr.stage_id = ps.id

    where ps.organization_id = v_org_id
      and ps.is_active = true

    group by
      ps.id,
      ps.name,
      ps.position,
      ps.probability,
      ps.stage_type

  )

  select jsonb_build_object(

    'organization_id',
    v_org_id,

    'kpis',
    jsonb_build_object(

      'new_opportunities',
      k.new_opportunities,

      'pipeline_value',
      k.pipeline_value,

      'quotes_sent',
      k.quotes_sent,

      'deals_won',
      k.deals_won

    ),

    'pipeline',
    coalesce(

      (
        select jsonb_agg(

          jsonb_build_object(

            'stage_id',
            sr.stage_id,

            'stage_name',
            sr.stage_name,

            'position',
            sr.position,

            'probability',
            sr.probability,

            'stage_type',
            sr.stage_type,

            'deal_count',
            sr.deal_count,

            'stage_value',
            sr.stage_value,

            'opportunities',
            sr.opportunities

          )

          order by sr.position

        )

        from stage_rollups sr
      ),

      '[]'::jsonb

    )

  )
  into v_dashboard
  from kpis k;

  return v_dashboard;

end;
$$;

-- =========================================================
-- FUNCTION SECURITY
--
-- Public/anonymous visitors cannot access CRM dashboard data.
-- Only signed-in CRM users can execute this function.
-- Tenant membership is verified inside the function and
-- underlying RLS remains active because this is
-- SECURITY INVOKER.
-- =========================================================

revoke execute
on function public.get_dashboard(uuid)
from public, anon;

grant execute
on function public.get_dashboard(uuid)
to authenticated;

commit;
