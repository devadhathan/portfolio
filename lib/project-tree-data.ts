export type ProjectTreeNode = {
  id: string;
  label: string;
  /** Opens case study when set */
  projectId?: string;
  locked?: boolean;
  defaultOpen?: boolean;
  children?: ProjectTreeNode[];
};

/** Folder tree for the home bento "Projects & case studies" card. */
export const PROJECT_TREE: ProjectTreeNode[] = [
  {
    id: 'ditto',
    label: 'ditto',
    defaultOpen: true,
    children: [
      { id: 'onboarding-redesign', label: 'onboarding redesign', projectId: 'onboarding-redesign' },
      { id: 'falcon-design-system', label: 'falcon design system', projectId: 'falcon-design-system' },
      { id: 'crm-redesign', label: 'crm redesign', projectId: 'crm-redesign' },
      {
        id: 'finshots',
        label: 'finshots',
        defaultOpen: true,
        children: [
          { id: 'finshots-news-app', label: 'finshots news app', projectId: 'finshots-news-app' },
        ],
      },
    ],
  },
  {
    id: 'nesoi-ai',
    label: 'nesoi ai',
    defaultOpen: true,
    children: [
      { id: 'nesoi-ai-dashboard', label: 'nesoi dashboard', projectId: 'nesoi-ai-dashboard' },
    ],
  },
  {
    id: 'wordsmith-ai',
    label: 'wordsmith ai',
    defaultOpen: true,
    children: [
      { id: 'wordsmith-ai-locked', label: 'wordsmith case study', locked: true },
    ],
  },
];
