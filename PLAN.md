# Folio — Open Document Studio · PRD & SRS v0.1

§ 01 Executive Summary
----------------------

**Folio** is a free, open-source, browser-native document composition studio. It runs entirely in the browser with zero backend infrastructure — no accounts, no servers, no subscriptions. All data lives in **IndexedDB**, portable via export at any time.

The core experience is a **split-pane editor**: a visual no-code block editor on the left and a live-rendered preview on the right. Advanced users can flip to **Code Mode** — a full HTML/CSS editor with Tailwind v4 support — at any point without losing work. The two modes are fully bidirectional.

Folio ships with **15+ professional-grade templates** spanning product documents, academic papers, legal instruments, screenplays, résumés, and more. A built-in **Template Builder** lets users design and package custom templates, exportable as `.folio` files for sharing with teams or the open-source community.

> Imagine Notion's editor composability, combined with the export fidelity of a desktop publishing tool — running entirely in your browser tab, free, forever.

**Target users:** indie developers, startup product teams, academics, freelancers, legal professionals, and anyone who needs polished, printable documents without a SaaS subscription or proprietary lock-in.

§ 02 Problem Statement & Market Context
---------------------------------------

2.1 The Document Tool Landscape is Broken for Indie Users
---------------------------------------------------------

Creating professional, design-quality documents today forces users into one of three painful buckets:

🔒 Locked in SaaS

Notion, Coda, Confluence — powerful but require accounts, internet, subscriptions. Data is vendor-held. Export quality is poor. Custom styling is severely limited.

📄 Desktop-bound

MS Word, Adobe InDesign, LaTeX — powerful but require installs, licenses, or steep learning curves. No instant web sharing. Formatting is opaque.

🧩 Code-only

Pandoc, raw HTML/CSS — maximum fidelity but zero accessibility for non-developers. No WYSIWYG. Template sharing is ad-hoc and fragile.

📤 Weak exports

Most browser-based tools export PDFs that look nothing like the screen preview, strip custom fonts, break page layouts, and offer zero page-size or margin control.

2.2 Who Needs Folio
-------------------



* User Segment: Product Managers
  * Current Tool: Notion / Google Docs
  * Pain: Zero design control; PRDs look generic
  * Folio Benefit: Pro templates + live HTML export
* User Segment: Indie Developers
  * Current Tool: Markdown + raw HTML
  * Pain: Time-consuming; no visual feedback
  * Folio Benefit: Code mode with live preview
* User Segment: Students / Academics
  * Current Tool: Word / LaTeX
  * Pain: LaTeX complexity; Word formatting breaks
  * Folio Benefit: APA/MLA templates, clean PDF output
* User Segment: Screenwriters
  * Current Tool: Final Draft ($250/yr)
  * Pain: Expensive; web sharing is poor
  * Folio Benefit: Free screenplay template + HTML export
* User Segment: HR / Legal Teams
  * Current Tool: Word + PDF converters
  * Pain: Broken formatting; manual reformatting
  * Folio Benefit: Legal/contract templates, precise PDF
* User Segment: Community Builders
  * Current Tool: Canva / Figma
  * Pain: Not text-document-native
  * Folio Benefit: Template marketplace via .folio files


2.3 Why Now
-----------

Three converging factors make this the right moment: **(1)** Browser APIs (IndexedDB, File System Access, Print API, CSS Paged Media) are mature enough to replicate desktop app fidelity. **(2)** Tailwind CSS v4's pure-CSS engine removes the Node.js compilation requirement, enabling real-time in-browser Tailwind class support for the first time. **(3)** The open-source community has an unmet appetite for free, self-hostable document tooling — evidenced by explosive growth in tools like Penpot, Docusaurus, and mdBook.

§ 03 User Personas
------------------



* Persona: Priya, PM
  * Role: Senior PM at a Series A startup
  * Technical Level: Non-technical
  * Primary Use Case: PRDs, SRS docs, sprint briefs
  * Must-Have: No-code editor, pro PRD/SRS template, PDF export
* Persona: Kenji, Dev
  * Role: Indie developer / OSS contributor
  * Technical Level: Expert
  * Primary Use Case: Technical specs, architecture docs
  * Must-Have: Code mode, Tailwind v4, Git-exportable JSON
* Persona: Amara, PhD
  * Role: Doctoral researcher, Social Sciences
  * Technical Level: Moderate
  * Primary Use Case: Research papers, theses, citations
  * Must-Have: APA template, footnotes, table of contents
* Persona: Leo, Writer
  * Role: Freelance screenwriter
  * Technical Level: Low
  * Primary Use Case: Feature screenplays, TV pilots
  * Must-Have: Screenplay template, page count, PDF export
* Persona: Sofia, HR
  * Role: HR Manager, mid-size company
  * Technical Level: Low
  * Primary Use Case: Offer letters, policies, DEED forms
  * Must-Have: Legal templates, mail-merge-like variables, DOCX export


§ 04 Feature Set
----------------

**MVP Scope:** Features tagged MVP ship in the first public release. Features tagged POST-MVP are roadmapped for v1.1 onward.

