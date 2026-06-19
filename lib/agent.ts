export type SectionPriority = 'high' | 'medium' | 'low' | 'hidden';
export type SectionType = 'hero' | 'about' | 'preferences' | 'experience' | 'contact' | 'philosophy' | 'projects' | 'skills' | 'education' | 'custom' | 'photos' | 'video';

export interface PortfolioSection {
  id: string;
  title: string;
  priority: SectionPriority;
  order: number;
  visible: boolean;
  type?: SectionType;
  description?: string;
  links?: Array<{ label: string; url: string }>;
  content?: string;
  placeholder?: boolean; // For sections that need content to be added later
  image?: string; // Single image URL or path for photo sections
  images?: string[]; // Array of images for carousel in photo sections
}

export interface AgentCommand {
  type: 'prioritize' | 'hide' | 'show' | 'reorder' | 'add' | 'remove' | 'generate';
  sectionId?: string;
  priority?: SectionPriority;
  order?: number;
  sectionType?: SectionType;
  title?: string;
  description?: string;
  content?: string;
  links?: Array<{ label: string; url: string }>;
  prompt?: string; // For generate command
  sections?: PortfolioSection[]; // For generate command - new sections to create
  image?: string; // Image URL or path for photo sections
  images?: string[]; // Array of images for carousel
}

export interface AgentState {
  sections: PortfolioSection[];
  recentCommands: AgentCommand[];
  originalSections?: PortfolioSection[]; // Store original sections for reset
  isCustomLayout?: boolean; // Track if we're in a custom generated layout
}

const defaultSections: PortfolioSection[] = [
  { id: 'hero', title: 'Hero Section', priority: 'high', order: 1, visible: true },
  { id: 'preferences', title: 'Design Preferences', priority: 'high', order: 2, visible: true },
  { id: 'photos', title: 'Camera Roll', priority: 'medium', order: 4, visible: true, type: 'photos' },
  { id: 'experience', title: 'Experience', priority: 'high', order: 5, visible: true },
  { id: 'video', title: 'Dew - AI Character', priority: 'medium', order: 6, visible: true, type: 'video', content: '/videos/2tUv4Phgglg0Cvb9dLfZYDnN1k.mp4', links: [{ label: 'Read on Medium', url: 'https://medium.com/@devadhathanmd18/why-ai-needs-a-face-building-dew-my-duolingo-inspired-ai-character-2d4e56f94772' }] },
  { id: 'philosophy', title: 'Design Philosophy', priority: 'medium', order: 7, visible: true },
  { id: 'connect', title: 'Connect', priority: 'medium', order: 8, visible: true, type: 'contact' },
  {
    id: 'last-portfolio-version',
    title: 'Last portfolio version',
    priority: 'low',
    order: 9,
    visible: true,
    type: 'custom',
    description: 'Revisit the previous Framer-hosted portfolio experience.',
    image: '/Old design/Old portfolio.png',
    links: [
      { label: 'Launch last version', url: 'https://devadhathan.framer.website' }
    ],
  },
];

export class PortfolioAgent {
  private state: AgentState;

  constructor() {
    this.state = {
      sections: [...defaultSections],
      recentCommands: [],
      originalSections: [...defaultSections], // Store original for reset
      isCustomLayout: false,
    };
  }

