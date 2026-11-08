export const industries = {
  healthcare: {
    label: 'Healthcare', audience: 'FOR PRACTICE OWNERS & OFFICE MANAGERS',
    title: 'Support the people behind the care.',
    description: 'Help your administrative team understand the technology they rely on, from reception displays to the support process for an interrupted connection.',
    useCases: ['Reception & information displays', 'Administrative IT documentation', 'Staff support & escalation'],
    preparation: 'an administrative equipment list and your IT support contact',
  },
  hospitality: {
    label: 'Hospitality', audience: 'FOR OWNERS & PROPERTY MANAGERS',
    title: 'A more connected guest experience.',
    description: 'Align front-desk operations, common-area displays and connectivity planning with the needs of your property and the team running it.',
    useCases: ['Lobby displays & wayfinding', 'Internet & backup planning', 'Front-desk staff readiness'],
    preparation: 'a property technology list and a summary of front-desk or guest-service interruptions',
  },
  entertainment: {
    label: 'Entertainment', audience: 'FOR VENUE OWNERS & OPERATORS',
    title: 'Keep your venue ready for the crowd.',
    description: 'Plan technology around event schedules, public spaces and the operational needs of your venue, with a clear handoff to your IT and delivery teams.',
    useCases: ['Event displays & information screens', 'Camera coverage & recording needs', 'Connectivity & staff handoffs'],
    preparation: 'a venue layout and your event operating schedule',
  },
  bars: {
    label: 'Bars & restaurants', audience: 'FOR OWNERS & GENERAL MANAGERS',
    title: 'Keep the experience in focus.',
    description: 'From the screen above the bar to the connection behind your POS, every purchase should support the way your space operates.',
    useCases: ['Sports displays & digital menus', 'Camera coverage & retention', 'POS internet & backup planning'],
    preparation: 'a room layout and a list of displays, cameras or connection issues',
  },
};

export const needLabels = {
  clarity: 'Audit current technology and identify gaps', ai: 'Integrate AI into a business workflow', training: 'Prepare staff to work with IT',
  displays: 'Upgrade displays or digital signage', cameras: 'Improve camera coverage',
  connectivity: 'Review internet, backup or phones',
};
export const locationLabels = { one: 'One location', several: '2–5 locations', many: '6+ locations' };
export const timingLabels = { soon: 'Within 30 days', quarter: 'Within 1–3 months', exploring: 'Exploring options' };
export const supportLabels = { remote: 'IT provider or remote team', internal: 'Internal IT team', none: 'No defined support contact', unsure: 'Support ownership is unclear' };

