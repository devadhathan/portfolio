import type { Project } from '@/lib/types/project'

export const ML_PROJECT_OVERLAYS: Record<string, Partial<Project>> = {
  'nesoi-ai-dashboard': {
    title: 'Nesoi.ai ഡാഷ്‌ബോർഡ്',
    type: 'പ്രോഡക്റ്റ് ഡിസൈൻ',
    cardSubtext: 'AI ചാറ്റ്-ആദ്യ creation അനുഭവം',
    description:
      'Amazon, University of Toronto, Bain & Company പോലുള്ള സ്ഥാപനങ്ങൾ ഉപയോഗിക്കുന്ന AI-ശക്തമായ ലേർണിംഗ് പ്ലാറ്റ്‌ഫോമാണ് Nesoi.ai. ഇന്ററാക്ടീവ് ലേർണിംഗ് ഉള്ളടക്കം സൃഷ്ടിക്കാനും employees-നെ train ചെയ്യാനും knowledge retention മെച്ചപ്പെടുത്താനും teams ഇത് ആശ്രയിക്കുന്നു.',
    role: 'പ്രോഡക്റ്റ് ഡിസൈനർ',
    detailSections: [
      {
        id: 'problem',
        title: 'പ്രശ്നം',
        description:
          'ഈ പ്രോജക്റ്റിന് മുമ്പ്, content creators raw materials (documents, videos, slides) upload ചെയ്യ konnte, പക്ഷേ അത് engaging learning experiences-ആക്കി മാറ്റുന്നത് manual-യും time-consuming-um ആയിരുന്നു. AI-യുമായി conversational collaboration, learning flows shape ചെയ്യാൻ guided structure, ideas iterate ചെയ്യാൻ support — ഇവയൊന്നും ഇല്ലാത്തതിനാൽ creators-ന്റെ effort assembly-യിൽ പോയി, pedagogy-യിലും outcomes-ിലും അല്ല.',
      },
      {
        id: 'goals',
        title: 'ലക്ഷ്യങ്ങൾ',
        description:
          'creation experience-യിൽ AI embed ചെയ്ത് natural, collaborative feel നൽകുക; rigid forms പൂരിപ്പിക്കുന്നതിന് പകരം conversationally explore, refine, iterate ചെയ്യാൻ creators-നെ സഹായിക്കുക; dashboards, creation tools, admin interfaces എന്നിവയിൽ scalable design system build ചെയ്യുക — ഇതായിരുന്നു ലക്ഷ്യം.',
      },
      {
        id: 'challenge',
        title: 'challenge frame ചെയ്യൽ',
        description:
          'How might we ചോദ്യങ്ങളിലൂടെ work reframe ചെയ്തു: building സമയത്ത് AI-യുമായി converse ചെയ്യാൻ creators-നെ enable ചെയ്യുക, strict wizards-ന് പകരം flexible exploration support ചെയ്യുക, generator മാത്രമല്ല learning partner ആയി AI feel ചെയ്യさせる.',
      },
      {
        id: 'chat-decision',
        title: 'primary creation tool ആയ AI chat',
        description:
          'creation experience-യിൽ embedded AI chat interface introduce ചെയ്തു — creators material-ും conversation-um ഒരുമിച്ച് കാണും. questions ചോദിക്കാം, transformations request ചെയ്യാം, natural language-ൽ outputs refine ചെയ്യാം; chat content learning flows-ആക്കി restructure, summarize, adapt ചെയ്യുന്നു.',
      },
      {
        id: 'system',
        title: 'system & component design',
        description:
          'Obra UI design system (Shadcn) anchor ചെയ്ത് Nesoi needs-ന് customize ചെയ്തു: AI/user distinction-ുള്ള message bubbles, loading & error states, structured templates & freeform prompts support ചെയ്യുന്ന inputs, long sessions handle ചെയ്യുന്ന conversation layouts.',
      },
      {
        id: 'workflows',
        title: 'AI chat workflows',
        description:
          'initial exploration, content transforming, refining & iterating, multiple versions compare ചെയ്യൽ — AI thinking support ചെയ്യുന്നു, replace ചെയ്യുന്നില്ല.',
      },
      {
        id: 'constraints',
        title: 'constraints',
        description:
          'evolving AI capabilities flexible patterns demand ചെയ്തു; prior chat experience ഇല്ലാത്തതിനാൽ Slack, ChatGPT പോലുള്ള familiar tools study ചെയ്തു; tight timeline-ൽ core happy path focus ചെയ്തു.',
      },
      {
        id: 'delivery',
        title: 'delivery & validation',
        description:
          'high-fidelity designs, Figma library, developer-ready specs deliver ചെയ്തു; internal testing-ന് Vercel prototype deploy ചെയ്തു. chat natural feel ചെയ്തതായി feedback, iteration 3–4 rounds/session വേഗത്തിലാക്കി.',
      },
      {
        id: 'prototype',
        title: 'prototype',
        description:
          'AI chat-first creation experience demonstrate ചെയ്യുന്ന interactive prototype — creators AI-യുമായി collaborate ചെയ്ത് content learning flows-ആക്കി transform ചെയ്യുന്നത് കാണിക്കുന്നു.',
      },
    ],
  },

  'falcon-design-system': {
    title: 'Falcon Design System',
    type: 'Design System',
    cardSubtext: 'Insurance Design System',
    description:
      'Falcon Design System എല്ലാ digital products-ലും consistency, efficiency, accessibility കൊണ്ടുവരുന്ന comprehensive framework ആണ്. reusable UI components library, cohesive visual language, intuitive interfaces-നുള്ള clear guidelines — multiple platforms-ൽ development streamline ചെയ്യുന്നു.\n\nModularity, reusability principles-ൽ build ചെയ്ത Falcon typography, color palettes, icons, interactive components standardize ചെയ്യുന്നു. brand experience consistent ആക്ക的同时 development accelerate ചെയ്യുന്നു.',
    role: 'Interaction designer, UX researcher',
    problem:
      'workflows streamline ചെയ്യുക, consistent accessible user experiences ensure ചെയ്യുക, cross-functional teams-നെ rapidly iterate innovate ചെയ്യാൻ empower ചെയ്യുക — unified design system എങ്ങനെ develop ചെയ്യാം?',
    targetAudience:
      'digital interfaces craft & implement ചെയ്യുന്ന internal designers & developers; alignment maintain ചെയ്യേണ്ട product managers & stakeholders; marketing, content, customer support പോലുള്ള cross-functional teams; consistent design language തേടുന്ന external partners & agencies.',
    keyFeatures: [
      'Reusable components',
      'Typography system',
      'Color palettes',
      'Icons library',
      'Interactive components',
      'Accessibility compliance',
    ],
    impact: [
      'Enhanced Consistency: standardized UI elements unified brand experience നൽകി.',
      'Accelerated Development: documentation & ready components workflows streamline ചെയ്തു.',
      'Improved Collaboration: shared design language designers, developers, stakeholders align ചെയ്തു.',
      'Increased User Satisfaction: consistent accessible interfaces engagement മെച്ചപ്പെടുത്തി.',
    ],
  },

  'finshots-news-app': {
    title: 'Finshots News App',
    type: 'Mobile App Design',
    cardSubtext: 'Daily Financial News',
    description:
      'financial news & insights centralized platform access ചെയ്യാൻ Finshots mobile app redesign ചെയ്തു. emails, social posts, channels എന്നിവയിൽ fragmented content delivery-യുടെ challenge address ചെയ്തു.',
    role: 'Product Designer, UX Designer',
    problem:
      'financial content frequent readers old stories revisit ചെയ്യാൻ struggle ചെയ്യുന്നു — website, emails-ൽ inefficient navigation. endless scrolling, scattered content previously engaged stories locate ചെയ്യാൻ difficult; frustration, decreased engagement.',
    research:
      'users Finshots content-ൽ engaged stay ചെയ്യാൻ struggle ചെയ്യുന്നത് എന്തുകൊണ്ട്? Google Play reviews, social media feedback, direct user queries analyze ചെയ്തു. content quality-യല്ല — accessibility, intuitive navigation-യാണ് issue.',
    hmw: 'financial stories easily explore, revisit ചെയ്യാൻ intuitive seamless navigation experience നൽകുന്ന centralized platform എങ്ങനെ design ചെയ്യാം?',
    keyFeatures: [
      'Navigation: sleek interface with categories, filters, search. Benefit - recent & archived stories effortlessly browse.',
      'Infographics: interactive infographics, tappable charts complex financial data simplify ചെയ്തു.',
      'Accessibility: adjustable font sizes, dark mode inclusive experience.',
      'Custom Notifications: personalized alerts key updates & deadlines.',
    ],
    results: [
      'ഒരു വർഷത്തിൽ 100k+ downloads',
      'Play Store-ൽ 4.9 rating',
      "Google Play's Best App of 2020 award",
      '500k+ subscribers',
    ],
    learnings: [
      'Finshots 2019-ൽ product design-ിലേക്ക് pull ചെയ്ത pivotal project. Adobe XD-യിൽ first hands-on — animations, onboarding illustrations, icons, UX flows. great design aesthetics മാത്രമല്ല — real problems solve ചെയ്യുന്ന user-centric experiences.',
    ],
  },

  'onboarding-redesign': {
    title: 'Onboarding Redesign',
    type: 'UX Redesign',
    cardSubtext: 'Ditto Customer Onboarding',
    description:
      '2022-ൽ Ditto Insurance — 2021-ൽ launch ചെയ്ത Indian startup — significant improvement opportunities present ചെയ്തു. product manager-ുമായി collaborate ചെയ്ത് new users-ക്ക് friction കുറയ്ക്കാൻ onboarding reimagine ചെയ്തു.',
    role: 'Interaction designer, UX researcher',
    problem:
      'slot booking complete ചെയ്യുന്നതിന് മുമ്പ് users drop off — low conversion. business goal (conversions increase) user-centric approach-നൊപ്പം align ചെയ്യേണ്ട major challenge.',
    hmw: 'booking experience redesign ചെയ്ത് user errors, accidental data loss prevent ചെയ്യുക, phone number share ചെയ്യുമ്പോൾ spam concerns alleviate ചെയ്യുക, desired time slots secure ചെയ്യാൻ advisor availability optimize ചെയ്യുക?',
    approach:
      'onboarding manageable problems-ആக break ചെയ്ത് data-backed solutions. slot shortages-ന് WhatsApp support, clear exit points; trust-ന് “We never spam” nudge; accidental exit-ന് confirmations & autosave.',
    prototype: 'WhatsApp assistance flows, spam-free messaging, error-prevention modals validate ചെയ്യാൻ interactive prototypes.',
    takeStepBack:
      'solutions-ിലേക്ക് jump ചെയ്യുന്നതിന് മുമ്പ് problem understand ചെയ്തു. analytics, customer conversations, cognitive walkthrough, user interviews — Ian (marketing manager), Maaya (teacher) personas.',
    painPointsIntro:
      'onboarding journey-യിലെ key problems identify ചെയ്ത് bite-sized issues-ആக break down ചെയ്തു.',
    impactOverview:
      'redesign broad effects: Ditto-യ്ക്ക് monthly one lakh+ visitors, ~600+ daily portal bookings. team energy & passion key business metrics upward drive ചെയ്തു.',
    learnings: [
      'solution inform ചെയ്യുന്ന data points-ൽ മാത്രം focus — data overload problem obscure ചെയ്യും.',
      'collaboration key — developers, PMs, stakeholders constant engagement.',
      'user testing essential — even small changes-ന് early prototyping & feedback.',
      'flexibility & adaptability critical — new constraints, insights-ന് adjust ചെയ്യുക.',
    ],
    keyFeatures: [
      'booking status progress indicators',
      'WhatsApp support, clear exit points simplified slot booking',
      'spam-free experience emphasize ചെയ്യുന്ന trust-building copy, badges, nudges',
      'accidental exit-ൽ data preserve ചെയ്യുന്ന error-prevention modals',
      'lead context preserve ചെയ്യുന്ന notes, activity history, tags',
      'essential tools accessible optimized information architecture',
      'sales, support, marketing-ന് dynamic role-aware dashboards',
    ],
    impact: [
      'accidental exits safeguard, customer progress preserved',
      'spam protection transparent communication trust built',
      'role-specific support & reporting sales, lead quality maximize',
      '60 days-ൽ health insurance premiums conversion 17% increase, ₹3cr+ premiums',
      'daily slot bookings ~5% increase (~500-600/day)',
      '60 days-ൽ customer drop-off 8% decrease',
    ],
    businessOpportunity: [
      'Accidental Exits & Data Loss safeguard',
      'Conversion Rates increase',
      'Support Costs lower',
      'Spamming assurance',
      'Trust & Credibility build',
      'Lead Quality enhance',
      'Preferred Slots unavailable-യിൽ support',
      'Sales Opportunities maximize',
      'Customer Satisfaction improve',
    ],
    explorations: [
      {
        tag: 'Problem #1',
        title: 'Desired Time Slots reach ചെയ്യാൻ users unable',
        problem: 'advisor capacity preferred slots book ചെയ്യാൻ limit ചെയ്തു.',
        solution: 'WhatsApp support, clearer exit points, slots full-ആയാ alternative assistance.',
      },
      {
        tag: 'Problem #2',
        title: 'Phone Numbers share ചെയ്യുന്നതിൽ trust issues',
        problem: 'spam calls fear phone number stage-ൽ drop off.',
        solution: '“We never spam” badge, tooltip, nudge treatments — mobile-friendly nudge shipped.',
      },
      {
        tag: 'Problem #3',
        title: 'Accidental Exit-ൽ data lost',
        problem: 'accidental exits progress erase — counterintuitive.',
        solution: 'in-progress data preserve confirmation pop-ups, WhatsApp guidance.',
      },
    ],
    painPoints: [
      { title: 'error prevention ഇല്ല', detail: 'flow safeguards lacking — accidental data loss frequent.' },
      { title: 'spamming fear', detail: 'phone numbers share ചെയ്യാൻ hesitation — spam calls concern.' },
      { title: 'slots available ഇല്ല', detail: 'advisor capacity desired slots limit — frustration, abandonment.' },
    ],
    designGallery: [
      {
        src: '/ditto insurance/image.png',
        title: 'Booking confirmation',
        description: 'progress indicators & WhatsApp assistance guided flows.',
      },
    ],
  },

  'crm-redesign': {
    title: 'CRM Redesign',
    type: 'Product Design',
    cardSubtext: 'Insurance CRM',
    description:
      'four months-ൽ Ditto team-മായി partner ചെയ്ത് sales operations streamline ചെയ്യുക, intuitive actionable reporting deliver ചെയ്യുക — CRM build ചെയ്തു. 2021-ൽ no-spam insurance platform launch; growing lead volume Excel workflows scalable foundation need ചെയ്തു.',
    role: 'Interaction designer, UX researcher, UX Designer',
    problem:
      'lead volume increase-യോടെ Excel manual tracking unsustainable; existing CRM role-specific workflows, real-time insight, cohesive customizable interface lack ചെയ്തു.',
    targetAudience:
      'customer relationships manage ചെയ്യുന്ന internal teams — sales, support, account management; reporting need strategic leaders; unified platform need partners.',
    approach:
      'seamless usability, role-specific dashboards, personalized workflows, integrated communication tools — streamlined navigation, centralized communications, role-appropriate data dashboards.',
    keyFeatures: [
      'sales, support, management-ന tailored role-specific dashboards',
      'messaging, email, call tools integrated — communication one place',
      'personalized dashboards, filters, notifications',
      'quick access optimized navigation & information architecture',
      'faster decisions dynamic charts & real-time insights',
      'conversational context preserve activity history & note-taking',
      'segmentation, filtering, campaigns lead tagging',
    ],
    results: [
      'sales organization communication & coordination streamlined',
      'activity histories & tags new advisors faster onboarding',
      'data-rich dashboards reporting confidence increased',
    ],
    impact: [
      'role-specific interfaces redundancy reduced, teams focused.',
      'integrated messaging, email, call tools communication centralized.',
      'real-time insights decision-makers fresh data empowered.',
    ],
    detailSections: [
      {
        id: 'adding-notes',
        title: 'notes ചേർക്കൽ',
        description:
          'lead-നെ relate ചെയ്യുന്ന comments, observations record ചെയ്യ notes use ചെയ്യുന്നു. sale progress track; advisors switch-ആയാ new advisor history & requirements understand.',
      },
      {
        id: 'my-tasks-lead-owner-change',
        title: 'My Tasks & Lead owner change',
        description:
          'Sales Tab-ൽ നിന്നും sale add ചെയ്യാം. right-side panel-ൽ sales form open. Ditto links sales-ന് application number enter മതി — “Get Details” policy details fetch.',
      },
      {
        id: 'tags-for-leads',
        title: 'Leads-ന് Tags',
        description:
          'leads-ന identifiers add — identify, filter/segment, campaigns target. lead details bottom right tags section.',
      },
    ],
    designGallery: [
      {
        src: '/CRM/image.png',
        title: 'CRM dashboard',
        description: 'role-aware dashboards & lead tagging.',
      },
    ],
  },
}