  executeCommand(command: AgentCommand): AgentState {
    const newState = { ...this.state };
    newState.recentCommands = [...this.state.recentCommands, command].slice(-10);

    switch (command.type) {
      case 'prioritize':
        if (command.sectionId && command.priority) {
          newState.sections = this.state.sections.map(section =>
            section.id === command.sectionId
              ? { ...section, priority: command.priority! }
              : section
          );
        }
        break;

      case 'hide':
        if (command.sectionId) {
          newState.sections = this.state.sections.map(section =>
            section.id === command.sectionId
              ? { ...section, visible: false, priority: 'hidden' }
              : section
          );
        }
        break;

      case 'show':
        if (command.sectionId) {
          newState.sections = this.state.sections.map(section =>
            section.id === command.sectionId
              ? { ...section, visible: true, priority: 'medium' }
              : section
          );
        }
        break;

      case 'reorder':
        if (command.sectionId && command.order !== undefined) {
          const targetOrder = command.order;
          const targetSection = this.state.sections.find(s => s.id === command.sectionId);
          
          if (targetSection && targetSection.order !== targetOrder) {
            const oldOrder = targetSection.order;
            const isMovingForward = targetOrder > oldOrder;
            
            // Update all section orders
            newState.sections = this.state.sections.map(section => {
              if (section.id === command.sectionId) {
                // Move target section to new position
                return { ...section, order: targetOrder };
              }
              
              // Adjust other sections' orders
              if (isMovingForward) {
                // Moving forward: shift sections between old and new position backward
                if (section.order > oldOrder && section.order <= targetOrder) {
                  return { ...section, order: section.order - 1 };
                }
              } else {
                // Moving backward: shift sections between new and old position forward
                if (section.order >= targetOrder && section.order < oldOrder) {
                  return { ...section, order: section.order + 1 };
                }
              }
              
              return section;
            });
          }
        }
        break;

      case 'add':
        if (command.title || command.sectionType) {
          const maxOrder = Math.max(...this.state.sections.map(s => s.order), 0);
          const sectionType = command.sectionType || 'custom';
          const sectionTitle = command.title || (sectionType === 'custom' ? 'New Section' : sectionType.charAt(0).toUpperCase() + sectionType.slice(1));
          const newId = command.sectionId || `${sectionType}-${Date.now()}`;
          
          const newSection: PortfolioSection = {
            id: newId,
            title: sectionTitle,
            priority: command.priority || 'medium',
            order: command.order !== undefined ? command.order : maxOrder + 1,
            visible: true,
            type: sectionType as SectionType,
            description: command.description,
            content: command.content,
            links: command.links,
            placeholder: !command.description && !command.content && !command.image,
            image: command.image,
            images: command.images,
          };
          
          // Add to the end of sections array
          newState.sections = [...this.state.sections, newSection];
        }
        break;

      case 'remove':
        if (command.sectionId) {
          newState.sections = this.state.sections.filter(section => section.id !== command.sectionId);
        }
        break;

      case 'generate':
        // Generate NEW sections based on prompt (ADD to existing, don't replace)
        // Also handles empty array case to hide default sections (for overview-only display)
        if (command.sections !== undefined) {
          console.log('Executing generate command with', command.sections.length, 'sections');
          
          // Store original sections if not already stored
          if (!newState.originalSections) {
            newState.originalSections = [...this.state.sections];
          }
          
          // Hide existing sections (but keep them for reset)
          const existingSections = newState.sections.map(s => ({ ...s, visible: false }));
          
          if (command.sections.length > 0) {
            // Add new sections with unique IDs and proper ordering
            const maxOrder = Math.max(...existingSections.map(s => s.order), 0);
            const newSections = command.sections.map((section, index) => ({
              ...section,
              id: section.id || `${section.type || 'custom'}-${Date.now()}-${index}`,
              order: maxOrder + index + 1,
              visible: true,
              placeholder: section.placeholder !== undefined ? section.placeholder : false,
            }));
            
            console.log('New sections to add:', newSections);
            
            // Combine: hidden original sections + new visible sections
            newState.sections = [...existingSections, ...newSections];
          } else {
            // Empty array: just hide existing sections (for overview-only display)
            newState.sections = existingSections;
          }
          
          newState.isCustomLayout = true;
          
          console.log('Total sections after generate:', newState.sections.length, 'Visible:', newState.sections.filter(s => s.visible).length);
        }
        break;
    }

    // Reorder sections based on priority and order
    newState.sections.sort((a, b) => {
      return a.order - b.order;
    });

    // Update internal state
    this.state = newState;
    
    // Debug: log state after execution
    console.log('Agent state updated:', {
      sectionsCount: newState.sections.length,
      sections: newState.sections.map(s => ({ id: s.id, title: s.title, visible: s.visible, order: s.order }))
    });
    
    return newState;
  }

  getState(): AgentState {
    return { ...this.state };
  }

  reset(): void {
    // Restore original sections if they exist, otherwise use defaults
    const sectionsToRestore = this.state.originalSections || [...defaultSections];
    this.state = {
      sections: sectionsToRestore.map(s => ({ ...s })),
      recentCommands: [],
      originalSections: sectionsToRestore,
      isCustomLayout: false,
    };
  }
}