The default editing experience. A canvas of composable content blocks with a floating properties panel. Users interact with document content visually — no markup knowledge required.

Block Types

*   **Heading** (H1–H4) with inline formatting
*   **Paragraph** — rich text (bold, italic, link, inline code)
*   **Image** — upload or URL, with caption + alt text
*   **Table** — rows/cols editor, merge, header row toggle
*   **List** — ordered, unordered, nested
*   **Callout** — colored blockquote / info box
*   **Code Block** — language selector, monospace, copy button
*   **Divider** — configurable style (line, dots, double)
*   **Columns Layout** — 2 or 3 column grid containers
*   **Page Break** — forced break for PDF pagination
*   **Cover Block** — full-height first page cover layout
*   **Custom HTML Block** — escape hatch to raw HTML

Interactions

Drag-and-drop block reordering; click-to-edit inline; /slash-command block insertion; block duplicate / delete; undo/redo stack (Ctrl+Z/Y)

Properties Panel

Contextual right panel showing block-specific settings: font size, color, padding, alignment, border, background. CSS and Tailwind class overrides accepted.

Document Settings

Global: font family, base font size, color palette, page width, header/footer content, page numbers toggle

A professional code editor panel (CodeMirror 6) exposing the document's underlying HTML + CSS. Tailwind v4 classes work natively via the CDN/browser-based compiler — no build step.

Editor Features

Syntax highlighting (HTML, CSS, JS); auto-closing tags; multi-cursor; find & replace; code folding; dark/light theme; Emmet abbreviations

Tailwind v4

Tailwind v4's browser-native CDN build is injected into the preview iframe. All utility classes resolve without a Node build step. Custom `@theme` directives supported.

Mode Switching

Toggle between No-Code ↔ Code via a persistent toolbar button. On switch to Code Mode, the current block state serialises to clean HTML. On switch back, Folio attempts a block parse; ambiguous HTML stays as Custom HTML blocks. **No work is ever lost.**

Panels

Three tabs in Code Mode: **HTML** (document body), **CSS** (scoped stylesheet), **Head** (meta, custom fonts, script tags)

A sandboxed `<iframe>` on the right half of the viewport rendering the document in real time. Changes in either editor mode reflect in the preview with debounced updates (150ms).

Preview Modes

**Web** (scrollable, full-width viewport); **Page** (simulates A4/Letter/Legal page boundaries with margins visible); **Print** (CSS print media simulation)

Responsive Scale

Viewport width selector (Mobile 375px, Tablet 768px, Desktop 1280px, Full). Zoom in/out controls. Rulers toggle.

Click-to-Select

Clicking an element in the preview panel selects its corresponding block in the editor (No-Code mode) or highlights the HTML line (Code Mode).

A unified export modal with format-specific settings panels. All exports are generated client-side, no server upload required.

HTML Export

Single-file self-contained HTML — fonts inlined as base64, CSS scoped, images embedded. Options: include/exclude Tailwind CDN link, minify output, add Open Graph meta.

PDF Export

Uses `window.print()` with CSS `@page` rules (primary) with `html2canvas + jsPDF` as fallback for complex layouts. Settings:

*   Page size: A4, Letter, Legal, A3, A5, Custom (mm)
*   Orientation: Portrait / Landscape
*   Margins: Normal (25mm), Narrow (12mm), Wide (38mm), Custom
*   Page numbers: On/Off, position (top/bottom, left/center/right)
*   Header / Footer: free-text or document title/date tokens
*   Background graphics: include/exclude (for ink saving)

Markdown Export

Converts block tree to CommonMark Markdown. Tables, headings, lists, code blocks preserved. Images written as relative paths. Limitation: custom CSS / layout blocks become HTML comments.

JSON Backup

Full document state as a portable `.json` file including blocks, CSS, metadata, asset references. Re-importable into any Folio instance.

.folio Archive

A ZIP-like bundle (`document.json` + `assets/`) packaged as a `.folio` file. Can be imported, shared, and version-controlled. Intended as the primary share/backup format.

15+ professionally designed, production-ready templates shipped with Folio. Accessible via the New Document modal with category filtering and preview thumbnails. Applying a template populates the editor with pre-structured blocks and styles — user fills in content.

Template Data

Each bundled template is a static `.folio` JSON file in the repo. No network call required — templates are bundled at build time via Vite's `import.meta.glob`.

Customisation

After applying a template, all blocks are fully editable. Document-level settings (palette, fonts) can be changed without breaking the template structure.

Any document can be promoted to a reusable template. The Template Builder adds metadata (name, category, description, thumbnail) and marks certain block fields as **placeholder slots** — visually differentiated regions the end-user fills in. Templates are exported as `.folio` files.

Save as Template

"Save as Template" button in any document. Opens builder overlay: name, category picker (Business / Academic / Legal / Creative / Personal / Technical), description, auto-generated thumbnail from live preview.

Placeholder Slots

In No-Code mode, any block can be right-clicked → "Mark as Template Slot". Slot blocks render with a dashed outline and placeholder hint text in the template picker preview.

Export Format