export function recommend(input) {
  if (!input || !Object.hasOwn(industries,input.industry) || !Array.isArray(input.needs) || !input.needs.length || input.needs.some(n => !Object.hasOwn(needLabels,n)) || !Object.hasOwn(locationLabels,input.locations) || !Object.hasOwn(timingLabels,input.timing) || !Object.hasOwn(supportLabels,input.support)) {
    throw new Error('Choose an industry, at least one valid priority, location scope, timing and support arrangement.');
  }
  const needs = [...new Set(input.needs)];
  const includes = n => needs.includes(n);
  const productNeeds = needs.filter(n => ['displays', 'cameras', 'connectivity'].includes(n));
  const hasEquipment = productNeeds.length > 0;
  const primary = includes('clarity') ? 'review' : includes('ai') ? 'ai' : hasEquipment ? 'equipment' : 'training';
  const context = industries[input.industry];
  let title, reason, preparation, confirm;
  const additions = [];
  if (primary === 'review') {
    title = 'Technology Audit & Readiness Review';
    reason = 'Start with a documented picture of your technology and support responsibilities. A prioritized review gives you a sound basis for the next purchase or staff training.';
    preparation = context.preparation;
    confirm = 'the equipment count, review scope and support responsibilities';
    if (includes('ai')) additions.push('Then: AI Workflow Integration');
    if (includes('training')) additions.push('Then: Staff Technology Confidence');
    if (hasEquipment) additions.push(`Then: ${equipmentTitle(productNeeds)}`);
  } else if (primary === 'ai') {
    title = 'AI Workflow Integration';
    reason = 'Identify one repetitive business task, select suitable AI tools and define a small pilot with human review and measurable results. Agree data access and integration requirements before implementation.';
    preparation = 'one example workflow, the tools your team uses and a description of the desired improvement; use sample or non-sensitive data';
    confirm = 'the pilot deliverables, tool costs, data permissions, success measures and delivery responsibilities';
    if (includes('training')) additions.push('Alongside: Staff Technology Confidence');
    if (hasEquipment) additions.push(`Alongside: ${equipmentTitle(productNeeds)}`);
  } else if (primary === 'equipment') {
    title = equipmentTitle(productNeeds);
    const descriptions = {
      displays: 'Match the display, mount and signal accessories to your space, operating hours and viewing needs.',
      cameras: 'Define coverage, identification detail and retention before selecting compatible cameras, recording and storage.',
      connectivity: 'Review service needs and backup options with supplier specialists before selecting internet or business voice services.',
    };
    reason = productNeeds.length === 1 ? descriptions[productNeeds[0]] : 'Build one requirements-led proposal for your equipment and service priorities, with compatibility, supplier terms and delivery responsibilities clearly defined.';
    preparation = productNeeds.includes('connectivity') ? 'your service address, provider details and current service requirements' : productNeeds.includes('cameras') ? 'a site layout, coverage goals and your desired recording retention' : 'display quantities, room photos without sensitive information, and daily operating hours';
    confirm = 'requirements, budget, timing and any specialist delivery scope';
    if (includes('training')) additions.push('Alongside: Staff Technology Confidence');
  } else {
    title = 'Staff Technology Confidence';
    reason = 'Give 4–8 designated employees a practical way to recognize equipment, complete only approved checks, and hand useful information to IT. Three two-hour sessions build a clear support routine.';
    preparation = 'your proposed attendees, recurring support issues and employer-approved task checklist';
    confirm = 'attendees, IT-approved stop rules and the three-session schedule';
  }
  if (input.support === 'none' || input.support === 'unsure') {
    additions.push('First agree who owns support and escalation.');
  }
  const discovery = input.timing === 'exploring' ? 'Start with a 20-minute discovery conversation' : 'Schedule a 20-minute discovery conversation';
  let next = `${discovery} with SecureVolt. Bring ${preparation}. We’ll confirm ${confirm}.`;
  if (input.locations !== 'one') next += ' Choose one representative location to scope first.';
  let scope = primary === 'ai' ? 'One scoped workflow pilot. Tool subscriptions, data permissions, human approval checkpoints and any specialist implementation are agreed in the proposal.' : primary === 'review' ? 'Visual, non-invasive review; no production changes or certified security/compliance assessment.' : primary === 'training' ? 'Six instructional hours across three days. Employer-approved tasks only; completion record, not technician certification.' : 'Quote-to-order sourcing. Models, stock, supplier terms and installation/support responsibilities are confirmed in the proposal.';
  if (input.industry === 'healthcare') scope += ' Discovery stays within administrative IT; no patient records or clinical-device access.';
  if (input.timing === 'soon') scope += ' Requested timing is subject to agreed scope and availability.';
  return {
    primary, title, reason, additions, next, scope,
    context: `${context.label} · ${locationLabels[input.locations]} · ${timingLabels[input.timing]}`,
    input: {...input, needs},
  };
}

function equipmentTitle(needs) {
  if (needs.length > 1) return needs.includes('connectivity') ? 'Equipment & Connectivity Plan' : 'Display & Camera Equipment Plan';
  return { displays: 'Commercial Display Solution', cameras: 'Security Camera Solution', connectivity: 'Connectivity & Voice Discovery' }[needs[0]];
}

export function makeBrief(result) {
  const {input} = result;
  return [
    'SECUREVOLT SOLUTIONS — DISCOVERY BRIEF', '',
    `Business: ${industries[input.industry].label}`,
    `Locations: ${locationLabels[input.locations]}`,
    `Requested timing: ${timingLabels[input.timing]}`,
    `Current support: ${supportLabels[input.support]}`,
    `Priorities: ${input.needs.map(n=>needLabels[n]).join('; ')}`, '',
    `RECOMMENDED START: ${result.title}`, result.reason,
    ...(result.additions.length ? ['', ...result.additions] : []), '',
    'NEXT STEP', result.next, '',
    'SCOPE TO CONFIRM', result.scope,
    'Final scope, pricing, availability and responsibilities require a written proposal.', '',
    'Prepared in the SecureVolt needs selector. No request has been submitted.',
  ].join('\n');
}
