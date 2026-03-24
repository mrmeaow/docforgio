# DocForgio — Open Document Studio

A free, open-source, browser-native document composition studio.

## Overview

DocForgio runs entirely in the browser with zero backend infrastructure. All data lives in **IndexedDB**, portable via export at any time.

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

> [!NOTE]
> Tests are not configured properly

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test && pnpm test:e2e`
5. Submit a PR

## Community Templates

> [!NOTE]
> This part is not ready yet. W.I.P

Submit your custom templates via PR to the `/community-templates` directory. See `TEMPLATE_GUIDE.md` (coming soon) for authoring instructions.