`my-template.folio` — importable by drag-drop onto the Folio window or via "Import Template" in Settings. Template file naming convention: `{slug}.folio` (e.g. `x-corp-prd-template.folio`)

Community Sharing

Folio's GitHub repo hosts a `/community-templates` directory. Users submit PRs with their `.folio` files. Merged templates appear in a "Community" tab in the template picker (loaded via GitHub raw CDN — optional, gracefully degrades offline).

All user data lives exclusively in the browser's IndexedDB. No network calls for document storage. A home-screen Document Manager lists all saved documents with title, last-modified date, template used, and a thumbnail.

Auto-Save

Continuous autosave on every change event (debounced 500ms). Visual "Saved" indicator in toolbar. Browser tab closure is safe — no data loss.

Document Ops

Create, Rename, Duplicate, Delete, Export, Open. Version history (last 10 snapshots stored as compressed JSON in IndexedDB).

Storage Quota

IndexedDB quota varies by browser (~60% of available disk). Folio shows a storage usage indicator. Warn at 80% quota. Asset images stored as ArrayBuffers; automatic suggestion to externally host large images.

A `Cmd/Ctrl + K` command palette for all actions. Full keyboard navigation in No-Code mode. Power users never need the mouse.

Key Shortcuts

`Ctrl+K` command palette · `Ctrl+S` manual save · `Ctrl+E` export · `/` block insert · `Ctrl+\` toggle mode · `Ctrl+P` preview toggle · `Ctrl+Z/Y` undo/redo · `Ctrl+D` duplicate block

§ 05 User Stories
-----------------



* #: US-01
  * As a…: PM (Priya)
  * I want to…: pick a PRD template and fill in my product sections visually
  * So that…: I don't have to design from scratch
  * Priority: P0
* #: US-02
  * As a…: PM (Priya)
  * I want to…: export my PRD as a crisp, paginated A4 PDF
  * So that…: I can share it in leadership reviews
  * Priority: P0
* #: US-03
  * As a…: Developer (Kenji)
  * I want to…: switch to Code Mode mid-document and write raw HTML with Tailwind classes
  * So that…: I can achieve precise layout control
  * Priority: P0
* #: US-04
  * As a…: Developer (Kenji)
  * I want to…: export my document as a self-contained single-file HTML
  * So that…: I can host it on GitHub Pages or send via email
  * Priority: P0
* #: US-05
  * As a…: Academic (Amara)
  * I want to…: use the Research Paper template with formatted citations
  * So that…: my submission meets APA standards
  * Priority: P1
* #: US-06
  * As a…: Screenwriter (Leo)
  * I want to…: use the Screenplay template with correct slugline and action formatting
  * So that…: my script is industry-standard
  * Priority: P1
* #: US-07
  * As a…: Any user
  * I want to…: auto-save my document as I type
  * So that…: I never lose work on browser close
  * Priority: P0
* #: US-08
  * As a…: Any user
  * I want to…: export and later re-import my document as a .folio file
  * So that…: I can back up or transfer my work
  * Priority: P0
* #: US-09
  * As a…: HR Manager (Sofia)
  * I want to…: build a custom offer-letter template once and reuse it
  * So that…: my team saves time on every hire
  * Priority: P1
* #: US-10
  * As a…: Any user
  * I want to…: share a .folio template file with my colleague
  * So that…: we maintain brand consistency without a shared account
  * Priority: P1
* #: US-11
  * As a…: Any user
  * I want to…: preview the document in A4 page-break simulation before exporting
  * So that…: I catch layout issues before generating the PDF
  * Priority: P0
* #: US-12
  * As a…: Developer (Kenji)
  * I want to…: submit my custom template to the Folio community repo via a pull request
  * So that…: others can discover and use my work
  * Priority: P2


§ 06 Success Metrics & KPIs
---------------------------



* Metric: GitHub Stars
  * Target (3 months post-launch): ≥ 500 stars
  * Measurement Method: GitHub API
* Metric: Weekly Active Users (netlify deploy)
  * Target (3 months post-launch): ≥ 1,000 WAU
  * Measurement Method: Plausible Analytics (privacy-first, no cookies)
* Metric: Documents Created per Session
  * Target (3 months post-launch): ≥ 1.3 avg
  * Measurement Method: Local event ping (opt-in)
* Metric: PDF Export Completion Rate
  * Target (3 months post-launch): ≥ 75% of users who start export
  * Measurement Method: Custom event (opt-in)
* Metric: Community Templates Submitted
  * Target (3 months post-launch): ≥ 10 PR submissions in 60 days
  * Measurement Method: GitHub PR count
* Metric: Page Load Time (initial)
  * Target (3 months post-launch): ≤ 2s on 4G (Lighthouse)
  * Measurement Method: Lighthouse CI in GitHub Actions
* Metric: Lighthouse Accessibility Score
  * Target (3 months post-launch): ≥ 90
  * Measurement Method: Lighthouse CI
* Metric: Bundle Size (gzipped)
  * Target (3 months post-launch): ≤ 350 KB initial JS
  * Measurement Method: Vite bundle analyser


§ 07 System Architecture
------------------------

7.1 Architecture Philosophy
---------------------------

Folio is a **pure Single-Page Application (SPA)**. There is no backend, no API, no authentication service, and no server-side rendering. All computation, storage, and rendering happens in the user's browser tab. The deployment artifact is a static bundle of HTML + JS + CSS files deployable to any CDN (Netlify, Vercel, GitHub Pages, or self-hosted nginx).

**Design constraint:** Any feature that requires a Node.js runtime, server process, or external API call is out of scope for v1.0. The one exception is the optional community templates CDN fetch — which is non-blocking and gracefully degrades to offline mode.

7.2 Layer Overview
------------------



* Layer: Presentation
  * Technology: React 19 + TailwindCSS v4
  * Responsibility: All UI components, layout, animations, editor panels, modals
* Layer: Editor Core
  * Technology: Custom block engine + CodeMirror 6
  * Responsibility: Block tree management, serialisation, deserialisation, undo/redo
* Layer: Preview Renderer
  * Technology: Sandboxed iframe + srcdoc
  * Responsibility: Real-time document rendering; Tailwind v4 CDN injection; CSS scoping
* Layer: Persistence
  * Technology: IndexedDB via idb library
  * Responsibility: Document CRUD, template storage, settings, version snapshots, asset blobs
* Layer: Export Engine
  * Technology: html2canvas + jsPDF + custom serializers
  * Responsibility: HTML, PDF, Markdown, JSON, .folio format generation
* Layer: Template System
  * Technology: Static JSON bundles + idb user store
  * Responsibility: Bundled templates (build-time) + user/community templates (runtime)
* Layer: Build & Deploy
  * Technology: Vite 6 + GitHub Actions + Netlify
  * Responsibility: Tree-shaking, code splitting, Lighthouse CI, deploy on merge to main


7.3 Data Flow — Document Edit Cycle
-----------------------------------

User interaction in the editor triggers a **command dispatch** into the `EditorStore` (Zustand). The store applies the command to the immutable block tree (via Immer), writes the delta to IndexedDB (debounced 500ms), and notifies the `PreviewBridge`. The bridge serialises the current block tree to HTML and posts it to the preview iframe via `postMessage`. The iframe re-renders the document with CSS `@scope` isolation.

§ 08 Technology Stack
---------------------



* Layer: Build Tool
  * Package / Tool: vite
  * Version: ^6.x
  * Rationale: Native ESM, fast HMR, import.meta.glob for template discovery, excellent code-splitting
* Layer: UI Framework
  * Package / Tool: react + react-dom
  * Version: ^19.x
  * Rationale: Concurrent features (useTransition for live preview updates), server component future-proofing
* Layer: CSS Framework
  * Package / Tool: tailwindcss
  * Version: ^4.x (CDN)
  * Rationale: v4's browser-native CSS engine removes build step requirement for preview iframe Tailwind support
* Layer: State Management
  * Package / Tool: zustand
  * Version: ^5.x
  * Rationale: Minimal boilerplate; slice pattern for editor, documents, and settings stores; built-in devtools
* Layer: Immutable Updates
  * Package / Tool: immer
  * Version: ^10.x
  * Rationale: Structural sharing for block tree mutations; enables efficient undo/redo via patch snapshots
* Layer: IndexedDB
  * Package / Tool: idb
  * Version: ^8.x
  * Rationale: Promise-based wrapper around raw IndexedDB; lightweight (2.1KB gzipped)
* Layer: Code Editor
  * Package / Tool: @codemirror/...
  * Version: ^6.x
  * Rationale: Modular, tree-sitter-based; HTML/CSS/JS highlighting; excellent performance; accessible
* Layer: Drag & Drop
  * Package / Tool: @dnd-kit/core
  * Version: ^6.x
  * Rationale: Accessible drag-and-drop; works with React 19 concurrent mode; no jQuery dependency
* Layer: PDF Export (primary)
  * Package / Tool: Browser Print API
  * Version: native
  * Rationale: Zero dependency; CSS @page rules for page size; best fidelity for text-heavy docs
* Layer: PDF Export (fallback)
  * Package / Tool: html2canvas + jspdf
  * Version: ^1.x / ^2.x
  * Rationale: Pixel-accurate raster fallback for complex layouts and backgrounds
* Layer: File Packaging
  * Package / Tool: jszip
  * Version: ^3.x
  * Rationale: Browser-native ZIP creation for .folio archive format; no Node.js fs dependency
* Layer: Icon System
  * Package / Tool: lucide-react
  * Version: ^0.4x
  * Rationale: Tree-shakeable SVG icons; consistent stroke style; zero runtime overhead
* Layer: Routing
  * Package / Tool: react-router-dom
  * Version: ^6.x
  * Rationale: Hash-based routing (compatible with static hosting); nested layouts for editor/home/settings
* Layer: Testing
  * Package / Tool: vitest + @testing-library/react
  * Version: ^2.x
  * Rationale: Vite-native test runner; co-located test files; jsdom for browser API simulation
* Layer: E2E Tests
  * Package / Tool: playwright
  * Version: ^1.x
  * Rationale: Cross-browser; IndexedDB state seeding; screenshot regression for export outputs
* Layer: CI/CD
  * Package / Tool: GitHub Actions + Netlify
  * Version: —
  * Rationale: Auto-deploy on main merge; Lighthouse CI checks; bundle size enforcement


§ 09 Data Models — IndexedDB Schema
-----------------------------------

The application uses four IndexedDB object stores, managed by the `idb` library. The database name is `folio-db`, initial version `1`. All stores use auto-generated UUIDs as primary keys unless specified.


|Field     |Type             |Description                                           |Index|
|----------|-----------------|------------------------------------------------------|-----|
|id        |string (uuid)    |Primary key — generated on create                     |PK   |
|title     |string           |User-facing document title                            |✓    |
|mode      |'nocode' | 'code'|Last active editor mode                               |—    |
|blocks    |Block[]          |Serialised block tree (No-Code mode). JSON array.     |—    |
|htmlSource|string           |Raw HTML (Code Mode body content)                     |—    |
|cssSource |string           |Scoped CSS for this document                          |—    |
|headSource|string           |Custom <head> content (fonts, meta)                   |—    |
|templateId|string | null    |ID of template used to create this doc                |✓    |
|settings  |DocumentSettings |Font family, page width, palette, header/footer config|—    |
|createdAt |number (epoch ms)|Creation timestamp                                    |✓    |
|updatedAt |number (epoch ms)|Last modification timestamp                           |✓    |
|thumbnail |string | null    |Base64 PNG of first page preview (generated on save)  |—    |
|tags      |string[]         |User-defined tags for search/filter                   |—    |




* Field: id
  * Type: string (uuid)
  * Description: Primary key
  * Index: PK
* Field: name
  * Type: string
  * Description: Display name (e.g. "Corporate PRD")
  * Index: ✓
* Field: slug
  * Type: string
  * Description: URL-safe identifier (e.g. "corporate-prd")
  * Index: ✓ (unique)
* Field: category
  * Type: TemplateCategory
  * Description: Enum: business | academic | legal | creative | personal | technical
  * Index: ✓
* Field: description
  * Type: string
  * Description: Short description shown in template picker
  * Index: —
* Field: thumbnail
  * Type: string | null
  * Description: Base64 PNG preview thumbnail
  * Index: —
* Field: blocks
  * Type: Block[]
  * Description: Pre-structured block tree with placeholder slots
  * Index: —
* Field: cssSource
  * Type: string
  * Description: Template's bundled CSS
  * Index: —
* Field: headSource
  * Type: string
  * Description: Template's custom head (fonts etc.)
  * Index: —
* Field: isBuiltIn
  * Type: boolean
  * Description: True = shipped with Folio; cannot be deleted
  * Index: ✓
* Field: source
  * Type: 'builtin' | 'user' | 'community'
  * Description: Origin of the template
  * Index: —
* Field: version
  * Type: string (semver)
  * Description: Template schema version for forward compatibility
  * Index: —
* Field: createdAt
  * Type: number
  * Description: Creation timestamp
  * Index: —



|Field     |Type         |Description                   |
|----------|-------------|------------------------------|
|id        |string (uuid)|Primary key                   |
|documentId|string       |FK → documents.id             |
|filename  |string       |Original upload filename      |
|mimeType  |string       |e.g. image/png, image/webp    |
|data      |ArrayBuffer  |Raw binary asset data         |
|sizeBytes |number       |File size (for quota tracking)|
|createdAt |number       |Upload timestamp              |




* Key: app.theme
  * Value Type: 'light' | 'dark' | 'system'
  * Description: App UI theme
* Key: app.defaultMode
  * Value Type: 'nocode' | 'code'
  * Description: Default editor mode for new documents
* Key: app.autoSaveInterval
  * Value Type: number (ms)
  * Description: Debounce delay for autosave (default 500)
* Key: export.defaultPageSize
  * Value Type: string
  * Description: Default PDF page size (default 'A4')
* Key: export.defaultOrientation
  * Value Type: 'portrait' | 'landscape'
  * Description: Default PDF orientation
* Key: community.enableFetch
  * Value Type: boolean
  * Description: Allow fetching community templates from GitHub CDN (default true)
* Key: storage.usageBytes
  * Value Type: number
  * Description: Cached storage usage (recalculated on open)


9.1 Block Schema
----------------

Each block in the `blocks[]` array conforms to the following discriminated union type. All blocks share a base shape; the `type` discriminant determines the additional fields.



* Base Field: id
  * Type: string (uuid)
  * Description: Block identity (stable, never regenerated on edit)
* Base Field: type
  * Type: BlockType enum
  * Description: heading | paragraph | image | table | list | callout | code | divider | columns | pagebreak | cover | html
* Base Field: isSlot
  * Type: boolean
  * Description: True = this block is a template placeholder slot
* Base Field: slotHint
  * Type: string | null
  * Description: Instructional hint text shown in template picker preview
* Base Field: props
  * Type: BlockProps (discriminated)
  * Description: Type-specific data (text content, src, rows, etc.)
* Base Field: style
  * Type: BlockStyle
  * Description: Per-block overrides: padding, margin, bg, border, fontSize, color, tailwindClasses
* Base Field: children
  * Type: Block[] | null
  * Description: Nested blocks (columns, list items)


§ 10 Component Architecture
---------------------------

10.1 Top-Level Route Structure
------------------------------


|Route         |Component    |Description                                                  |
|--------------|-------------|-------------------------------------------------------------|
|/             |HomePage     |Document manager grid; New Document button; Storage indicator|
|/editor/:docId|EditorPage   |Split-pane editor + preview; all editor panels               |
|/settings     |SettingsPage |App settings; template manager; import/export all data       |
|/templates    |TemplatesPage|Full template browser; preview + use; community tab          |


10.2 Editor Page Component Tree
-------------------------------



* Component: EditorPage
  * Children / Notes: Root layout; manages panel splits (react-resizable-panels)
* Component: EditorToolbar
  * Children / Notes: Mode toggle (No-Code / Code); Save status; Export button; Preview toggle; Undo/Redo; Cmd+K
* Component: NoCodeEditor
  * Children / Notes: BlockList → BlockItem → BlockRenderer; DndContext (dnd-kit); SlashMenu; BlockInsertButton
* Component: PropertiesPanel
  * Children / Notes: Contextual panel; BlockStyleEditor; DocumentSettingsPanel; TabGroup (Style / Advanced / Slot)
* Component: CodeEditor
  * Children / Notes: CodeMirrorPanel (HTML tab); CodeMirrorPanel (CSS tab); CodeMirrorPanel (Head tab)
* Component: PreviewPane
  * Children / Notes: PreviewIframe (srcdoc); PreviewToolbar (page size, zoom, mode); ClickToSelectBridge
* Component: ExportModal
  * Children / Notes: FormatTabs (HTML/PDF/MD/JSON/.folio); FormatSettingsPanel; ExportProgressToast
* Component: CommandPalette
  * Children / Notes: Cmdk overlay; unified search across actions, blocks, docs, templates


10.3 Store Architecture (Zustand)
---------------------------------



* Store Slice: editorStore
  * Owned State: blocks, mode, selectedBlockId, history (patches), dirty flag
  * Key Actions: insertBlock, updateBlock, moveBlock, deleteBlock, undo, redo, switchMode
* Store Slice: documentStore
  * Owned State: currentDocId, documentMeta, autosaveStatus
  * Key Actions: loadDocument, saveDocument, createDocument, deleteDocument
* Store Slice: templateStore
  * Owned State: builtInTemplates, userTemplates, communityTemplates
  * Key Actions: loadTemplates, applyTemplate, saveAsTemplate, importTemplate, exportTemplate
* Store Slice: settingsStore
  * Owned State: theme, defaultMode, exportDefaults, communityEnabled
  * Key Actions: updateSetting, resetSettings
* Store Slice: previewStore
  * Owned State: previewMode, zoom, pageSize, showRulers
  * Key Actions: setPreviewMode, setZoom, setPageSize


§ 11 Non-Functional Requirements
--------------------------------



* Category: Performance
  * Requirement: Initial page load (LCP)
  * Target: ≤ 2.0s on 4G / mid-range Android
* Category: Performance
  * Requirement: Preview re-render latency (keystroke → iframe update)
  * Target: ≤ 200ms p95
* Category: Performance
  * Requirement: PDF export time (20-page A4 document)
  * Target: ≤ 5s using print API
* Category: Performance
  * Requirement: Initial JS bundle (gzipped)
  * Target: ≤ 350 KB; CodeMirror lazy-loaded
* Category: Offline
  * Requirement: Full editor functionality with zero network
  * Target: 100% (excluding community template fetch)
* Category: Offline
  * Requirement: Service Worker cache strategy
  * Target: Cache-first for all app shell assets via Workbox (PWA)
* Category: Accessibility
  * Requirement: WCAG 2.1 AA compliance
  * Target: Lighthouse score ≥ 90
* Category: Accessibility
  * Requirement: Keyboard-navigable editor (all blocks reachable without mouse)
  * Target: 100% of core flows
* Category: Browser Support
  * Requirement: Chrome 108+, Firefox 113+, Safari 16.4+, Edge 108+
  * Target: All must pass E2E suite
* Category: Data Privacy
  * Requirement: Zero telemetry by default; opt-in only analytics
  * Target: No cookies, no fingerprinting
* Category: Storage Safety
  * Requirement: Autosave never overwrites without confirmed user intent on delete
  * Target: Confirmed via modal; recycle bin with 7-day retention
* Category: Internationalisation
  * Requirement: RTL layout support (Arabic, Hebrew documents)
  * Target: v1.1 — Post-MVP


§ 12 Bundled Template Catalogue
-------------------------------

All templates below ship with Folio's initial release as static `.folio` JSON files. Each template includes: pre-structured blocks, bundled CSS variables, Google Fonts references, and thumbnail previews.

Corporate PRD

Full product requirements document with cover, exec summary, personas, feature tables, KPI dashboard, and roadmap. The reference implementation for Folio itself.

Software Requirements Spec (SRS)

System architecture, data models, API specs, NFR tables. Pairs with Corporate PRD template.

Business Proposal

Executive pitch with problem / solution / pricing sections. Designed for client or investor delivery.

Corporate Report

Quarterly / annual report layout with cover, financial summary section, data tables, and appendix.

API Documentation

Endpoint tables, request/response examples, auth overview. Inspired by Stripe's doc style.

Architecture Decision Record (ADR)

Lightweight ADR format with context, decision, consequences sections. Ideal for engineering teams.

Research Paper (APA 7)

Title page, abstract, sections, in-text citation formatting, references list. APA 7th edition compliant.

Lab Report

Structured lab report: hypothesis, methodology, results (with table/chart blocks), discussion, conclusion.

Academic Essay

5-section argumentative essay with introduction, 3 body paragraphs, and conclusion. MLA-friendly.

Feature Screenplay

Industry-standard Courier 12pt layout with sluglines, action lines, character cues, dialogue, and transitions.

Short Story

Clean fiction format with chapter headings, scene breaks, and book-like typography.

Résumé / CV (Modern)

Single-page minimal résumé with sidebar layout. ATS-safe font stack. Export as PDF for applications.

Cover Letter

Professional cover letter with letterhead, date, recipient block, and three-paragraph body.

Non-Disclosure Agreement (NDA)

Standard bilateral NDA template with variable slots for party names, jurisdiction, and term.

Employment Offer Letter

Formal offer letter with compensation, start date, benefits, and e-signature line slots.

**Blank Template:** A zero-content "Blank" option is always available as the first item in the template picker. It creates an empty document with only the document settings configured.

§ 13 Export Format Specifications
---------------------------------

13.1 HTML Export
----------------


|Option              |Values  |Default                             |
|--------------------|--------|------------------------------------|
|Inline assets       |On / Off|On — embeds fonts + images as base64|
|Include Tailwind CDN|On / Off|On if document uses Tailwind classes|
|Minify HTML + CSS   |On / Off|Off                                 |
|Add OG meta tags    |On / Off|Off                                 |
|Add print stylesheet|On / Off|On                                  |


13.2 PDF Export
---------------



* Option: Page size
  * Values: A3, A4, A5, Letter, Legal, Tabloid, Custom (W×H in mm)
  * Default: A4
* Option: Orientation
  * Values: Portrait / Landscape
  * Default: Portrait
* Option: Margins
  * Values: Normal (25mm), Narrow (12mm), Wide (38mm), Custom (top/right/bottom/left)
  * Default: Normal
* Option: Page numbers
  * Values: None, Top Left/Center/Right, Bottom Left/Center/Right
  * Default: None
* Option: Header text
  * Values: Free text + tokens: {title}, {date}, {page}, {pages}
  * Default: Empty
* Option: Footer text
  * Values: Free text + tokens: {title}, {date}, {page}, {pages}
  * Default: Empty
* Option: Background graphics
  * Values: Include / Exclude (ink-saving mode)
  * Default: Include
* Option: Export engine
  * Values: Print API (recommended) / html2canvas+jsPDF (fallback)
  * Default: Print API


13.3 .folio File Format
-----------------------

A `.folio` file is a ZIP archive (DEFLATE compression) with the following internal structure:

*   `manifest.json` — format version, Folio app version, export timestamp
*   `document.json` — full document object (blocks, CSS, meta, settings)
*   `assets/` — directory of binary assets (images etc.) referenced by asset ID filenames
*   `thumbnail.png` — optional first-page preview thumbnail

The `.folio` extension is registered as a custom MIME type `application/x-folio` in the app's manifest for file association on supported OSes.

§ 14 Development Roadmap
------------------------

Sprint

Phase

Deliverable

Status

S-01

Foundation

Vite + React 19 + TW v4 scaffold; Zustand stores; IndexedDB schema + migrations; Home screen; Document CRUD

MVP

S-02

Block Engine

Block tree data model; Heading/Paragraph/Divider/List/Callout blocks; Properties panel skeleton; Undo/redo stack

MVP

S-03

Block Engine

Image, Table, Code Block, Columns, PageBreak, Cover, Custom HTML blocks; Drag-and-drop (dnd-kit); Slash menu

MVP

S-04

Code Mode

CodeMirror 6 integration; HTML/CSS/Head tabs; Mode toggle serialiser/deserialiser; Bidirectional sync validation

MVP

S-05

Preview

iframe srcdoc renderer; Tailwind v4 CDN injection; Debounced live update; Page / Web / Print preview modes; Zoom controls

MVP

S-06

Export Engine

HTML single-file export; PDF via Print API; PDF settings modal (page size, margins, header/footer); Markdown export

MVP

S-07

Templates I

Template schema + idb store; Template picker modal; 6 bundled templates (PRD, SRS, Résumé, Screenplay, Research Paper, Proposal)

MVP

S-08

Templates II

Remaining 9 bundled templates; Template Builder UI; Slot marking; Export/import .folio template files; jszip integration

MVP

S-09

Polish

Command palette (Cmdk); Keyboard shortcuts; Version snapshots; Storage quota UI; PWA / Service Worker; Lighthouse CI gate

MVP

S-10

Launch

E2E test suite (Playwright); Accessibility audit (axe-core); README + contribution guide; Netlify deploy; GitHub release + community templates repo setup

MVP

v1.1

Post-MVP

DOCX export (docx.js); Community template browser tab (GitHub CDN); Variable / mail-merge slot system; RTL layout support; Table of contents auto-generation

Post-MVP

v1.2

Post-MVP

Collaborative editing (WebRTC P2P, no server); AI block assistant (Anthropic API, user-supplied key); Multi-page document outline panel; Presentation mode (fullscreen slides)

Post-MVP

§ 15 Open Source Strategy & Community
-------------------------------------

15.1 License
------------

Folio is released under the **MIT License**. All bundled templates, including community-submitted ones, are released under **Creative Commons CC0 1.0** (public domain) to maximise reuse without attribution requirements.

15.2 Repository Structure
-------------------------


|Path                  |Description                                                     |
|----------------------|----------------------------------------------------------------|
|/src                  |Application source (React components, stores, utilities)        |
|/src/templates/builtin|All 15+ bundled .folio JSON template files                      |
|/community-templates  |Community-contributed .folio files (PR-reviewed)                |
|/docs                 |Contributing guide, template authoring guide, architecture notes|
|/.github/workflows    |Lighthouse CI, bundle size check, deploy pipeline               |
|TEMPLATE_GUIDE.md     |How to build and submit a Folio template                        |


15.3 Community Template Submission Flow
---------------------------------------

1.  User builds template in Folio, exports as `my-template.folio`
2.  User forks the Folio GitHub repo, places file in `/community-templates/`
3.  User opens a PR with a title, screenshot, and category declaration
4.  Maintainer reviews for quality, safety, and schema validity (CI auto-validates)
5.  Merged templates are available via the Community tab in Folio's template picker (fetched from GitHub raw CDN, cached in IndexedDB, works offline after first load)

15.4 Competitive Moats
----------------------

Zero Lock-in

No auth, no vendor cloud, no subscription. All data in IndexedDB, exportable at any time. Users own their documents unconditionally — a stark contrast to Notion, Coda, or Canva.

Tailwind v4 in Browser

First document editor to natively support Tailwind v4 utility classes in live preview without any build pipeline — unlocking the entire Tailwind ecosystem for document styling.

Bidirectional Mode Parity

No-Code and Code modes are fully bidirectional without data loss. This is technically hard — and no competitor offers it. PMs use no-code; devs use code; neither compromises.

Template as File

The .folio template portability model sidesteps the need for a backend marketplace. A single file contains the full template — shareable via Slack, GitHub, email, or USB drive.

§ 16 Open Questions & Decisions Needed
--------------------------------------



* #: OQ-01
  * Question: Block editor engine: custom vs. Tiptap/ProseMirror?
  * Options: A) Build custom block engine B) Wrap Tiptap (ProseMirror-based)
  * Recommendation: Custom engine gives max control over block schema + serialisation; Tiptap is faster to build but opinionated. Recommend: Custom for MVP blocks, Tiptap for rich-text within blocks (hybrid).
* #: OQ-02
  * Question: PDF export: Print API vs. headless Puppeteer via WASM?
  * Options: A) window.print() with CSS @page B) Puppeteer compiled to WASM (experimental)
  * Recommendation: Puppeteer WASM is unstable and large (~15MB). Recommend: Print API primary, html2canvas fallback. Revisit Puppeteer WASM at v1.2.
* #: OQ-03
  * Question: Version history: how many snapshots to keep in IndexedDB?
  * Options: A) 10 snapshots B) 30 snapshots C) Time-based (24h hourly)
  * Recommendation: Recommend: 10 manual + last 24h hourly auto (capped at 30 total). Prune oldest on new save.
* #: OQ-04
  * Question: Markdown export: how to handle custom CSS blocks?
  * Options: A) Drop styling, export content-only B) Wrap in HTML comment C) Export as raw HTML blocks
  * Recommendation: Recommend: Export as raw HTML blocks (C). Pure Markdown purity is sacrificed for fidelity — users requesting MD likely accept this.
* #: OQ-05
  * Question: Should Folio support real-time collaboration via CRDTs?
  * Options: A) Not in v1.0 B) WebRTC P2P with Yjs CRDT C) Server-required (out of scope)
  * Recommendation: Recommend: Out of scope for v1.0. Yjs P2P (WebRTC) in v1.2 roadmap — this keeps the "no server" constraint intact.
* #: OQ-06
  * Question: Should community templates be fetched dynamically or bundled at build time?
  * Options: A) Dynamic fetch from GitHub CDN on page load B) Bundle all approved templates at build time via CI
  * Recommendation: Recommend: Dynamic fetch (A) with IndexedDB caching for offline use. This allows community templates to grow without app redeployment.


**Hard constraint — no exceptions:** Any feature that requires a server process, user account creation, or storing document data outside the user's own browser is explicitly rejected for v1.0 and must be architecturally justified before inclusion in any future version.

