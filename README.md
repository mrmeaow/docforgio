# Folio — Open Document Studio

A free, open-source, browser-native document composition studio.

## Overview

Folio runs entirely in the browser with zero backend infrastructure. All data lives in **IndexedDB**, portable via export at any time.

The core experience is a **split-pane editor**: a visual no-code block editor on the left and a live-rendered preview on the right. Advanced users can flip to **Code Mode** — a full HTML/CSS editor with Tailwind v4 support.

## Tech Stack

- **Build Tool:** Vite 8
- **Framework:** React 19
- **CSS Framework:** Tailwind CSS v4
- **State Management:** Zustand
- **IndexedDB:** idb
- **Code Editor:** CodeMirror 6
- **Drag & Drop:** dnd-kit
- **Routing:** React Router v7
- **Testing:** Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm 10+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Project Structure

```
folio/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared UI components
│   │   ├── editor/      # Editor components
│   │   ├── preview/     # Preview components
│   │   ├── templates/   # Template components
│   │   ├── modals/      # Modal dialogs
│   │   └── layout/      # Layout components
│   ├── pages/           # Page components
│   ├── stores/          # Zustand stores
│   ├── db/              # IndexedDB schema & operations
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── templates/       # Template definitions
│   ├── styles/          # CSS styles
│   ├── test/            # Test setup
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── PLAN.md              # Product requirements document
```

## Features (MVP Roadmap)

### Sprint S-01: Foundation ✅
- Vite + React 19 + Tailwind CSS v4 scaffold
- Zustand stores
- IndexedDB schema
- Home screen with document CRUD

### Sprint S-02: Block Engine
- Block tree data model
- Heading, Paragraph, Divider, List, Callout blocks
- Properties panel
- Undo/redo stack

### Sprint S-03: Block Engine Extended
- Image, Table, Code, Columns, PageBreak, Cover, HTML blocks
- Drag-and-drop reordering
- Slash menu for block insertion

### Sprint S-04: Code Mode
- CodeMirror 6 integration
- HTML/CSS/Head tabs
- Bidirectional No-Code ↔ Code mode switching

### Sprint S-05: Preview
- iframe srcdoc renderer
- Tailwind CSS v4 CDN injection
- Web/Page/Print preview modes
- Zoom controls

### Sprint S-06: Export Engine
- HTML single-file export
- PDF via Print API
- Markdown export
- JSON backup

### Sprint S-07-08: Templates
- 15+ bundled templates
- Template picker
- Template Builder
- .folio file format

### Sprint S-09: Polish
- Command palette (Cmd+K)
- Keyboard shortcuts
- PWA / Service Worker

### Sprint S-10: Launch
- E2E tests
- Accessibility audit
- Documentation

## Data Models

All user data lives in IndexedDB with four object stores:

- **documents** — User documents with blocks, CSS, settings
- **templates** — Built-in, user, and community templates
- **assets** — Uploaded images and files
- **settings** — App preferences

## License

MIT License — See [LICENSE](LICENSE) for details.

All bundled templates are released under CC0 1.0 (public domain).

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test && pnpm test:e2e`
5. Submit a PR

## Community Templates

Submit your custom templates via PR to the `/community-templates` directory. See `TEMPLATE_GUIDE.md` (coming soon) for authoring instructions.
