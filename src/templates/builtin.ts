import type { Template } from '../types';
import { generateId } from '../utils/id';

function t(blocks: Template['blocks'], css = '', head = '') {
  return { blocks, cssSource: css, headSource: head };
}

function blk(type: string, props: Record<string, unknown>, style: Record<string, unknown> = {}): any {
  return { id: generateId(), type, isSlot: false, slotHint: null, props, style, children: null };
}

function slot(type: string, props: Record<string, unknown>, hint: string): any {
  return { id: generateId(), type, isSlot: true, slotHint: hint, props, style: {}, children: null };
}

function spacer(height: string = '32'): any {
  return { id: generateId(), type: 'spacer', isSlot: false, slotHint: null, props: { height }, style: {}, children: null };
}

function pageDivider(variant: 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient' = 'solid', thickness = '2px', spacing = '16px'): any {
  return { id: generateId(), type: 'pageDivider', isSlot: false, slotHint: null, props: { variant, thickness, spacing }, style: {}, children: null };
}

const now = Date.now();

export const builtinTemplates: Template[] = [
  {
    id: 'tpl-blank',
    name: 'Blank',
    slug: 'blank',
    category: 'personal',
    description: 'Start from scratch with an empty document',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'Untitled Document', subtitle: '', author: '', date: '' }),
      spacer('24'),
      blk('paragraph', { text: 'Start writing here...' }),
    ]),
  },
  {
    id: 'tpl-corporate-prd',
    name: 'Corporate PRD',
    slug: 'corporate-prd',
    category: 'business',
    description: 'Full product requirements document with cover, exec summary, personas, feature tables, and roadmap',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'Product Requirements Document', subtitle: 'Project Name', author: 'Product Team', date: new Date().toLocaleDateString() }),
      pageDivider('gradient', '3px', '32px'),
      blk('heading', { level: 1, text: 'Executive Summary' }),
      slot('paragraph', { text: 'Provide a high-level overview of the product, its purpose, and key objectives.' }, 'Executive summary'),
      spacer('32'),
      blk('heading', { level: 1, text: 'Problem Statement' }),
      slot('paragraph', { text: 'Describe the problem this product solves and why it matters.' }, 'Problem description'),
      pageDivider('dashed', '2px', '24px'),
      blk('heading', { level: 2, text: 'Target Users' }),
      blk('table', { rows: [['Persona', 'Role', 'Pain Point', 'Solution'], ['', '', '', '']], headerRows: 1 }),
      spacer('32'),
      blk('heading', { level: 1, text: 'Feature Requirements' }),
      blk('heading', { level: 2, text: 'P0 — Must Have' }),
      blk('list', { type: 'unordered', items: [{ id: generateId(), text: 'Feature 1' }, { id: generateId(), text: 'Feature 2' }] }),
      spacer('24'),
      blk('heading', { level: 2, text: 'P1 — Should Have' }),
      blk('list', { type: 'unordered', items: [{ id: generateId(), text: 'Feature 3' }] }),
      pageDivider('gradient', '3px', '32px'),
      blk('heading', { level: 1, text: 'KPIs & Success Metrics' }),
      blk('table', { rows: [['Metric', 'Target', 'Measurement'], ['', '', '']], headerRows: 1 }),
      spacer('32'),
      blk('heading', { level: 1, text: 'Roadmap' }),
      blk('table', { rows: [['Phase', 'Timeline', 'Deliverables'], ['Sprint 1', '', ''], ['Sprint 2', '', '']], headerRows: 1 }),
    ]),
  },
  {
    id: 'tpl-srs',
    name: 'Software Requirements Spec (SRS)',
    slug: 'srs',
    category: 'technical',
    description: 'System architecture, data models, API specs, NFR tables',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'Software Requirements Specification', subtitle: 'System Name', author: 'Engineering', date: new Date().toLocaleDateString() }),
      blk('heading', { level: 1, text: '1. Introduction' }),
      slot('paragraph', { text: 'Purpose, scope, definitions, and references.' }, 'SRS introduction'),
      blk('heading', { level: 1, text: '2. System Architecture' }),
      slot('paragraph', { text: 'Describe the high-level architecture and technology stack.' }, 'Architecture description'),
      blk('heading', { level: 1, text: '3. Data Models' }),
      blk('heading', { level: 2, text: 'Entity Relationship Diagram' }),
      slot('paragraph', { text: 'Insert ERD or describe data model relationships.' }, 'Data model'),
      blk('heading', { level: 1, text: '4. API Specifications' }),
      blk('table', { rows: [['Endpoint', 'Method', 'Description', 'Auth'], ['', '', '', '']], headerRows: 1 }),
      blk('heading', { level: 1, text: '5. Non-Functional Requirements' }),
      blk('table', { rows: [['Category', 'Requirement', 'Target'], ['Performance', 'Page load', '< 2s'], ['Availability', 'Uptime', '99.9%']], headerRows: 1 }),
    ]),
  },
  {
    id: 'tpl-business-proposal',
    name: 'Business Proposal',
    slug: 'business-proposal',
    category: 'business',
    description: 'Executive pitch with problem, solution, and pricing sections',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'Business Proposal', subtitle: 'Prepared for [Client]', author: '[Your Company]', date: new Date().toLocaleDateString() }),
      pageDivider('gradient', '3px', '48px'),
      blk('heading', { level: 1, text: 'The Challenge' }),
      slot('paragraph', { text: 'Describe the client\'s current challenge or pain point.' }, 'Client challenge'),
      spacer('32'),
      blk('heading', { level: 1, text: 'Our Solution' }),
      slot('paragraph', { text: 'Present your proposed solution and approach.' }, 'Solution overview'),
      spacer('24'),
      blk('heading', { level: 2, text: 'Key Benefits' }),
      blk('list', { type: 'unordered', items: [{ id: generateId(), text: 'Benefit 1' }, { id: generateId(), text: 'Benefit 2' }, { id: generateId(), text: 'Benefit 3' }] }),
      pageDivider('dashed', '2px', '32px'),
      blk('heading', { level: 1, text: 'Pricing' }),
      blk('table', { rows: [['Package', 'Features', 'Price'], ['Basic', '', '$X'], ['Pro', '', '$Y']], headerRows: 1 }),
      spacer('32'),
      blk('heading', { level: 1, text: 'Timeline' }),
      blk('table', { rows: [['Phase', 'Duration', 'Milestones'], ['', '', '']], headerRows: 1 }),
    ], `body { font-family: 'Inter', system-ui, sans-serif; font-size: 11pt; line-height: 1.6; color: #334155; }
section[data-type="cover"] { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 3rem; border-bottom: 4px solid #0d9488; }
section[data-type="cover"] h1 { font-size: 36pt; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
section[data-type="cover"] p { font-size: 14pt; color: #475569; }
section[data-type="cover"] .author { font-size: 12pt; color: #64748b; margin-top: 2rem; }
h1 { font-size: 18pt; font-weight: 600; color: #134e4a; border-left: 4px solid #14b8a6; padding-left: 1rem; margin-top: 2rem; margin-bottom: 1rem; }
h2 { font-size: 14pt; font-weight: 600; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem; }
hr { border: none; border-top: 1px solid #cbd5e1; margin: 1.5rem 0; }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
th { background: #0d9488; color: white; font-weight: 600; padding: 0.75rem 1rem; text-align: left; }
td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; }
tr:nth-child(even) td { background: #f8fafc; }
ul { list-style: none; padding-left: 0; }
ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.5rem; }
ul li::before { content: "→"; position: absolute; left: 0; color: #14b8a6; font-weight: 600; }
`),
  },
  {
    id: 'tpl-api-docs',
    name: 'API Documentation',
    slug: 'api-docs',
    category: 'technical',
    description: 'Endpoint tables, request/response examples, auth overview',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'API Documentation', subtitle: 'v1.0', author: 'Engineering', date: new Date().toLocaleDateString() }),
      blk('heading', { level: 1, text: 'Authentication' }),
      blk('paragraph', { text: 'All API requests require a Bearer token in the Authorization header.' }),
      blk('code', { code: 'Authorization: Bearer YOUR_API_KEY', language: 'bash' }),
      blk('heading', { level: 1, text: 'Endpoints' }),
      blk('heading', { level: 2, text: 'GET /api/users' }),
      blk('paragraph', { text: 'Retrieve a list of users.' }),
      blk('table', { rows: [['Parameter', 'Type', 'Required', 'Description'], ['page', 'number', 'No', 'Page number'], ['limit', 'number', 'No', 'Items per page']], headerRows: 1 }),
      blk('heading', { level: 2, text: 'Response' }),
      blk('code', { code: '{\n  "data": [...],\n  "total": 100,\n  "page": 1\n}', language: 'json' }),
    ]),
  },
  {
    id: 'tpl-adr',
    name: 'Architecture Decision Record',
    slug: 'adr',
    category: 'technical',
    description: 'Lightweight ADR format with context, decision, consequences',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('heading', { level: 1, text: 'ADR-001: [Title]' }),
      blk('table', { rows: [['Status', 'Proposed'], ['Date', new Date().toLocaleDateString()], ['Deciders', '']], headerRows: 0 }),
      blk('heading', { level: 2, text: 'Context' }),
      slot('paragraph', { text: 'What is the issue that we\'re seeing that is motivating this decision?' }, 'Context'),
      blk('heading', { level: 2, text: 'Decision' }),
      slot('paragraph', { text: 'What is the change that we\'re proposing and/or doing?' }, 'Decision'),
      blk('heading', { level: 2, text: 'Consequences' }),
      slot('paragraph', { text: 'What becomes easier or more difficult because of this change?' }, 'Consequences'),
    ]),
  },
  {
    id: 'tpl-research-paper',
    name: 'Research Paper (APA 7)',
    slug: 'research-paper-apa',
    category: 'academic',
    description: 'Title page, abstract, sections, in-text citations, references',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'Research Paper Title', subtitle: 'Author Name\nUniversity Name\nCourse Name\nInstructor Name\n' + new Date().toLocaleDateString(), author: '', date: '' }),
      blk('heading', { level: 1, text: 'Abstract' }),
      slot('paragraph', { text: 'Provide a 150-250 word summary of the research, including the research question, methods, results, and conclusions.' }, 'Abstract content'),
      blk('heading', { level: 1, text: 'Introduction' }),
      slot('paragraph', { text: 'Introduce the topic, provide background, and state the research question or hypothesis.' }, 'Introduction'),
      blk('heading', { level: 1, text: 'Literature Review' }),
      slot('paragraph', { text: 'Summarize relevant research and theoretical framework.' }, 'Literature review'),
      blk('heading', { level: 1, text: 'Methodology' }),
      slot('paragraph', { text: 'Describe the research design, participants, materials, and procedures.' }, 'Methodology'),
      blk('heading', { level: 1, text: 'Results' }),
      slot('paragraph', { text: 'Present findings with appropriate tables and figures.' }, 'Results'),
      blk('heading', { level: 1, text: 'Discussion' }),
      slot('paragraph', { text: 'Interpret results, discuss implications, and acknowledge limitations.' }, 'Discussion'),
      blk('heading', { level: 1, text: 'Conclusion' }),
      slot('paragraph', { text: 'Summarize key findings and suggest future research directions.' }, 'Conclusion'),
      blk('heading', { level: 1, text: 'References' }),
      slot('paragraph', { text: 'Author, A. A. (Year). Title of work. Publisher.\nAuthor, B. B. (Year). Title of article. Journal Name, Volume(Issue), pages.' }, 'Reference list'),
    ], "body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 2; } h1 { font-size: 12pt; font-weight: bold; text-align: center; } p { text-indent: 0.5in; }"),
  },
  {
    id: 'tpl-lab-report',
    name: 'Lab Report',
    slug: 'lab-report',
    category: 'academic',
    description: 'Structured lab report with hypothesis, methodology, results, discussion',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'Lab Report', subtitle: 'Experiment Title\nCourse Name', author: '', date: new Date().toLocaleDateString() }),
      blk('heading', { level: 1, text: 'Abstract' }),
      slot('paragraph', { text: 'Brief summary of the experiment, methods, and key findings.' }, 'Abstract'),
      blk('heading', { level: 1, text: 'Introduction & Hypothesis' }),
      slot('paragraph', { text: 'Background information and stated hypothesis.' }, 'Introduction'),
      blk('heading', { level: 1, text: 'Materials & Methods' }),
      blk('list', { type: 'ordered', items: [{ id: generateId(), text: 'Material 1' }, { id: generateId(), text: 'Material 2' }] }),
      blk('heading', { level: 1, text: 'Results' }),
      blk('table', { rows: [['Trial', 'Variable 1', 'Variable 2', 'Observation'], ['1', '', '', ''], ['2', '', '', '']], headerRows: 1 }),
      blk('heading', { level: 1, text: 'Discussion' }),
      slot('paragraph', { text: 'Interpret results, compare to hypothesis, identify errors.' }, 'Discussion'),
      blk('heading', { level: 1, text: 'Conclusion' }),
      slot('paragraph', { text: 'Summarize whether hypothesis was supported.' }, 'Conclusion'),
    ]),
  },
  {
    id: 'tpl-academic-essay',
    name: 'Academic Essay',
    slug: 'academic-essay',
    category: 'academic',
    description: '5-section argumentative essay structure, MLA-friendly',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('heading', { level: 1, text: 'Essay Title' }),
      blk('heading', { level: 2, text: 'I. Introduction' }),
      slot('paragraph', { text: 'Hook, background, thesis statement.' }, 'Introduction with thesis'),
      blk('heading', { level: 2, text: 'II. Body Paragraph 1' }),
      slot('paragraph', { text: 'Topic sentence, evidence, analysis, transition.' }, 'Body paragraph 1'),
      blk('heading', { level: 2, text: 'III. Body Paragraph 2' }),
      slot('paragraph', { text: 'Topic sentence, evidence, analysis, transition.' }, 'Body paragraph 2'),
      blk('heading', { level: 2, text: 'IV. Body Paragraph 3' }),
      slot('paragraph', { text: 'Topic sentence, evidence, analysis, transition.' }, 'Body paragraph 3'),
      blk('heading', { level: 2, text: 'V. Conclusion' }),
      slot('paragraph', { text: 'Restate thesis, summarize arguments, closing thought.' }, 'Conclusion'),
    ]),
  },
  {
    id: 'tpl-screenplay',
    name: 'Feature Screenplay',
    slug: 'feature-screenplay',
    category: 'creative',
    description: 'Industry-standard screenplay format with sluglines, action, dialogue',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('heading', { level: 1, text: 'TITLE' }),
      blk('paragraph', { text: 'Written by\nAuthor Name' }),
      blk('pagebreak', {}),
      blk('paragraph', { text: 'FADE IN:', style: { textAlign: 'left' } }),
      blk('paragraph', { text: 'EXT. LOCATION - DAY', style: { textAlign: 'left', textTransform: 'uppercase' } }),
      slot('paragraph', { text: 'Action description. Describe what the audience sees.' }, 'Action line'),
      blk('paragraph', { text: 'CHARACTER', style: { textAlign: 'center' } }),
      slot('paragraph', { text: 'Dialogue goes here. What the character says.' }, 'Dialogue'),
      blk('paragraph', { text: '(parenthetical)', style: { textAlign: 'center' } }),
      slot('paragraph', { text: 'More dialogue with direction.' }, 'Dialogue'),
      blk('paragraph', { text: 'CUT TO:', style: { textAlign: 'right' } }),
    ], "body { font-family: 'Courier Prime', 'Courier New', monospace; font-size: 12pt; line-height: 1; } h1 { text-align: center; font-size: 14pt; }"),
  },
  {
    id: 'tpl-short-story',
    name: 'Short Story',
    slug: 'short-story',
    category: 'creative',
    description: 'Clean fiction format with chapter headings and book-like typography',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'Story Title', subtitle: 'A Short Story', author: 'Author Name', date: '' }),
      blk('pagebreak', {}),
      blk('heading', { level: 1, text: 'Chapter 1' }),
      spacer('24'),
      slot('paragraph', { text: 'Begin your story here. Set the scene, introduce characters, and draw the reader in.' }, 'Story text'),
      pageDivider('dotted', '2px', '48px'),
      spacer('24'),
      blk('heading', { level: 1, text: 'Chapter 2' }),
      spacer('24'),
      slot('paragraph', { text: 'Continue the narrative...' }, 'Story continuation'),
    ], "body { font-family: 'Georgia', serif; font-size: 12pt; line-height: 1.8; } p { text-indent: 1.5em; } p:first-of-type { text-indent: 0; }"),
  },
  {
    id: 'tpl-resume',
    name: 'Résumé / CV (Modern)',
    slug: 'resume-modern',
    category: 'personal',
    description: 'Single-page minimal résumé with clean layout. ATS-safe.',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('heading', { level: 1, text: 'Your Name' }),
      blk('paragraph', { text: 'your@email.com | (555) 123-4567 | linkedin.com/in/yourname | city, state' }),
      pageDivider('solid', '2px', '12px'),
      spacer('16'),
      blk('heading', { level: 2, text: 'Summary' }),
      slot('paragraph', { text: 'Brief professional summary highlighting key skills and experience.' }, 'Professional summary'),
      spacer('24'),
      blk('heading', { level: 2, text: 'Experience' }),
      blk('heading', { level: 3, text: 'Job Title — Company Name' }),
      blk('paragraph', { text: 'Month Year – Present' }),
      blk('list', { type: 'unordered', items: [{ id: generateId(), text: 'Key achievement with measurable impact' }, { id: generateId(), text: 'Responsibility and outcome' }] }),
      spacer('24'),
      blk('heading', { level: 2, text: 'Education' }),
      blk('paragraph', { text: 'Degree — University Name, Year' }),
      spacer('24'),
      blk('heading', { level: 2, text: 'Skills' }),
      slot('paragraph', { text: 'Skill 1, Skill 2, Skill 3, Skill 4, Skill 5' }, 'Skills list'),
    ], `body { font-family: 'Inter', system-ui, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; }
h1 { font-size: 24pt; font-weight: 700; color: #0d9488; letter-spacing: -0.02em; margin-bottom: 0.25rem; }
h2 { font-size: 10pt; font-weight: 600; color: #0d9488; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #14b8a6; padding-bottom: 0.25rem; margin-top: 1rem; margin-bottom: 0.5rem; }
h3 { font-size: 10.5pt; font-weight: 600; color: #334155; margin-bottom: 0.15rem; }
p { margin-bottom: 0.25rem; color: #64748b; }
ul { margin: 0.25rem 0 0.5rem 0.75rem; }
li { margin-bottom: 0.15rem; color: #475569; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 0.5rem 0; }
`),
  },
  {
    id: 'tpl-resume-executive',
    name: 'Executive Resume',
    slug: 'resume-executive',
    category: 'personal',
    description: 'Senior/executive resume with leadership focus and prominent achievements.',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('heading', { level: 1, text: 'Your Name' }),
      blk('paragraph', { text: 'your@email.com | (555) 123-4567 | linkedin.com/in/yourname | city, state' }),
      blk('divider', { style: 'line' }),
      blk('heading', { level: 2, text: 'Executive Summary' }),
      slot('paragraph', { text: 'Strategic leader with proven track record of driving growth and transformation.' }, 'Executive summary'),
      blk('heading', { level: 2, text: 'Leadership' }),
      blk('heading', { level: 3, text: 'Executive Title — Company Name' }),
      blk('paragraph', { text: 'Month Year – Present' }),
      blk('list', { type: 'unordered', items: [{ id: generateId(), text: 'Led organization through significant growth and transformation' }, { id: generateId(), text: 'Drove strategic initiatives resulting in measurable business impact' }] }),
      blk('heading', { level: 2, text: 'Experience' }),
      blk('heading', { level: 3, text: 'Job Title — Company Name' }),
      blk('paragraph', { text: 'Month Year – Present' }),
      blk('list', { type: 'unordered', items: [{ id: generateId(), text: 'Key achievement with measurable impact' }, { id: generateId(), text: 'Responsibility and outcome' }] }),
      blk('heading', { level: 2, text: 'Education' }),
      blk('paragraph', { text: 'Degree — University Name, Year' }),
      blk('heading', { level: 2, text: 'Skills' }),
      slot('paragraph', { text: 'Strategic Planning, Leadership, Transformation, Business Development, Stakeholder Management' }, 'Skills list'),
    ], `body { font-family: 'Inter', system-ui, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; }
h1 { font-size: 24pt; font-weight: 700; color: #0d9488; letter-spacing: -0.02em; margin-bottom: 0.25rem; }
h2 { font-size: 10pt; font-weight: 600; color: #0d9488; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #14b8a6; padding-bottom: 0.25rem; margin-top: 1rem; margin-bottom: 0.5rem; }
h3 { font-size: 10.5pt; font-weight: 600; color: #334155; margin-bottom: 0.15rem; }
p { margin-bottom: 0.25rem; color: #64748b; }
ul { margin: 0.25rem 0 0.5rem 0.75rem; }
li { margin-bottom: 0.15rem; color: #475569; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 0.5rem 0; }
`),
  },
  {
    id: 'tpl-cover-letter',
    name: 'Cover Letter',
    slug: 'cover-letter',
    category: 'personal',
    description: 'Professional cover letter with letterhead and three-paragraph body',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('paragraph', { text: 'Your Name\nYour Address\nCity, State ZIP\nyour@email.com\n(555) 123-4567' }),
      blk('paragraph', { text: new Date().toLocaleDateString() }),
      blk('paragraph', { text: 'Hiring Manager\nCompany Name\nCompany Address\nCity, State ZIP' }),
      blk('paragraph', { text: 'Dear Hiring Manager,' }),
      slot('paragraph', { text: 'Opening paragraph: State the position you\'re applying for and how you found it. Express enthusiasm.' }, 'Opening paragraph'),
      slot('paragraph', { text: 'Body paragraph: Highlight relevant experience, skills, and achievements. Use specific examples.' }, 'Body paragraph'),
      slot('paragraph', { text: 'Closing paragraph: Reiterate interest, thank the reader, and mention follow-up.' }, 'Closing paragraph'),
      blk('paragraph', { text: 'Sincerely,\nYour Name' }),
    ]),
  },
  {
    id: 'tpl-nda',
    name: 'Non-Disclosure Agreement (NDA)',
    slug: 'nda',
    category: 'legal',
    description: 'Standard bilateral NDA with variable slots for party names and terms',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('heading', { level: 1, text: 'MUTUAL NON-DISCLOSURE AGREEMENT' }),
      blk('paragraph', { text: 'This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of ____________ ("Effective Date").' }),
      blk('heading', { level: 2, text: '1. Parties' }),
      blk('paragraph', { text: 'Between: ' }),
      slot('paragraph', { text: '[Party A Name], with principal offices at [Address] ("Party A")' }, 'Party A details'),
      blk('paragraph', { text: 'And: ' }),
      slot('paragraph', { text: '[Party B Name], with principal offices at [Address] ("Party B")' }, 'Party B details'),
      blk('heading', { level: 2, text: '2. Definition of Confidential Information' }),
      blk('paragraph', { text: '"Confidential Information" means any non-public information disclosed by either party, including but not limited to business plans, financial data, technical specifications, customer lists, and proprietary software.' }),
      blk('heading', { level: 2, text: '3. Obligations' }),
      blk('paragraph', { text: 'Each party agrees to: (a) hold the other\'s Confidential Information in strict confidence; (b) not disclose it to third parties; (c) use it only for the purpose of evaluating the business relationship.' }),
      blk('heading', { level: 2, text: '4. Term' }),
      slot('paragraph', { text: 'This Agreement shall remain in effect for a period of [X years] from the Effective Date.' }, 'Term duration'),
      blk('heading', { level: 2, text: '5. Governing Law' }),
      slot('paragraph', { text: 'This Agreement shall be governed by the laws of [Jurisdiction].' }, 'Governing law'),
      blk('heading', { level: 2, text: 'Signatures' }),
      blk('table', { rows: [['Party A', 'Party B'], ['Name: ____________', 'Name: ____________'], ['Title: ____________', 'Title: ____________'], ['Date: ____________', 'Date: ____________']], headerRows: 0 }),
    ]),
  },
  {
    id: 'tpl-offer-letter',
    name: 'Employment Offer Letter',
    slug: 'employment-offer',
    category: 'legal',
    description: 'Formal offer letter with compensation, benefits, and e-signature slots',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('paragraph', { text: '[Company Name]\n[Company Address]' }),
      blk('paragraph', { text: new Date().toLocaleDateString() }),
      blk('heading', { level: 1, text: 'Employment Offer Letter' }),
      blk('paragraph', { text: 'Dear ' }),
      slot('paragraph', { text: '[Candidate Name]' }, 'Candidate name'),
      blk('paragraph', { text: 'We are pleased to extend an offer of employment for the following position:' }),
      blk('table', { rows: [['Position', ''], ['Department', ''], ['Start Date', ''], ['Reports To', '']], headerRows: 0 }),
      blk('heading', { level: 2, text: 'Compensation' }),
      slot('paragraph', { text: 'Annual salary: $[Amount]\nPay frequency: [Bi-weekly/Monthly]' }, 'Compensation details'),
      blk('heading', { level: 2, text: 'Benefits' }),
      blk('list', { type: 'unordered', items: [
        { id: generateId(), text: 'Health, dental, and vision insurance' },
        { id: generateId(), text: '[X] days paid time off per year' },
        { id: generateId(), text: '401(k) with [X]% company match' },
        { id: generateId(), text: 'Professional development budget' },
      ]}),
      blk('heading', { level: 2, text: 'Terms' }),
      slot('paragraph', { text: 'This offer is contingent upon [background check, reference verification, etc.]. Please respond by [date].' }, 'Terms'),
      blk('paragraph', { text: 'We look forward to welcoming you to the team.' }),
      blk('paragraph', { text: 'Sincerely,\n[Hiring Manager Name]\n[Title]' }),
      blk('divider', { style: 'line' }),
      blk('paragraph', { text: 'Acceptance: I accept this offer of employment.\n\nSignature: ________________  Date: ________________' }),
    ]),
  },
  {
    id: 'tpl-corporate-report',
    name: 'Corporate Report',
    slug: 'corporate-report',
    category: 'business',
    description: 'Quarterly/annual report with financial summary and data tables',
    thumbnail: null,
    isBuiltIn: true,
    source: 'builtin',
    version: '1.0.0',
    createdAt: now,
    ...t([
      blk('cover', { title: 'Quarterly Report', subtitle: 'Q[X] 20XX', author: '[Company Name]', date: new Date().toLocaleDateString() }),
      blk('heading', { level: 1, text: 'Executive Summary' }),
      slot('paragraph', { text: 'Summarize key highlights, financial performance, and strategic progress.' }, 'Executive summary'),
      blk('heading', { level: 1, text: 'Financial Highlights' }),
      blk('table', { rows: [['Metric', 'Q[X]', 'Q[X-1]', 'YoY Change'], ['Revenue', '', '', ''], ['Gross Margin', '', '', ''], ['Net Income', '', '', '']], headerRows: 1 }),
      blk('heading', { level: 1, text: 'Key Achievements' }),
      blk('list', { type: 'unordered', items: [{ id: generateId(), text: 'Achievement 1' }, { id: generateId(), text: 'Achievement 2' }] }),
      blk('heading', { level: 1, text: 'Challenges & Risks' }),
      slot('paragraph', { text: 'Outline key challenges and mitigation strategies.' }, 'Challenges'),
      blk('heading', { level: 1, text: 'Outlook' }),
      slot('paragraph', { text: 'Provide forward-looking statements and next quarter priorities.' }, 'Outlook'),
    ], `body { font-family: 'Inter', system-ui, sans-serif; font-size: 11pt; line-height: 1.6; color: #334155; }
section[data-type="cover"] { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #134e4a 100%); padding: 4rem; color: white; }
section[data-type="cover"] h1 { font-size: 42pt; font-weight: 700; color: white; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
section[data-type="cover"] .subtitle { font-size: 18pt; color: #94a3b8; margin-bottom: 2rem; }
section[data-type="cover"] .author { font-size: 12pt; color: #cbd5e1; margin-top: 3rem; border-top: 1px solid #475569; padding-top: 1rem; }
section[data-type="cover"] .date { font-size: 12pt; color: #cbd5e1; }
h1 { font-size: 16pt; font-weight: 700; color: #0f172a; border-left: 5px solid #0d9488; padding-left: 1rem; margin-top: 2.5rem; margin-bottom: 1rem; }
h2 { font-size: 13pt; font-weight: 600; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.5rem; }
p { margin-bottom: 0.75rem; }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
th { background: linear-gradient(135deg, #134e4a 0%, #0d9488 100%); color: white; font-weight: 600; padding: 0.875rem 1rem; text-align: left; font-size: 10pt; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 10.5pt; }
tr:nth-child(even) td { background: #f8fafc; }
tr:nth-child(odd) td { background: white; }
tr:hover td { background: #f1f5f9; }
ul { list-style: none; padding-left: 0; }
ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.5rem; }
ul li::before { content: "◆"; position: absolute; left: 0; color: #14b8a6; font-size: 8pt; }
`),
  },
];
