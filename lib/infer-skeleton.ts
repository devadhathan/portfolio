import type { GenUIItem } from '@/lib/gen-ui-registry';

export type CardSkeletonType = GenUIItem['type'];

export function inferSkeletonFromPrompt(prompt: string): CardSkeletonType[] {
  const p = prompt.toLowerCase();
  const types = new Set<CardSkeletonType>();

  if (/metric|impact|stat|number|download|conversion|engagement|rating|subscriber/.test(p)) {
    types.add('stat');
  }
  if (/project|work|case|finshots|falcon|nesoi|ditto|crm|booking|onboarding/.test(p)) {
    types.add('project');
    types.add('image');
  }
  if (/finshots|falcon|nesoi|ditto|crm|onboarding/.test(p)) {
    types.add('feature');
  }
  if (/skill|tool|figma|design system|software|research method/.test(p)) {
    types.add('skill_grid');
  }
  if (/experience|career|timeline|role|company|history|wordsmith/.test(p)) {
    types.add('timeline');
  }
  if (/chart|graph|bar|proficiency|growth/.test(p)) {
    types.add('chart');
  }
  if (/photo|image|screenshot|visual|app|prototype/.test(p)) {
    types.add('image');
  }
  if (/video|walkthrough|demo|mp4|recording/.test(p)) {
    types.add('video');
  }
  if (/education|degree|university|msc|b\.?tech|cert|award|contact|location/.test(p)) {
    types.add('info');
  }
  if (/quote|philosophy|approach|design thinking/.test(p)) {
    types.add('quote');
  }
  if (/overview|summary|high.?level|everything|all about/.test(p)) {
    types.add('feature_section');
  }
  if (/layout|arrange|priorit|hide|show section|bento/.test(p)) {
    types.add('stat');
    types.add('project');
  }

  if (types.size === 0) {
    return ['stat', 'project', 'timeline'];
  }

  if (types.size === 1 && types.has('feature_section')) {
    return ['feature_section', 'stat', 'project'];
  }

  return [...types].slice(0, 4);
}

export function inferSkeletonFromCardIds(cardIds: string[]): CardSkeletonType[] {
  const types = new Set<CardSkeletonType>();

  for (const id of cardIds) {
    const prefix = id.split(':')[0];
    if (prefix === 'stat') types.add('stat');
    else if (prefix === 'project') types.add('project');
    else if (prefix === 'timeline') types.add('timeline');
    else if (prefix === 'skills') types.add('skill_grid');
    else if (prefix === 'chart') types.add('chart');
    else if (prefix === 'image') types.add('image');
    else if (prefix === 'video') types.add('video');
    else if (prefix === 'info') types.add('info');
    else if (prefix === 'quote') types.add('quote');
    else if (prefix === 'feature') types.add(id.includes('feature:') && !id.match(/feature:(impact|skills|career)/) ? 'feature' : 'feature_section');
  }

  return types.size > 0 ? [...types] : ['stat', 'project'];
}
