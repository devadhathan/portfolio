# Portfolio with Side Agent

A modern portfolio page built with Next.js, TypeScript, and shadcn/ui, featuring an intelligent side agent that allows you to dynamically customize and prioritize portfolio sections through natural language commands.

## Features

- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 🤖 **AI Agent** - Side agent that understands commands to customize your portfolio
- 📊 **Dynamic Prioritization** - Prioritize sections based on importance (high/medium/low)
- 🎛️ **Real-time Updates** - Changes reflect immediately in the portfolio layout
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm start
```

## Agent Commands

The side agent understands the following commands:

### Prioritize Sections
- `prioritize projects` - Set projects section to high priority
- `prioritize skills high` - Set skills to high priority
- `focus on about` - Focus on the about section

### Hide/Show Sections
- `hide education` - Hide the education section
- `show education` - Show the education section
- `remove contact` - Hide the contact section

### Reorder Sections
- `move projects to position 1` - Move projects to the first position
- `reorder skills to order 2` - Reorder skills section

## Project Structure

```
portfolio/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main portfolio page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── side-agent.tsx      # Agent component
│   └── portfolio-sections.tsx # Portfolio sections renderer
├── lib/
│   ├── agent.ts            # Agent logic and state management
│   └── utils.ts            # Utility functions
└── package.json
```

## Customization

You can customize the portfolio by:

1. **Modifying Default Sections** - Edit `lib/agent.ts` to change default sections
2. **Updating Section Content** - Modify `components/portfolio-sections.tsx` to change section content
3. **Adding New Commands** - Extend the `parseCommand` method in `lib/agent.ts`

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React Icons

## License

MIT



