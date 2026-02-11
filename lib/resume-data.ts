export const resumeData = {
  name: "Devadhathan M D",
  email: "devadhathanmd18@gmail.com",
  website: "devadhathan.com",
  linkedin: "in/devadhathan/",
  phone: "+447388289392",

  experience: [
    {
      role: "Product Designer",
      company: "Nesoi.ai",
      period: "July 2025 - November 2025",
      achievements: [
        "Designed and shipped adviser/client-facing dashboards used by 15+ enterprise clients, enabling them to deliver interactive, AI-powered learning modules.",
        "Led iterative UX improvements and introduced reusable Figma components that improved engagement by 92% and reduced course-creation time by 37%.",
        "Developed scalable workflow and automation patterns, partnering closely with engineering to ensure consistent, reliable UI behaviour.",
        "Integrated WCAG 2.1 AA accessibility into component and template design, conducting audits and ensuring all patterns met regulatory requirements.",
        "Strengthened design-system foundations by documenting component behaviours, responsive rules, and accessibility guidelines."
      ]
    },
    {
      role: "Product Designer",
      company: "Ditto insurance",
      period: "November 2021 - December 2022",
      achievements: [
        "Led a full redesign of the booking portal using user research and the Double Diamond process, achieving a 17% increase in conversion.",
        "Created and standardized the Falcon Design System, defining components, tokens, interaction rules, reducing design-to-development time by 30%.",
        "Spearheaded the redesign of the internal CRM in an agile environment, improving team efficiency by 20%.",
        "Conducted and synthesised user research, analytics, and usability testing to refine system-level patterns."
      ]
    },
    {
      role: "UI/UX Designer",
      company: "Finshots",
      period: "August 2019 - October 2021",
      achievements: [
        "Designed mobile app and managed product ecosystem integration, delivering engaging, accessible solutions in a fintech context.",
        "Contributed to Google Play Best App award (2020).",
        "Collaborated with developers and writers to create engaging content and visuals, contributing to achieving 500k+ subscribers.",
        "Helped achieve 100,000+ downloads and 500K+ subscribers."
      ]
    }
  ],

  education: [
    {
      degree: "Master's in User Experience Design",
      institution: "Edinburgh Napier University",
      period: "2023 - 2024",
      details: "Studied under an academic scholarship. Focus on design thinking, human-centred design, prototyping, resilience, design reiteration, and usability testing."
    },
    {
      degree: "Bachelor of Computer Science Engineering",
      institution: "APJ Abdul Kalam University",
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
      period: "July 2025 - November 2025",
      description:
        "Nesoi.ai is an AI-powered learning platform used by Amazon, the University of Toronto, Bain & Company, and other large organizations. Teams rely on it to create interactive learning content, train employees, and improve knowledge retention.",
      cardSubtext: "AI chat-first creation experience",
      detailSections: [
        {
          id: "problem",
          title: "Problem",
          description:
            "Before this project, content creators could upload raw materials (documents, videos, slides) but turning that into engaging learning experiences was manual and time-consuming. There was no conversational way to collaborate with AI, no guided structure for shaping learning flows, and limited support for iterating on ideas, so creators spent effort on assembly instead of pedagogy and outcomes."
        },

        {
          id: "goals",
          title: "Goals",
          description:
            "The goal was to embed AI into the creation experience so it feels natural and collaborative, help creators explore, refine, and iterate conversationally instead of filling out rigid forms, and build on a scalable design system that spans dashboards, creation tools, and admin interfaces."
        },

        {
          id: "challenge",
          title: "Framing the challenge",
          description:
            "We reframed the work through How might we questions: enabling creators to converse with AI while building, supporting flexible exploration instead of strict wizards, and making AI feel like a learning partner rather than just a generator.",
          image: "/CRM/initial image.png"
        },

        {
          id: "chat-decision",
          title: "AI chat as the primary creation tool",
          description:
            "Introduced an AI chat interface embedded in the creation experience so creators always see both their material and the conversation. They can ask questions, request transformations, and refine outputs in natural language while the chat restructures, summarizes, and adapts content into learning flows, a familiar model that handles ambiguity better than fixed forms."
        },

        {
          id: "system",
          title: "System and component design",
          description:
            "System work was anchored on the Obra UI design system from Shadcn and customized for Nesoi needs, focusing on message bubbles with clear AI/user distinction plus loading and error states, input prompts that support structured templates and freeform prompts, and conversation layouts that handle long sessions while preserving orientation so patterns can be reused across dashboards, creation tools, and admin interfaces.",
          image: "/CRM/Figma.png"
        },

        {
          id: "workflows",
          title: "AI chat workflows",
          description:
            "Core flows covered initial exploration (AI greets creators after analysing assets), transforming content (simplifying, chaptering, or making content interactive via templates or freeform prompts), refining and iterating (structured suggestions with follow-up questions and alternative outputs), and multiple iterations (viewing and comparing versions without losing earlier drafts) under the principle that AI supports thinking without replacing it.",
          image: "/CRM/comparison.png"
        },

        {
          id: "constraints",
          title: "Constraints",
          description:
            "Evolving AI capabilities demanded flexible patterns, the product lacked any prior chat experience so we studied familiar tools such as Slack and ChatGPT for enterprise inspiration, and a tight timeline forced us to focus on the core happy path while deferring complex features like multi-user chat collaboration."
        },

        {
          id: "delivery",
          title: "Delivery and validation",
          description:
            "Delivered high-fidelity designs, a Figma library aligned with the design system, and developer-ready specs while sharing Obra UI customizations via GitHub and deploying a Vercel prototype for internal testing; feedback noted that chat felt natural, creators mixed templates and freeform prompts, iteration sped up to 3–4 refinement rounds per session, and the consistent system increased developer confidence, paving the way for client-facing pilots alongside future opportunities like saved prompt templates, multi-content comparison, and collaborative chat for teams.",
          image: "/CRM/validation.png"
        }
      ],

      learnings: [
        "Conversational AI lowers the barrier to creation when it is embedded directly into real workflows instead of isolated as a separate tool.",
        "Enterprise users want control and clarity; clear states, transparent behaviour, and safe iteration paths keep trust intact.",
        "Designing AI products depends on trust and UX patterns as much as it does on model capabilities."
      ],
      role: "Product Designer",
      tools: ["Figma", "Design Systems", "Accessibility Tools"]
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
        src: '/falcon design system/image copy 2.png',
        alt: 'Falcon design system preview',
        caption: '3D icons created for the use cases.'
      },
      keyFeatureImage: {
        src: '/falcon design system/image copy.png',
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
        src: '/falcon design system/image copy.png',
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
      cardSubtext: "Daily Financial News",
      description: "Redesigned the Finshots mobile app to provide a centralized platform for accessing financial news and insights. The app addresses the challenge of fragmented content delivery across emails, social posts, and other channels.",
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
      description: `In 2022, Ditto Insurance—an Indian startup launched in 2021—presented significant opportunities for improvement. Collaborating with my product manager, I reimagined the onboarding experience to reduce friction for new users. As a product designer, I leveraged data-driven insights and iterative design methods to pinpoint user pain points and develop tailored solutions that enhanced both functionality and user satisfaction.`,
      problem: `Users were dropping off before completing the slot booking process, resulting in low conversion rates. A major challenge was aligning our design solutions with the business goal of increasing conversions while maintaining a user-centric approach. Understanding the root causes of abandonment in a relatively new product required continuous collaboration across design, product, and technical teams.`,
      problemImage: {
        src: '/ditto insurance/image copy.png',
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
          image: '/ditto insurance/1.png'
        },
        {
          tag: "Problem #2",
          title: "Trust Issues with Sharing Phone Numbers",
          problem: "Users dropped off at the phone number stage because they feared spam calls, undermining the momentum of the flow.",
          solution: "Collaborating with policy writers, we emphasized ‘We never spam’ via badge, tooltip, and nudge treatments, ultimately shipping a mobile-friendly nudge design that reinforced this promise.",
          image: '/ditto insurance/2.png'
        },
        {
          tag: "Problem #3",
          title: "Lost Data on Accidental Exit",
          problem: "Users were frustrated when accidental exits erased their progress, creating a counterintuitive experience.",
          solution: "We introduced confirmation pop-ups that preserved in-progress data and guided users to WhatsApp when slots were unavailable, preventing unexpected data loss.",
          image: '/ditto insurance/3.png'
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
          src: '/ditto insurance/image.png',
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
      approach: `Based on user feedback, I envisioned a CRM built for seamless usability, role-specific dashboards, personalized workflows, and integrated communication tools. The redesign prioritized streamlined navigation, centralized communications, and dashboards that surfaced the right data for each role.`,
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
          src: '/CRM/image.png',
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

  certifications: [
    "Google UX Design Professional Certificate",
    "IBM Design Thinking Practitioner"
  ]
};
