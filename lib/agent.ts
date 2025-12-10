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
  { id: 'about', title: 'About Me', priority: 'high', order: 2, visible: true },
  { id: 'preferences', title: 'Design Preferences', priority: 'high', order: 3, visible: true },
  { id: 'experience', title: 'Experience', priority: 'high', order: 4, visible: true },
  { id: 'photos', title: 'Camera Roll', priority: 'medium', order: 5, visible: true, type: 'photos' },
  { id: 'video', title: 'Dew - AI Character', priority: 'medium', order: 6, visible: true, type: 'video', content: '/videos/2tUv4Phgglg0Cvb9dLfZYDnN1k.mp4', links: [{ label: 'Read on Medium', url: 'https://medium.com/@devadhathanmd18/why-ai-needs-a-face-building-dew-my-duolingo-inspired-ai-character-2d4e56f94772' }] },
  { id: 'philosophy', title: 'Design Philosophy', priority: 'medium', order: 7, visible: true },
  { id: 'contact', title: 'Contact & Links', priority: 'medium', order: 8, visible: true },
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
        if (command.sections && command.sections.length > 0) {
          console.log('Executing generate command with', command.sections.length, 'sections');
          
          // Store original sections if not already stored
          if (!newState.originalSections) {
            newState.originalSections = [...this.state.sections];
          }
          
          // Hide existing sections (but keep them for reset)
          const existingSections = newState.sections.map(s => ({ ...s, visible: false }));
          
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

  parseCommand(input: string): AgentCommand | null {
    const lowerInput = input.toLowerCase().trim();

    // Prioritize commands
    if (lowerInput.includes('prioritize') || lowerInput.includes('focus on')) {
      const sectionId = this.findSectionId(lowerInput);
      const priority = lowerInput.includes('high') ? 'high' :
                      lowerInput.includes('low') ? 'low' : 'medium';
      if (sectionId) {
        return { type: 'prioritize', sectionId, priority };
      }
    }

    // Hide commands
    if (lowerInput.includes('hide') || lowerInput.includes('remove')) {
      const sectionId = this.findSectionId(lowerInput);
      if (sectionId) {
        return { type: 'hide', sectionId };
      }
    }

    // Show commands
    if (lowerInput.includes('show') || lowerInput.includes('display')) {
      const sectionId = this.findSectionId(lowerInput);
      if (sectionId) {
        return { type: 'show', sectionId };
      }
    }

    // Reorder commands
    if (lowerInput.includes('move') || lowerInput.includes('reorder')) {
      const sectionId = this.findSectionId(lowerInput);
      const orderMatch = lowerInput.match(/order\s+(\d+)|position\s+(\d+)|to\s+position\s+(\d+)/);
      const order = orderMatch ? parseInt(orderMatch[1] || orderMatch[2] || orderMatch[3]) : undefined;
      if (sectionId && order) {
        return { type: 'reorder', sectionId, order };
      }
    }

    // Add new section commands - improved parsing
    if (lowerInput.includes('add') || lowerInput.includes('create') || lowerInput.includes('new') || lowerInput.includes('make')) {
      const sectionType = this.findSectionType(lowerInput);
      
      // Try to extract title from various patterns
      let title: string | undefined;
      
      // Check for explicit titles first
      const explicitTitlePatterns = [
        /called\s+["']?([^"'\s]+(?:\s+[^"'\s]+)*)["']?/i,
        /titled\s+["']?([^"'\s]+(?:\s+[^"'\s]+)*)["']?/i,
        /named\s+["']?([^"'\s]+(?:\s+[^"'\s]+)*)["']?/i,
        /"([^"]+)"/,
        /'([^']+)'/,
      ];
      
      for (const pattern of explicitTitlePatterns) {
        const match = lowerInput.match(pattern);
        if (match && match[1]) {
          title = match[1].trim();
          break;
        }
      }
      
      // If no explicit title, extract from command structure
      if (!title) {
        // Patterns like "add projects", "add a projects section", "create skills"
        const commandPatterns = [
          /(?:add|create|make|new)\s+(?:a|an|new)?\s*(?:section\s+)?(?:called|titled|named)?\s*([a-z]+(?:\s+[a-z]+)*)/i,
        ];
        
        for (const pattern of commandPatterns) {
          const match = lowerInput.match(pattern);
          if (match && match[1]) {
            const extracted = match[1].trim();
            // Don't use common words as titles
            if (!['section', 'a', 'an', 'new', 'add', 'create', 'make'].includes(extracted.toLowerCase())) {
              title = extracted;
              break;
            }
          }
        }
      }
      
      // If still no title, use section type or a sensible default
      if (!title) {
        if (sectionType) {
          // Capitalize section type properly
          title = sectionType === 'projects' ? 'Projects' :
                  sectionType === 'skills' ? 'Skills' :
                  sectionType === 'education' ? 'Education' :
                  sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
        } else {
          // Extract any word after add/create/new
          const wordMatch = lowerInput.match(/(?:add|create|new|make)\s+(?:a|an)?\s*([a-z]+)/i);
          if (wordMatch && wordMatch[1] && wordMatch[1] !== 'section') {
            title = wordMatch[1].charAt(0).toUpperCase() + wordMatch[1].slice(1);
          } else {
            title = 'New Section';
          }
        }
      }
      
      return {
        type: 'add',
        sectionType: sectionType || 'custom',
        title: title,
        priority: lowerInput.includes('high') ? 'high' : lowerInput.includes('low') ? 'low' : 'medium',
      };
    }

    // Remove section commands
    if (lowerInput.includes('remove') || lowerInput.includes('delete')) {
      const sectionId = this.findSectionId(lowerInput);
      if (sectionId) {
        return { type: 'remove', sectionId };
      }
    }

    return null;
  }

  private findSectionType(input: string): SectionType | null {
    const typeKeywords: { [key: string]: SectionType } = {
      'project': 'projects',
      'projects': 'projects',
      'portfolio': 'projects',
      'work': 'projects',
      'case study': 'projects',
      'case studies': 'projects',
      'skill': 'skills',
      'skills': 'skills',
      'technology': 'skills',
      'tech': 'skills',
      'tools': 'skills',
      'education': 'education',
      'degree': 'education',
      'learning': 'education',
      'school': 'education',
      'academic': 'education',
      'photo': 'photos',
      'photos': 'photos',
      'image': 'photos',
      'images': 'photos',
      'picture': 'photos',
      'pictures': 'photos',
      'gallery': 'photos',
      'custom': 'custom',
    };

    // Check for exact matches first (longer strings first)
    const sortedKeywords = Object.keys(typeKeywords).sort((a, b) => b.length - a.length);
    for (const keyword of sortedKeywords) {
      if (input.includes(keyword)) {
        return typeKeywords[keyword];
      }
    }

    return null;
  }

  private findSectionId(input: string): string | null {
    const sectionKeywords: { [key: string]: string } = {
      'hero': 'hero',
      'about': 'about',
      'philosophy': 'philosophy',
      'design philosophy': 'philosophy',
      'preference': 'preferences',
      'preferences': 'preferences',
      'graph': 'preferences',
      'experience': 'experience',
      'contact': 'contact',
      'link': 'contact',
      'project': 'projects',
      'projects': 'projects',
      'skill': 'skills',
      'skills': 'skills',
      'education': 'education',
    };

    for (const [keyword, sectionId] of Object.entries(sectionKeywords)) {
      if (input.includes(keyword)) {
        return sectionId;
      }
    }

    // Try to find by ID in the current state
    for (const section of this.state.sections) {
      if (input.includes(section.id.toLowerCase()) || input.includes(section.title.toLowerCase())) {
        return section.id;
      }
    }

    return null;
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

  // Helper method to add photo sections
  addPhotoSections(photos: Array<{ title: string; image?: string; images?: string[]; description?: string }>): void {
    const maxOrder = Math.max(...this.state.sections.map(s => s.order), 0);
    const newPhotoSections: PortfolioSection[] = photos.map((photo, index) => ({
      id: `photo-${Date.now()}-${index}`,
      title: photo.title,
      priority: 'high' as SectionPriority,
      order: maxOrder + index + 1,
      visible: true,
      type: 'photos' as SectionType,
      description: photo.description,
      image: photo.image,
      images: photo.images || (photo.image ? [photo.image] : []),
      placeholder: !photo.image && (!photo.images || photo.images.length === 0),
    }));

    this.state.sections = [...this.state.sections, ...newPhotoSections];
    // Update original sections to include photos
    if (!this.state.originalSections) {
      this.state.originalSections = [...defaultSections];
    }
    this.state.originalSections = [...this.state.originalSections, ...newPhotoSections];
  }
}

