begin;

do $$
declare
  v_org_id uuid;
  v_pipeline_id uuid;
begin

  select id
  into v_org_id
  from public.organizations
  where slug = 'securevolt-solutions'
  limit 1;

  if v_org_id is null then
    raise exception 'SecureVolt organization not found';
  end if;

  insert into public.pipelines (
    organization_id,
    name,
    is_default,
    is_active
  )
  values (
    v_org_id,
    'Sales Pipeline',
    true,
    true
  )
  on conflict (organization_id, name)
  do update set
    is_default = true,
    is_active = true
  returning id into v_pipeline_id;

  insert into public.pipeline_stages (
    organization_id,
    pipeline_id,
    name,
    position,
    probability,
    stage_type,
    is_active
  )
  values
    (
      v_org_id,
      v_pipeline_id,
      'New Opportunity',
      1,
      10,
      'open',
      true
    ),
    (
      v_org_id,
      v_pipeline_id,
      'Verification / Qualification',
      2,
      20,
      'open',
      true
    ),
    (
      v_org_id,
      v_pipeline_id,
      'Requirements Confirmed',
      3,
      40,
      'open',
      true
    ),
    (
      v_org_id,
      v_pipeline_id,
      'Sourcing',
      4,
      60,
      'open',
      true
    ),
    (
      v_org_id,
      v_pipeline_id,
      'Quote Sent',
      5,
      75,
      'open',
      true
    ),
    (
      v_org_id,
      v_pipeline_id,
      'Follow-Up / Negotiation',
      6,
      85,
      'open',
      true
    ),
    (
      v_org_id,
      v_pipeline_id,
      'Closed Won',
      7,
      100,
      'won',
      true
    ),
    (
      v_org_id,
      v_pipeline_id,
      'Closed Lost',
      8,
      0,
      'lost',
      true
    )
  on conflict (pipeline_id, position)
  do update set
    name = excluded.name,
    probability = excluded.probability,
    stage_type = excluded.stage_type,
    is_active = excluded.is_active;

end $$;

commit;
