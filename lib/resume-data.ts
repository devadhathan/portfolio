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
      company: "Nesoi.ai",
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
      title: "Nesoi.ai Dashboard",
      type: "Product Design",
      company: "Nesoi.ai",
      period: "July to November 2025",
      description:
        "Nesoi turns internal material into interactive training. I redesigned the creation experience so the AI reads your upload, proposes a plan, and shows its work.\n\nNesoi is an AI learning platform running across 15 enterprise deployments, including Amazon, the University of Toronto and Bain & Company. I led the creation experience end to end, from framing through a working React prototype that engineering built from.",
      cardSubtext: "Raw file to finished video, in two moves.",
      problem:
        "V1 made the creator do the thinking.\n\nPeople arrive to turn a document, deck or video into an interactive learning video. Everything else is overhead. V1 asked them to upload, configure, wait and hope. The AI sat off to the side, treated as a novelty rather than the fastest path.\n\nThe closest competitor had the same gap. Plenty of status, no reasoning.",
      hmw: "Fewer decisions than doing it by hand, not more.",
      approach:
        "That moved the target from an interface to a partner. Something that reads the upload, forms a view, proposes it, and shows its work.",
      detailSections: [
        {
          id: "decisions",
          title: "Decisions, why, and what they cost",
          description:
            "Surface the AI's reasoning while it works\nWhy: instead of progress states only, so people catch a wrong read early, not after the output is done.\nCost: perceived speed. Visible thinking reads slower than a spinner.\n\nOpen with an interpretation of the upload\nWhy: instead of a blank prompt. Removes the translation work of figuring out what to ask.\nCost: the AI can guess wrong, so redirecting had to be cheap enough that a wrong guess costs one click.\n\nOne input for templates and freeform\nWhy: instead of separate modes. People switch mid task, and a forced mode choice makes them commit too early.\nCost: structured actions are less discoverable when they share a field.\n\nExtend shadcn/ui\nWhy: instead of building bespoke chat components. Faster, and everything fed one shared library.\nCost: less visual distinctiveness, in exchange for speed.",
        },
        {
          id: "system-video",
          title: "System",
          description: "",
          video: "/videos/Scene_no_watermark_hq.mp4",
          videoControls: false,
        },
        {
          id: "not-built",
          title: "Not built",
          description:
            "Multi user chat. Scoped out of v1 on purpose. Prove the happy path before designing for teams.\n\nA separate templates mode. Dropped once testing showed people pick a template and then talk their way out of it.\n\nProgress only creation. Kept as the control in the study rather than shipped, so the trust claim had something to beat.",
        },
        {
          id: "validation",
          title: "Validation",
          description:
            "Users trusted the agent variant more. The interview pause created a sense of higher quality before generation even started.\n\nAsking the right question up front bought credibility the output had not yet earned.\n\n82.5 mean SUS · 5 participants, cafe study · 2 variants tested\n\nStatic form against agent variant. Confidence and trust measured qualitatively, engagement and chat volume quantitatively, sentiment through an in product PostHog survey.",
          image: "/CRM/validation.webp",
        },
        {
          id: "prototype",
          title: "Prototype",
          description:
            "The prototype was React, built in Cursor, simulating real LLM latency and states. Engineering got working code instead of a walkthrough, which cleared the hard states before they became tickets: thinking, typing, error loops.",
          video: "/CRM/prototype.mp4",
          videoPoster: "/CRM/prototype-poster.webp",
        },
        {
          id: "system",
          title: "System",
          description:
            "Everything went back into the library.\n\nBuilt on shadcn/ui and extended for chat: message and thinking states, prompt patterns, long conversation layout, content type variants. The dashboard and the creation tools stayed on one system.",
          image: "/CRM/Figma.webp",
        },
        {
          id: "constraints",
          title: "Constraints",
          description:
            "Model capability was moving under us. Patterns had to hold when the AI got better, not just at current quality.\n\nCompetitors shipped fast. We took what worked and ignored the decoration.\n\nTool and MCP integrations were coming. The thinking view left room for calls we had not built yet.",
        },
        {
          id: "shipped",
          title: "Shipped",
          description:
            "Engineering built from the prototype rather than a written spec. I created the PR and it was finally merged to main.\n\nI left Nesoi in November, before post launch instrumentation matured, so the numbers here are pre ship.\n\nWhat I would have watched: completion rate from upload to published video, and how often creators redirect on the first question. If the second number stayed low, the interpretation was doing its job.",
        },
      ],

      learnings: [
        "Embedded beats adjacent. Conversational AI only helps when it lives inside the workflow the user came for.",
        "Enterprise users will trade speed for legibility. Show the reasoning and they let the AI do more.",
        "Trust is a UX problem before it is a model problem.",
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
      description: "Finshots launched in 2019 as a financial news platform. Dev worked as a product designer and redesigned the mobile app into a centralized hub for financial news and insights — addressing fragmented content delivery across emails, social posts, and other channels.",
      problem: "Frequent readers of our financial content struggle to revisit old stories due to inefficient navigation on our website and in our emails. Endless scrolling and scattered content make it difficult for users to locate previously engaged stories, leading to frustration and decreased engagement. Feedback from social media and surveys indicates a strong demand for a more accessible, centralized platform that simplifies content discovery",
      research: "The journey began with a simple yet crucial question: Why are users struggling to stay engaged with Finshots' content, despite its growing popularity? We conducted a thorough analysis using: Google Play Store reviews, Social media feedback, Direct user queries. A clear theme emerged: Users loved the content but felt overwhelmed by its fragmented delivery across emails, social posts, and other channels. Revisiting or following up on valuable financial news was cumbersome due to a lack of centralized access. The issue wasn't about the quality of the content—it was about making it more accessible and intuitive to navigate.",
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
      learnings: "Working on Finshots was the pivotal project that pulled me into product design. Back in 2019, when UI/UX was still emerging, I had my first hands-on experience with Adobe XD. I dived into every aspect of the design process—from creating animations and onboarding illustrations to crafting icons and building complete UX flows. This early exposure revealed the transformative power of design and ignited my passion to further explore this field. Through Finshots, I learned that great design is more than just aesthetics; it's about crafting seamless, user-centric experiences that solve real problems. I embraced iterative design, continuously refining each element until it not only looked polished but also functioned flawlessly. This process underscored the importance of balancing creativity with practicality and taught me to always put the user's needs at the forefront. Finshots solidified my commitment to product design and set me on a path of continuous learning and innovation. It provided invaluable insights into the interplay between visual appeal and usability—insights that continue to shape my approach to creating products that truly resonate with users."
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
      description: `In 2022, Ditto Insurance — launched in 2021 as an insurance spin-off from Finshots — presented significant opportunities for improvement. Collaborating with my product manager, I reimagined the onboarding experience to reduce friction for new users. As a product designer, I leveraged data-driven insights and iterative design methods to pinpoint user pain points and develop tailored solutions that enhanced both functionality and user satisfaction.`,
      problem: `Users were dropping off before completing the slot booking process, resulting in low conversion rates. A major challenge was aligning our design solutions with the business goal of increasing conversions while maintaining a user-centric approach. Understanding the root causes of abandonment in a relatively new product required continuous collaboration across design, product, and technical teams.`,
      problemImage: {
        src: '/ditto insurance/image copy.webp',
        alt: 'Booking abandonment snapshot',
        caption: 'Users were abandoning the slot booking flow before completing their purchase.'
      },
      takeStepBack: `Rather than jumping into solutions, I first focused on understanding the problem. I analyzed analytics to identify where the major drop-offs occurred, spoke with customers, ran a cognitive walkthrough, and interviewed users to surface the right questions. These insights produced two personas—Ian, a marketing manager who needs support when preferred slots are unavailable, and Maaya, a 27-year-old teacher who wants assurance her phone number remains spam-free—helping us better understand pain points and refine our approach.`,
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
      title: "CRM Redesign",
      type: "Product Design",
      company: "Ditto Insurance",
      period: "July 2022 - December 2022",
      role: "Interaction designer, UX researcher, UX Designer",
      tools: ["Figma", "Google Docs", "After Effects", "Loom", "Miro"],
      team: "Arif, Lokesh, Shreyans, Sachin, Shaily",
      cardSubtext: "Insurance CRM",
      description: `Over the course of four months, I partnered with the Ditto team to build a CRM that streamlined sales operations and delivered intuitive, actionable reporting. Ditto started as a no-spam insurance platform in 2021 with the goal of simplifying insurance selection across India, and the growing lead volume made it clear that the early Excel-based workflows needed a more scalable foundation.`,
      problem: "Manual lead tracking with Excel became unsustainable as the lead volume increased, and the existing CRM lacked role-specific workflows, real-time insight, and a cohesive, customizable interface.",
      approach: `Based on user feedback, we envisioned a CRM built for seamless usability, role-specific dashboards, personalized workflows, and integrated communication tools. The redesign prioritized streamlined navigation, centralized communications, and dashboards that surfaced the right data for each role.`,
      detailSections: [
        {
          id: 'adding-notes',
          title: 'Adding notes',
          description: `Notes are used to keep a record of any comments, or observations that the user would have relating to that particular lead. Users will be able to keep track of how a sale is progressing. When leads are switched between advisors, notes help the new advisor in understanding the lead’s history and requirements.`,
          video: '/CRM/Notes.mp4'
        },
        {
          id: 'my-tasks-lead-owner-change',
          title: 'My Tasks & Lead owner change',
          description: `Adding a sale is possible from the Sales Tab also (apart from when marking a payment task successful and on the leads page). The sales form is opened on the right-side panel. For sales done through Ditto links, the user needs to enter only the application number. On clicking the ‘Get Details’ button, all the policy details will be shown in the subsequent fields. This is fetched from the ops portal. This is possible if that policy number is still unclaimed by any advisor.`,
          video: '/CRM/leads.mp4'
        },
        {
          id: 'tags-for-leads',
          title: 'Tags for Leads',
          description: `Tags are identifiers, that can be added to leads. This lets the user identify, filter/segment and target leads with campaigns. The tags section is present on the bottom right side as part of the lead details on the individual lead pages.`,
          video: '/CRM/Tags.mp4'
        }
      ],
      targetAudience: "Internal teams responsible for customer relationships—sales, support, account management—and strategic leaders who need reporting, plus partners who require a unified platform for customer engagement.",
      impact: [
        "Role-specific interfaces reduced redundancy and kept teams focused on their priorities.",
        "Integrated messaging, email, and call tools centralized communication and removed friction.",
        "Real-time insights and dynamic visuals empowered decision-makers with fresh data."
      ],
      keyFeatures: [
        "Role-specific workflows with tailored dashboards for sales, support, and management",
        "Integrated messaging, email, and call tools that keep communication in one place",
        "Personalized dashboards, filters, and notifications to fit individual preferences",
        "Optimized navigation and information architecture for quick access",
        "Dynamic charts and real-time insights for faster decision-making",
        "Activity history and note-taking to preserve conversational context",
        "Lead tagging for segmentation, filtering, and campaign targeting"
      ],
      results: [
        "Streamlined communication and coordination across the sales organization",
        "Faster onboarding for new advisors with clear activity histories and tags",
        "Data-rich dashboards increased confidence in reporting and daily decisions"
      ],
      designGallery: [
        {
          src: '/CRM/image.webp',
          title: 'CRM dashboard',
          description: 'Role-aware dashboards and tagging for leads.'
        }
      ]
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
