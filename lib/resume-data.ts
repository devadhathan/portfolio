export const resumeData = {
  name: "Devadhathan M D",
  email: "devadhathanmd18@gmail.com",
  website: "devadhathan.com",
  linkedin: "in/devadhathan/",
  xHandle: "MDdevaD",
  phone: "+447388289392",

  companyHistory: {
    finshotsDitto:
      "Finshots was founded in 2019 as a financial news platform. Dev joined as a product designer and designed the award-winning Finshots mobile app. The company launched Ditto Insurance in 2021 and later rebranded under the Ditto name — Finshots remains a product of the parent company.",
  },

  experience: [
    {
      role: "Product Designer",
      company: "Wordsmith AI",
      period: "April 2026 - June 2026",
      achievements: [
        "I worked as a product designer at Wordsmith AI. After research and internal prototyping, I shipped contract review and versioning for in-house legal teams. I ran discovery end to end and stayed close to legal engineers through launch. Most of the deeper work sits behind an NDA. Contact me if you want the real story.",
      ]
    },
    {
      role: "Product Designer",
      company: "Nesoi AI",
      period: "July 2025 - November 2025",
      achievements: [
        "I designed and shipped adviser/client-facing dashboards used by 15+ enterprise clients, so they could deliver interactive, AI-powered learning modules.",
        "I led iterative UX improvements and introduced reusable Figma components that lifted engagement by 92% and cut course-creation time by 37%.",
        "I developed scalable workflow and automation patterns, partnering closely with engineering so the UI stayed consistent and reliable.",
        "I baked WCAG 2.1 AA into component and template design, auditing patterns so they met regulatory requirements.",
        "I strengthened the design-system foundations by documenting component behaviours, responsive rules, and accessibility guidelines."
      ]
    },
    {
      role: "Product Designer",
      company: "Finshots & Ditto",
      period: "August 2019 - December 2022",
      achievements: [
        "I joined Finshots in 2019 as a product designer on the financial news platform and designed the Finshots mobile app (Google Play Best App 2020, 100k+ downloads).",
        "I stayed with the company as it founded Ditto Insurance in 2021 and later rebranded under Ditto — Finshots remains a core product of the parent company.",
        "I led the Ditto booking portal redesign (+17% conversion), created the Falcon Design System (-30% design-to-dev time), and redesigned the internal CRM (+20% efficiency).",
      ]
    },
  ],

  education: [
    {
      degree: "Master's in User Experience Design",
      institution: "Edinburgh Napier University",
      period: "2023 - 2024",
      details: "Studied under an academic scholarship. Focus on design thinking, human-centred design, prototyping, resilience, design reiteration, and usability testing."
    },
    {
      degree: "B.Tech Computer Science",
      institution: "APJ Abdul Kalam Technological University",
      period: "2015 - 2019",
      details: "Graduated with a focus on software development, algorithms, data structures, and system design. Final project - Simulation of a Quantum computer."
    }
  ],

  skills: {
    design: ["User Experience", "Interaction Design", "User Interface", "Prototyping", "Visual Design", "Wireframing", "Mockups"],
    research: ["User Interviews", "User Testing", "Information Architecture", "Quantitative Analysis", "A/B Testing", "Competitor Analysis", "Design Strategy", "Journey Mapping", "Persona Creation"],
    software: ["Figma", "Cursor", "v0", "Framer", "Sketch", "Principle", "Origami Studio", "InVision", "Adobe XD", "Illustrator", "Photoshop", "After Effects", "HTML", "CSS", "JavaScript"],
    visualDesign: ["Poster Design", "Branding", "Typography", "Iconography", "Book Design", "Web Design"]
  },

  projects: [
    {
      title: "Nesoi AI Dashboard",
      slug: "nesoi-ai-dashboard",
      type: "Product Design",
      company: "Nesoi AI",
      period: "July to November 2025",
      description:
        "When someone uploads a deck at Nesoi, they are not trying to learn the product. They are trying to turn what they already have into interactive training their team will actually finish. That is the job I redesigned.\n\nNesoi is an AI learning platform running across fifteen enterprise deployments, including Amazon, the University of Toronto, and Bain & Company. I led the creation experience end to end: from framing why V1 felt like overhead, through a working React prototype that engineering built from instead of a written spec.",
      cardSubtext: "Raw file to finished video, in two moves.",
      problem:
        "On Nesoi, a chapter is the unit of learning.\n\nChapters matter because they are how a deck, a doc, or a recording becomes interactive training people actually finish. If chapters are slow to make, the platform stays a file converter. If they are fast and good, it becomes how the organisation teaches.\n\nCreating a chapter still meant designing it by hand: pick a type, write the instructions, then place the content. People wanted to describe the chapter and let AI choose the template and fill it. V1 left that work on the creator. The closest competitor showed status, not what it had read or why it was building the chapter.",
      hmw: "Fewer decisions than doing it by hand, not more.",
      approach:
        "Not another interface to learn — a partner that takes the brief, picks a template, and shows its work while it builds the chapter.",
      detailSections: [
        {
          id: "decisions",
          title: "Decisions, why, and what they cost",
          description:
            "We surfaced the AI's reasoning while it worked, not just progress states\nWhy: so people could catch a wrong read early, instead of discovering it after the output was finished.\nCost: perceived speed. Visible thinking reads slower than a spinner, and we accepted that trade.\n\nWe opened with an interpretation of the upload\nWhy: instead of a blank prompt, because the hardest part was never generating; it was translating intent into something the model could act on.\nCost: the AI can guess wrong, so redirecting had to cost one click, not a restart.\n\nWe kept one input for templates and freeform\nWhy: testing showed people pick a template and then talk their way out of it mid task. A forced mode choice made them commit too early.\nCost: structured actions are less discoverable when they share a field with freeform chat.\n\nWe extended shadcn/ui instead of building bespoke chat components\nWhy: speed mattered, and everything needed to feed one shared library the dashboard already used.\nCost: less visual distinctiveness, in exchange for shipping patterns engineering could actually maintain.",
          image: "/CRM/Figma.webp",
          video: "/videos/Scene_no_watermark_hq.mp4",
          videoControls: false,
        },
        {
          id: "not-built",
          title: "Not built",
          description:
            "Some ideas were good; they were just not v1. Multi-user chat was scoped out on purpose. We needed to prove the happy path for a single creator before designing for teams in the same surface.\n\nWe dropped a separate templates mode once testing showed the pattern clearly: people pick a template, then talk their way out of it. A dedicated mode only formalized a transition that already happened in conversation.\n\nWe kept progress-only creation as the control in the study rather than shipping it, so the trust claim had something concrete to beat.",
        },
        {
          id: "prototype",
          title: "Prototype",
          description:
            "The prototype was not a walkthrough deck. It was React, built in Cursor, simulating real LLM latency and states. Engineering got working code instead of annotated frames, which meant the awkward states became real before they became tickets: thinking, typing, error loops, and the long pause when the model is still reading.",
          video: "/CRM/prototype.mp4",
          videoPoster: "/CRM/prototype-poster.webp",
        },
        {
          id: "validation",
          title: "Validation",
          description:
            "The cafe study compared a static form against the agent variant: five participants, two paths, one question. Does showing the work change what people trust before the output exists?\n\nIt did. Users trusted the agent variant more. The interview pause before generation created a sense of higher quality even when the video was not finished yet. Asking the right question up front bought credibility the output had not yet earned.\n\n82.5 mean SUS · 5 participants, cafe study · 2 variants tested\n\nStatic form against agent variant. Confidence and trust measured qualitatively, engagement and chat volume quantitatively, sentiment through an in product PostHog survey.",
          image: "/CRM/validation.webp",
        },
        {
          id: "system",
          title: "Design system",
          description:
            "Everything we learned went back into the library.\n\nWe built on shadcn/ui and extended it for chat: message and thinking states, prompt patterns, long conversation layout, content type variants. The dashboard and the creation tools stayed on one system so the product did not fork visually the moment you left the admin view.",
          image: "/CRM/shadcn-system.webp",
        },
        {
          id: "constraints",
          title: "Constraints",
          description:
            "Three pressures shaped every decision above. Model capability was moving under us. Patterns had to hold when the AI got better, not just at current quality.\n\nCompetitors shipped fast. We took what worked and ignored the decoration.\n\nTool and MCP integrations were coming, so the thinking view had to leave room for calls we had not built yet.",
        },
        {
          id: "shipped",
          title: "Shipped",
          description:
            "Engineering built from the prototype rather than a written spec. I opened the PR and it merged to main. The interface we tested was the interface that shipped.\n\nI left Nesoi in November, before post launch instrumentation matured, so the numbers here are pre ship.\n\nWhat I would have watched next: completion rate from upload to published video, and how often creators redirect on the first question. If the second number stayed low, the interpretation was doing its job.",
        },
      ],

      learnings: [
        "Embedded beats adjacent. Conversational AI only earns trust when it lives inside the workflow the user came for, not beside it.",
        "Enterprise users will trade speed for legibility. Show the reasoning and they let the AI do more.",
        "Trust is a UX problem before it is a model problem. The right first question buys credibility the output has not earned yet.",
      ],
      role: "Product Designer",
      team: "1 designer, 2 developers",
      tools: [
        "Figma",
        "Design systems",
        "shadcn/ui",
        "Prototyping in Cursor",
        "PostHog",
      ],
    },
    {
      title: "Falcon Design System",
      type: "Design System",
      company: "Ditto Insurance",
      period: "2022",
      url: "https://devadhathan.com/design-system3",
      role: "Interaction designer, UX researcher",
      tools: ["Figma", "Tailwind CSS", "Loom"],
      team: "Shreyans, Lokesh, Narasmiha, Vishnu, Sachin",
      cardSubtext: "Insurance Design System",
      description: `The Falcon Design System is a comprehensive, unified framework that brings consistency, efficiency, and accessibility to all our digital products. It provides a robust library of reusable UI components, a cohesive visual language, and clear design guidelines that streamline the creation of intuitive interfaces across multiple platforms.

Built on the principles of modularity and reusability, Falcon standardizes elements such as typography, color palettes, icons, and interactive components. This not only ensures a consistent brand experience but also accelerates product development by reducing redundancy. Thorough documentation and best practices foster effective collaboration among designers, developers, and stakeholders, enabling cohesive teamwork and faster iterations.`,
      problem: "How might we develop a unified design system that streamlines workflows, ensures consistent and accessible user experiences, and empowers cross-functional teams to rapidly iterate and innovate?",
      targetAudience: "Internal designers and developers who craft and implement digital interfaces, product managers and stakeholders who need to maintain alignment and a cohesive brand experience, cross-functional teams such as marketing, content, and customer support, as well as external partners and agencies looking for a consistent design language.",
      targetAudienceImage: {
        src: '/falcon design system/image copy 2.webp',
        alt: 'Falcon design system preview',
        caption: '3D icons created for the use cases.'
      },
      keyFeatureImage: {
        src: '/falcon design system/image copy.webp',
        alt: 'Falcon design system key feature modules',
        caption: 'Iconography, documentation, and component samples beside the tokens.'
      },
      impact: [
        "Enhanced Consistency: By implementing standardized UI elements and design patterns, Falcon ensures a unified brand experience that builds trust and clarity for users.",
        "Accelerated Development: The system’s comprehensive documentation and ready-to-use components have streamlined workflows, reducing design redundancies and speeding up product iterations.",
        "Improved Collaboration: A shared design language fosters better alignment between designers, developers, and stakeholders, promoting a seamless cross-functional workflow.",
        "Increased User Satisfaction: Consistent and accessible interfaces enhance the overall user experience, leading to improved engagement and a stronger digital presence."
      ],
      keyFeatures: ["Reusable components", "Typography system", "Color palettes", "Icons library", "Interactive components", "Accessibility compliance"],
      problemImage: {
        src: '/falcon design system/image copy.webp',
        alt: 'Falcon design system overview',
        caption: 'Design tools, tokens, and guidelines that make Falcon cohesive.'
      }
    },
    {
      title: "Finshots News App",
      type: "Mobile App Design",
      company: "Finshots",
      period: "2019-2020",
      url: "https://play.google.com/store/apps/details?id=com.finception.finshots.android&hl=en_GB",
      role: "Product Designer, UX Designer",
      tools: ["Adobe XD", "After Effects", "Illustrator", "Sketch", "Principle"],
      team: "Arif, Manoranjan, Lokesh",
      cardSubtext: "Financial news platform · founded 2019",
      description: "Finshots launched in 2019 as a financial news platform. Dev worked as a product designer and redesigned the mobile app into a centralized hub for financial news and insights, addressing fragmented content delivery across emails, social posts, and other channels.",
      problem: "Frequent readers of our financial content struggle to revisit old stories due to inefficient navigation on our website and in our emails. Endless scrolling and scattered content make it difficult for users to locate previously engaged stories, leading to frustration and decreased engagement. Feedback from social media and surveys indicates a strong demand for a more accessible, centralized platform that simplifies content discovery",
      research: "The journey began with a simple yet crucial question: Why are users struggling to stay engaged with Finshots' content, despite its growing popularity? We conducted a thorough analysis using: Google Play Store reviews, Social media feedback, Direct user queries. A clear theme emerged: Users loved the content but felt overwhelmed by its fragmented delivery across emails, social posts, and other channels. Revisiting or following up on valuable financial news was cumbersome due to a lack of centralized access. The issue wasn't about the quality of the content. It was about making it more accessible and intuitive to navigate.",
      hmw: "How might we design a centralized platform that provides an intuitive and seamless navigation experience, enabling users to easily explore and revisit financial stories?",
      keyFeatures: [
        "Navigation: A sleek, intuitive interface with categories, filters, and search options. Benefit - Users could effortlessly browse both recent and archived stories, saving time and making the content more accessible.",
        "Infographics: We introduced interactive infographics and tappable charts to simplify complex financial data, making it more accessible and engaging. Users could explore detailed breakdowns and key trends with a simple tap, enhancing their understanding. This subtle yet impactful feature improved user interactions and made data exploration seamless.",
        "Accessibility: We implemented accessibility features like adjustable font sizes and a dark mode to ensure a more inclusive experience. These options allowed users to tailor the interface to their preferences, making it comfortable for diverse needs. By prioritizing accessibility, we enhanced usability for everyone.",
        "Custom Notifications: We added a custom notification system that allowed users to set personalized alerts for key updates and deadlines. This feature ensured users received relevant information at the right time, improving engagement and helping them stay on top of important tasks effortlessly."
      ],
      results: [
        "The app gained overall 100k downloads in one year",
        "4.9 ratings on the Play Store",
        "Google Play's Best App of 2020 award",
        "500k+ subscribers achieved"
      ],
      learnings: "Working on Finshots was the pivotal project that pulled me into product design. Back in 2019, when UI/UX was still emerging, I had my first hands-on experience with Adobe XD. I dived into every aspect of the design process, from creating animations and onboarding illustrations to crafting icons and building complete UX flows. This early exposure revealed the transformative power of design and ignited my passion to further explore this field. Through Finshots, I learned that great design is more than just aesthetics; it's about crafting seamless, user-centric experiences that solve real problems. I embraced iterative design, continuously refining each element until it not only looked polished but also functioned flawlessly. This process underscored the importance of balancing creativity with practicality and taught me to always put the user's needs at the forefront. Finshots solidified my commitment to product design and set me on a path of continuous learning and innovation. It provided invaluable insights into the interplay between visual appeal and usability, insights that continue to shape my approach to creating products that truly resonate with users."
    },
    {
      title: "Onboarding Redesign",
      type: "UX Redesign",
      company: "Ditto Insurance",
      period: "2022",
      url: "https://devadhathan.com/ditto-onboarding",
      role: "Interaction designer, UX researcher",
      tools: ["Figma", "After effects", "Illustrator", "Amplitude", "Loom"],
      team: "Arif, Manoranjan, Lokesh",
      cardSubtext: "Ditto Customer Onboarding",
      description: `In 2022, Ditto Insurance, launched in 2021 as an insurance spin-off from Finshots, presented significant opportunities for improvement. Collaborating with my product manager, I reimagined the onboarding experience to reduce friction for new users. As a product designer, I leveraged data-driven insights and iterative design methods to pinpoint user pain points and develop tailored solutions that enhanced both functionality and user satisfaction.`,
      problem: `Users were dropping off before completing the slot booking process, resulting in low conversion rates. A major challenge was aligning our design solutions with the business goal of increasing conversions while maintaining a user-centric approach. Understanding the root causes of abandonment in a relatively new product required continuous collaboration across design, product, and technical teams.`,
      problemImage: {
        src: '/ditto insurance/image copy.webp',
        alt: 'Booking abandonment snapshot',
        caption: 'Users were abandoning the slot booking flow before completing their purchase.'
      },
      takeStepBack: `Rather than jumping into solutions, I first focused on understanding the problem. I analyzed analytics to identify where the major drop-offs occurred, spoke with customers, ran a cognitive walkthrough, and interviewed users to surface the right questions. These insights produced two personas, Ian, a marketing manager who needs support when preferred slots are unavailable, and Maaya, a 27-year-old teacher who wants assurance her phone number remains spam-free, helping us better understand pain points and refine our approach.`,
      approach: `We broke the onboarding experience into manageable problems, then addressed each one with targeted, data-backed solutions. For slot shortages, we introduced WhatsApp support, clear exit points, and guidance toward advisors when availability was constrained. To build trust, we iterated on badge, tooltip, and nudge concepts with policy writers, ultimately shipping a mobile-friendly nudge treatment that reinforced the “We never spam” promise. We also added confirmations and autosave prompts to prevent data loss when users accidentally left the flow.`,
      prototype: "Built interactive prototypes to validate the WhatsApp assistance flows, spam-free messaging, and error-prevention modals across mobile breakpoints.",
      prototypeFrame: "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2F7hcowr6VnLOewHm2ubJmZi%2FDitto-onboarding%3Fembed-host%3Dshare%26kind%3Dfile%26node-id%3D0-1%26page-selector%3D1%26theme%3Dlight%26version%3D2%26viewer%3D1",
      painPointsIntro: `We identified key problems in the onboarding journey and broke them down into bite-sized issues so we could tackle them individually.`,
      painPoints: [
        {
          title: "No error prevention",
          detail: "Customers frequently experienced accidental data loss because the flow lacked safeguards when they left the experience unknowingly."
        },
        {
          title: "Fear of spamming",
          detail: "Users hesitated to share phone numbers due to concerns about spam calls and uncertainty around how their data would be used."
        },
        {
          title: "No slots available",
          detail: "Advisor capacity limited users from booking desired time slots, leading to frustration and abandonment."
        }
      ],
      hmw: "How might we redesign the booking experience to proactively prevent user errors and accidental data loss, alleviate customers’ concerns about spam when sharing their phone numbers, and optimize advisor availability to ensure users can secure their desired time slots?",
      keyFeatures: [
        "Progress indicators to show booking status and reinforce progress",
        "Simplified slot booking with WhatsApp support and clear exit points when advisors are unavailable",
        "Trust-building copy paired with badges, tooltips, and nudges emphasizing a spam-free experience",
        "Error-prevention modals that confirm exit actions and keep work-in-progress intact",
        "Contextual notes, activity history, and tags to preserve lead context when ownership changes",
        "Optimized information architecture that keeps essential tools accessible",
        "Dynamic, role-aware dashboards for sales, support, and marketing teams"
      ],
      businessOpportunity: [
        "Safeguard Against Accidental Exits and Data Loss",
        "Increase Conversion Rates",
        "Lower Support Costs",
        "Assurance Against Spamming phone numbers",
        "Build Trust and Credibility",
        "Enhance Lead Quality",
        "Support When Preferred Slots Are Unavailable",
        "Maximize Sales Opportunities",
        "Improve Customer Satisfaction"
      ],
      explorations: [
        {
          tag: "Problem #1",
          title: "Users Unable to Reach Desired Time Slots",
          problem: "In the original workflow, advisor capacity limited users from booking their preferred slots and expanding the schedule wasn’t feasible.",
          solution: "We added WhatsApp support, clearer exit points, and proactive messaging that guided users toward alternative assistance when slots were full.",
          image: '/ditto insurance/1.webp'
        },
        {
          tag: "Problem #2",
          title: "Trust Issues with Sharing Phone Numbers",
          problem: "Users dropped off at the phone number stage because they feared spam calls, undermining the momentum of the flow.",
          solution: "Collaborating with policy writers, we emphasized ‘We never spam’ via badge, tooltip, and nudge treatments, ultimately shipping a mobile-friendly nudge design that reinforced this promise.",
          image: '/ditto insurance/2.webp'
        },
        {
          tag: "Problem #3",
          title: "Lost Data on Accidental Exit",
          problem: "Users were frustrated when accidental exits erased their progress, creating a counterintuitive experience.",
          solution: "We introduced confirmation pop-ups that preserved in-progress data and guided users to WhatsApp when slots were unavailable, preventing unexpected data loss.",
          image: '/ditto insurance/3.webp'
        }
      ],
      impactOverview: `The redesign had broad effects: Ditto now sees over one lakh monthly visitors, with around 600+ people booking through the portal on an average day. Thanks to the energy and passion of the team, we drove key business metrics upward.`,
      impact: [
        "Safeguarded against accidental exits and preserved customer progress",
        "Built trust and credibility through transparent communication about spam protection",
        "Delivered role-specific support and reporting to maximize sales and lead quality",
        "17% increase in conversion rates of health insurance premiums in 60 days, with ₹3cr+ in premiums sold",
        "5% increase in daily slot bookings (~500-600 slots per day)",
        "8% decrease in customer drop-off rates over 60 days"
      ],
      learnings: [
        "Takeaway 01: It's crucial to focus only on the data points that directly inform the solution. Data overload can obscure the problem and delay the decision-making process.",
        "Takeaway 02: Collaboration is key to success. Constant engagement with developers, product managers, and stakeholders ensured alignment and helped overcome challenges quickly.",
        "Takeaway 03: User testing is essential, even for small changes. Prototyping and gathering feedback early on helped refine the design and ensure we addressed real user pain points.",
        "Takeaway 04: Flexibility and adaptability in design are critical. Being open to change and adjusting to new constraints or insights is necessary to deliver the best possible solution."
      ],
      designGallery: [
        {
          src: '/ditto insurance/image.webp',
          title: 'Booking confirmation',
          description: 'Guided flows with progress indicators and WhatsApp assistance.'
        }
      ]
    },
    {
      title: "Sustainable Kiosk",
      type: "UX Design Project",
      institution: "Edinburgh Napier University",
      period: "January 2024",
      details: [
        "Conducted field research and user interviews to create personas and inform the kiosk's design.",
        "Developed a high-fidelity prototype and refined it through usability testing.",
        "Executed usability testing and evaluation to ensure a customer-centric solution."
      ]
    },
    {
      title: "Ditto Insurance CRM Design",
      slug: "crm-redesign",
      type: "Product Design",
      company: "Ditto Insurance",
      period: "July 2022 - December 2022",
      role: "Interaction designer, UX researcher, UX Designer",
      tools: ["Figma", "Google Docs", "After Effects", "Loom", "Miro"],
      team: '4 engineers, 1 product manager',
      cardSubtext: "Insurance CRM",
      description: `Over the course of four months, I partnered with the Ditto team to build a CRM that streamlined sales operations and delivered intuitive, actionable reporting. Ditto started as a no-spam insurance platform in 2021 with the goal of simplifying insurance selection across India, and the growing lead volume made it clear that the early Excel-based workflows needed a more scalable foundation.`,
      problem:
        'Advisors were losing momentum on every call, jumping between the CRM and Bliss to log outcomes, compare policies, and schedule follow-ups instead of staying with the customer.',
      hmw: 'How might we consolidate call tasks so advisors can complete them without breaking their momentum?',
      research:
        'As an advisor, I want to log outcomes and do the policy comparison without switching between CRM and Bliss, so that I can maintain my momentum and focus on engaging with customers.',
      impactOverview: '',
      impact: [
        'Role-specific interfaces reduced redundancy and kept teams focused on their priorities.',
        'Integrated messaging, email, and call tools centralized communication and removed friction.',
        'Real-time insights and dynamic visuals empowered decision-makers with fresh data.',
      ],
      designGallery: [],
      detailSections: [
        {
          id: 'possible-solutions',
          title: 'Possible solutions',
          description:
            "I ignored the existing UI and asked myself: what is the atomic unit of a sales call? I mapped the decision tree below. A single call isn't a linear path. It branches into five or six different outcomes like rescheduling, payments, or follow-ups.\n\nSolution A: Chain tasks inside the same flow\nTrigger the next task inside the CRM when an advisor completes one, instead of creating a fresh task every time and losing context.\n\nSolution B: Embed policy & meeting tools\nIntegrate the internal policy comparison tool and meeting links directly in the CRM interface so advisors never bounce to Bliss mid-call.",
          image: '/CRM/branching-logic.jpg',
        },
        {
          id: 'directions',
          title: 'Directions',
          description:
            'Direction 1: Modal popup (Old CRM)\nPros: Focused attention; common pattern.\nCons: Disrupts context, blocks lead history and notes, poor responsiveness on smaller screens.\n\nDirection 2: Sidebar panel (Selected)\nPros: Non-intrusive, slides in from the right; keeps lead context visible; scales across screen sizes; supports multitasking.',
          image: '/CRM/directions.jpg',
        },
        {
          id: 'decisions',
          title: 'Decisions',
          description:
            'Decision 1: Contextual sidebar\nSelected over modals.\nWhy: Advisors need to reference lead history and notes while updating task status.\nBenefit: A non-intrusive UI that preserves context and scales easily to mobile layouts.\n\nDecision 2: Smart branching logic\nSelected over manual entry.\nWhy: Immediate automation (call outcome → next task) prevents missed follow-ups.\nBenefit: Enforces best practices with required fields while still giving advisors agency to edit.',
        },
        {
          id: 'explorations',
          title: 'Exploring possibilities',
          description:
            'Two form layouts inside the sidebar: a single long page versus a stepped flow with a sticky bottom action. Neither shipped as-is. They informed how much to show per outcome.',
          image: '/CRM/exploration CRM.png',
        },
        {
          id: 'solution',
          title: 'Solution',
          description:
            'The contextual sidebar with smart branching: log the call outcome, see the next task surface automatically, and stay on the lead without leaving the CRM.',
          image: '/CRM/Problem CRM.png',
        },
        {
          id: 'adding-notes',
          title: 'Adding notes',
          description:
            'Notes keep a running record of comments and observations on each lead. When leads switch between advisors, notes carry the history forward.',
          video: '/CRM/Notes.mp4',
        },
        {
          id: 'my-tasks-lead-owner-change',
          title: 'My tasks & lead owner change',
          description:
            'Sales can be logged from the sales tab or when marking a payment task successful. Ops data pulls in automatically when an application number is entered.',
          video: '/CRM/leads.mp4',
        },
        {
          id: 'tags-for-leads',
          title: 'Tags for leads',
          description:
            'Tags identify, filter, and segment leads for campaigns, surfaced in lead details on every individual lead page.',
          video: '/CRM/Tags.mp4',
        },
      ],
    },
    {
      title: "Booking Portal Redesign",
      type: "UX Redesign",
      company: "Ditto Insurance",
      period: "2021-2022",
      description: "Led a full redesign of the booking portal using user research and the Double Diamond process. Focused on improving conversion rates and user experience.",
      problem: "Low conversion rates and high drop-off rates in the booking process.",
      approach: "Applied Double Diamond process: Discover (user research), Define (problem framing), Develop (prototyping), Deliver (testing and iteration).",
      keyFeatures: [
        "Simplified booking flow",
        "Clear progress indicators",
        "Improved form design",
        "Mobile-responsive design"
      ],
      results: [
        "17% increase in conversion rates",
        "WCAG 2.1 AA accessibility compliance",
        "Improved user satisfaction"
      ]
    }
  ],

  awards: [
    "Google Play's Best App of 2020 - Finshots"
  ],

  certifications: []
};
