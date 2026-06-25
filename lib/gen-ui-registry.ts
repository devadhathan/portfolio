export type GenUIStat = { type: 'stat'; label: string; value: string; context?: string };
export type GenUIProject = { type: 'project'; title: string; description: string; tags?: string[]; link?: string };
export type GenUITimeline = { type: 'timeline'; role: string; company: string; period: string; highlights?: string[] };
export type GenUISkills = { type: 'skill_grid'; categories: { name: string; skills: string[] }[] };
export type GenUIQuote = { type: 'quote'; text: string; author?: string };
export type GenUIChart = {
  type: 'chart';
  title: string;
  bars: { label: string; value: number; displayValue: string; color?: string }[];
};
export type GenUIImage = { type: 'image'; src: string; alt: string; caption?: string; link?: string };
export type GenUIInfo = { type: 'info'; title: string; subtitle?: string; body: string; icon?: string; link?: string };
export type GenUIItem =
  | GenUIStat
  | GenUIProject
  | GenUITimeline
  | GenUISkills
  | GenUIQuote
  | GenUIChart
  | GenUIImage
  | GenUIInfo;

export const CARD_REGISTRY: Record<string, GenUIItem> = {
  'stat:downloads': { type: 'stat', value: '100k+', label: 'App Downloads', context: 'Finshots · first year' },
  'stat:conversion': { type: 'stat', value: '+17%', label: 'Conversion Rate', context: 'Ditto booking portal' },
  'stat:engagement': { type: 'stat', value: '+92%', label: 'User Engagement', context: 'Nesoi.ai dashboards' },
  'stat:efficiency': { type: 'stat', value: '+20%', label: 'Team Efficiency', context: 'Ditto CRM redesign' },
  'stat:rating': { type: 'stat', value: '4.9★', label: 'Play Store Rating', context: 'Finshots' },
  'stat:subscribers': { type: 'stat', value: '500k+', label: 'Subscribers', context: 'Finshots newsletter' },
  'stat:dropoff': { type: 'stat', value: '-8%', label: 'Drop-off Rate', context: 'Ditto onboarding' },
  'stat:devtime': { type: 'stat', value: '-30%', label: 'Design-to-Dev Time', context: 'Falcon Design System' },
  'stat:clients': { type: 'stat', value: '15+', label: 'Enterprise Clients', context: 'Nesoi.ai' },
  'stat:coursetime': { type: 'stat', value: '-37%', label: 'Course Creation Time', context: 'Nesoi.ai' },

  'project:finshots': {
    type: 'project',
    title: 'Finshots News App',
    description: 'Award-winning fintech mobile app. 100k+ downloads, 4.9★, Google Play Best App 2020.',
    tags: ['Mobile', 'Fintech', 'UX'],
    link: '/work?project=finshots-news-app',
  },
  'project:falcon': {
    type: 'project',
    title: 'Falcon Design System',
    description: 'Comprehensive design system for Ditto Insurance. Reduced design-to-dev time by 30%.',
    tags: ['Design System', 'Figma'],
    link: '/work?project=falcon-design-system',
  },
  'project:crm': {
    type: 'project',
    title: 'CRM Redesign',
    description: 'Internal CRM overhaul for Ditto Insurance. Boosted team efficiency by 20%.',
    tags: ['B2B', 'Product Design'],
    link: '/work?project=crm-redesign',
  },
  'project:onboarding': {
    type: 'project',
    title: 'Onboarding Redesign',
    description: '+17% conversion, -8% drop-off. Data-driven slot booking flow redesign.',
    tags: ['Conversion', 'UX Research'],
    link: '/work?project=onboarding-redesign',
  },
  'project:booking': {
    type: 'project',
    title: 'Booking Portal',
    description: 'Full redesign using Double Diamond. WCAG 2.1 AA compliant. 17% conversion increase.',
    tags: ['Accessibility', 'Web'],
    link: '/work?project=booking-portal-redesign',
  },
  'project:nesoi': {
    type: 'project',
    title: 'Nesoi.ai Dashboard',
    description: 'AI-powered learning dashboards for 15+ enterprise clients. Engagement up 92%.',
    tags: ['AI', 'Dashboard', 'B2B'],
  },

  'timeline:wordsmith': {
    type: 'timeline',
    role: 'Product Designer',
    company: 'Wordsmith AI',
    period: 'Apr 2026 – Jun 2026',
    highlights: ['AI-powered writing and content platform'],
  },
  'timeline:nesoi': {
    type: 'timeline',
    role: 'Product Designer',
    company: 'Nesoi.ai',
    period: 'Jul 2025 – Nov 2025',
    highlights: ['+92% engagement', '-37% course creation time', 'WCAG 2.1 AA'],
  },
  'timeline:ditto-finshots': {
    type: 'timeline',
    role: 'Product Designer',
    company: 'Ditto Insurance (by Finshots)',
    period: 'Aug 2019 – Dec 2022',
    highlights: [
      'Falcon Design System',
      '+17% conversion',
      '+20% efficiency',
      'Google Play Best App 2020',
      '100k+ downloads',
      '4.9★',
    ],
  },

  'skills:design': {
    type: 'skill_grid',
    categories: [
      {
        name: 'Design',
        skills: ['UX/UI', 'Interaction Design', 'Prototyping', 'Visual Design', 'Wireframing', 'Design Systems', 'Mockups'],
      },
    ],
  },
  'skills:research': {
    type: 'skill_grid',
    categories: [
      {
        name: 'Research',
        skills: ['User Interviews', 'User Testing', 'A/B Testing', 'Journey Mapping', 'Persona Creation', 'Information Architecture'],
      },
    ],
  },
  'skills:software': {
    type: 'skill_grid',
    categories: [
      {
        name: 'Tools',
        skills: ['Figma', 'Framer', 'Cursor', 'v0', 'Adobe XD', 'Principle', 'After Effects', 'HTML', 'CSS', 'JavaScript'],
      },
    ],
  },

  'quote:philosophy': {
    type: 'quote',
    text: 'Great design is invisible — it solves real problems while feeling effortless to the person using it.',
  },
  'quote:approach': {
    type: 'quote',
    text: 'I balance creativity with practicality, always keeping the user at the center of every decision.',
  },
  'quote:systems': {
    type: 'quote',
    text: "A good design system isn't just a library of components — it's a shared language for the whole team.",
  },

  'chart:impact': {
    type: 'chart',
    title: 'Impact Across Roles',
    bars: [
      { label: 'Engagement', value: 92, displayValue: '+92%', color: 'hsl(var(--primary))' },
      { label: 'Conversion', value: 17, displayValue: '+17%', color: 'hsl(var(--primary) / 0.8)' },
      { label: 'Efficiency', value: 20, displayValue: '+20%', color: 'hsl(var(--primary) / 0.6)' },
      { label: 'Dev Time', value: 30, displayValue: '-30%', color: 'hsl(var(--primary) / 0.5)' },
    ],
  },
  'chart:downloads': {
    type: 'chart',
    title: 'Finshots Growth',
    bars: [
      { label: 'Downloads', value: 100, displayValue: '100k+' },
      { label: 'Subscribers', value: 500, displayValue: '500k+' },
      { label: 'Rating', value: 98, displayValue: '4.9★' },
    ],
  },
  'chart:skills': {
    type: 'chart',
    title: 'Skill Proficiency',
    bars: [
      { label: 'UX/UI', value: 95, displayValue: 'Expert' },
      { label: 'Prototyping', value: 90, displayValue: 'Expert' },
      { label: 'Research', value: 85, displayValue: 'Advanced' },
      { label: 'Design Sys', value: 92, displayValue: 'Expert' },
      { label: 'Frontend', value: 70, displayValue: 'Proficient' },
    ],
  },
  'chart:nesoi': {
    type: 'chart',
    title: 'Nesoi.ai Results',
    bars: [
      { label: 'Engagement', value: 92, displayValue: '+92%' },
      { label: 'Course Time', value: 37, displayValue: '-37%' },
      { label: 'Clients', value: 15, displayValue: '15+' },
    ],
  },

  'image:finshots': {
    type: 'image',
    src: '/finshots/image.png',
    alt: 'Finshots News App',
    caption: 'Finshots — Award-winning fintech news app',
    link: '/work?project=finshots-news-app',
  },
  'image:falcon': {
    type: 'image',
    src: '/falcon design system/image.png',
    alt: 'Falcon Design System',
    caption: 'Falcon — Comprehensive design system for Ditto',
    link: '/work?project=falcon-design-system',
  },
  'image:crm': {
    type: 'image',
    src: '/CRM/prototype.gif',
    alt: 'CRM Redesign Prototype',
    caption: 'CRM Redesign — Interactive prototype',
    link: '/work?project=crm-redesign',
  },
  'image:ditto': {
    type: 'image',
    src: '/ditto insurance/1.png',
    alt: 'Ditto Insurance',
    caption: 'Ditto — Booking portal redesign',
    link: '/work?project=onboarding-redesign',
  },
  'image:nesoi': {
    type: 'image',
    src: '/nesoi/final-prototype.png',
    alt: 'Nesoi.ai Dashboard',
    caption: 'Nesoi.ai — Enterprise learning dashboard',
  },
  'image:portrait': {
    type: 'image',
    src: '/photos/MEE.png',
    alt: 'Devadhathan M D',
    caption: 'Devadhathan M D — Product Designer',
  },

  'info:education': {
    type: 'info',
    title: 'MSc User Experience Design',
    subtitle: 'Edinburgh Napier University',
    body: '2023–2024 · Edinburgh, UK. Specialized in UX research methods, interaction design, and human-computer interaction.',
    icon: '🎓',
  },
  'info:bsc': {
    type: 'info',
    title: 'BSc Computer Science Engineering',
    subtitle: 'University of Kerala',
    body: 'Foundation in software engineering, data structures, and algorithms.',
    icon: '💻',
  },
  'info:award': {
    type: 'info',
    title: 'Google Play Best App 2020',
    subtitle: 'Finshots News App',
    body: 'Recognized by Google for outstanding user experience, design quality, and engagement metrics.',
    icon: '🏆',
  },
  'info:cert:google': {
    type: 'info',
    title: 'Google UX Design Professional',
    subtitle: 'Google',
    body: 'Certified in user-centered design, wireframing, prototyping, and usability testing.',
    icon: '📜',
  },
  'info:cert:ibm': {
    type: 'info',
    title: 'IBM Design Thinking Practitioner',
    subtitle: 'IBM',
    body: 'Certified in enterprise design thinking, team collaboration, and user outcomes framework.',
    icon: '📜',
  },
  'info:location': {
    type: 'info',
    title: 'Based in Edinburgh, UK',
    subtitle: 'Originally from Kerala, India',
    body: 'Open to full-time Product Design roles. Available for remote or hybrid positions.',
    icon: '📍',
  },
  'info:contact': {
    type: 'info',
    title: 'Get in Touch',
    subtitle: 'Open to opportunities',
    body: 'Email: hello@devadhathan.com · LinkedIn: devadhathan · Portfolio: devadhathan.com',
    icon: '✉️',
    link: '/contact',
  },
};

export const CARD_ID_LIST = Object.keys(CARD_REGISTRY);

export function resolveCardIds(rawIds: string[]): GenUIItem[] {
  const allKeys = Object.keys(CARD_REGISTRY);
  const resolved = rawIds.map((id) => {
    if (CARD_REGISTRY[id]) return CARD_REGISTRY[id];
    const noColon = allKeys.find((k) => k.replace(':', '') === id.replace(':', ''));
    if (noColon) return CARD_REGISTRY[noColon];
    if (id.startsWith(':')) {
      const found = allKeys.find((k) => k.endsWith(':' + id.slice(1)));
      if (found) return CARD_REGISTRY[found];
    }
    const byName = allKeys.find((k) => k.split(':').pop() === id);
    if (byName) return CARD_REGISTRY[byName];
    const contains = allKeys.find((k) => {
      const suffix = k.split(':').pop() || '';
      return suffix.length > 3 && id.includes(suffix);
    });
    if (contains) return CARD_REGISTRY[contains];
    return null;
  }).filter(Boolean) as GenUIItem[];

  const seen = new Set<GenUIItem>();
  return resolved.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}
