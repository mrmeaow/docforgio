import { create } from 'zustand';
import { produce } from 'immer';
import type { Block, BlockType, EditorMode, BlockStyle, HeadingProps, ParagraphProps, ImageProps, TableProps, ListProps, CalloutProps, CodeProps, DividerProps, ColumnsProps, CoverProps, HtmlProps, SpacerProps, WrapperProps, PageDividerProps } from '../types';
import { generateId } from '../utils/id';

function shortId(id: string): string {
  return id.split('-')[0];
}

interface Patch {
  blocks: Block[];
  timestamp: number;
}

interface EditorState {
  blocks: Block[];
  mode: EditorMode;
  selectedBlockId: string | null;
  htmlSource: string;
  cssSource: string;
  headSource: string;
  dirty: boolean;
  history: Patch[];
  historyIndex: number;
  maxHistorySize: number;
  slashMenuOpen: boolean;
  slashMenuBlockId: string | null;

  insertBlock: (type: BlockType, afterId?: string) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  updateBlockProps: (id: string, props: Record<string, unknown>) => void;
  updateBlockStyle: (id: string, style: Partial<BlockStyle>) => void;
  moveBlock: (id: string, newIndex: number) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;

  codeSynced: boolean;

  switchMode: (mode: EditorMode) => void;
  serializeToHtml: () => string;
  serializeToCss: () => string;
  deserializeFromHtml: (html: string) => void;
  syncCodeToBlocks: () => void;
  setHtmlSource: (html: string) => void;
  setCssSource: (css: string) => void;
  setHeadSource: (head: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: () => void;

  setBlocks: (blocks: Block[]) => void;
  setDirty: (dirty: boolean) => void;
  clearEditor: () => void;
  openSlashMenu: (blockId: string) => void;
  closeSlashMenu: () => void;
}

export function createBlock(type: BlockType): Block {
  const baseBlock: Omit<Block, 'props'> = {
    id: generateId(),
    type,
    isSlot: false,
    slotHint: null,
    style: {},
    children: null,
  };

  switch (type) {
    case 'heading':
      return { ...baseBlock, props: { level: 2, text: 'Heading' } };
    case 'paragraph':
      return { ...baseBlock, props: { text: 'Start writing...' } };
    case 'image':
      return { ...baseBlock, props: { src: '', alt: '', caption: '' } };
    case 'table':
      return { ...baseBlock, props: { rows: [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']], headerRows: 1 } };
    case 'list':
      return { ...baseBlock, props: { type: 'unordered', items: [{ id: generateId(), text: 'List item' }] } };
    case 'callout':
      return { ...baseBlock, props: { text: 'Callout text', variant: 'note' } };
    case 'code':
      return { ...baseBlock, props: { code: '// Your code here', language: 'javascript' } };
    case 'divider':
      return { ...baseBlock, props: { style: 'line' } };
    case 'columns':
      return { ...baseBlock, props: { count: 2 }, children: [[], []].map(() => createBlock('paragraph')) as unknown as Block[] };
    case 'pagebreak':
      return { ...baseBlock, props: {} };
    case 'cover':
      return { ...baseBlock, props: { title: 'Document Title', subtitle: '', author: '', date: '' } };
    case 'html':
      return { ...baseBlock, props: { html: '<div>Custom HTML</div>' } };
    case 'spacer':
      return { ...baseBlock, props: { height: '32' } };
    case 'wrapper':
      return { ...baseBlock, props: { tag: 'div' }, children: [] };
    case 'pageDivider':
      return { ...baseBlock, props: { variant: 'solid', thickness: '2px', spacing: '16px' } };
  }
}

const INITIAL_BLOCKS: Block[] = [
  createBlock('cover'),
  createBlock('paragraph'),
];

export const useEditorStore = create<EditorState>()((set, get) => ({
  blocks: INITIAL_BLOCKS,
  mode: 'nocode',
  selectedBlockId: null,
  htmlSource: '',
  cssSource: '',
  headSource: '',
  dirty: false,
  codeSynced: true,
  history: [{ blocks: JSON.parse(JSON.stringify(INITIAL_BLOCKS)), timestamp: Date.now() }],
  historyIndex: 0,
  maxHistorySize: 30,
  slashMenuOpen: false,
  slashMenuBlockId: null,

  insertBlock: (type: BlockType, afterId?: string) => {
    const newBlock = createBlock(type);
    set(
      produce((state: EditorState) => {
        const index = afterId
          ? state.blocks.findIndex((b) => b.id === afterId) + 1
          : state.blocks.length;
        state.blocks.splice(index, 0, newBlock);
        state.dirty = true;
        state.selectedBlockId = newBlock.id;
      })
    );
    get().pushHistory();
  },

  updateBlock: (id: string, updates: Partial<Block>) => {
    set(
      produce((state: EditorState) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          Object.assign(block, updates);
          state.dirty = true;
        }
      })
    );
  },

  updateBlockProps: (id: string, props: Record<string, unknown>) => {
    set(
      produce((state: EditorState) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          Object.assign(block.props, props);
          state.dirty = true;
        }
      })
    );
  },

  updateBlockStyle: (id: string, style: Partial<BlockStyle>) => {
    set(
      produce((state: EditorState) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          Object.assign(block.style, style);
          state.dirty = true;
        }
      })
    );
  },

  moveBlock: (id: string, newIndex: number) => {
    set(
      produce((state: EditorState) => {
        const oldIndex = state.blocks.findIndex((b) => b.id === id);
        if (oldIndex === -1 || newIndex < 0 || newIndex >= state.blocks.length) return;
        const [block] = state.blocks.splice(oldIndex, 1);
        state.blocks.splice(newIndex, 0, block);
        state.dirty = true;
      })
    );
    get().pushHistory();
  },

  deleteBlock: (id: string) => {
    set(
      produce((state: EditorState) => {
        const index = state.blocks.findIndex((b) => b.id === id);
        if (index !== -1) {
          state.blocks.splice(index, 1);
          state.dirty = true;
          if (state.selectedBlockId === id) {
            state.selectedBlockId = null;
          }
        }
      })
    );
    get().pushHistory();
  },

  duplicateBlock: (id: string) => {
    set(
      produce((state: EditorState) => {
        const index = state.blocks.findIndex((b) => b.id === id);
        if (index !== -1) {
          const original = state.blocks[index];
          const duplicate: Block = {
            ...JSON.parse(JSON.stringify(original)),
            id: generateId(),
          };
          state.blocks.splice(index + 1, 0, duplicate);
          state.dirty = true;
          state.selectedBlockId = duplicate.id;
        }
      })
    );
    get().pushHistory();
  },

  selectBlock: (id: string | null) => {
    set({ selectedBlockId: id });
  },

  switchMode: (mode: EditorMode) => {
    const state = get();
    if (mode === 'code' && state.mode === 'nocode') {
      const html = state.serializeToHtml();
      // Preserve existing cssSource (template styles) — only regenerate HTML
      set({ mode, htmlSource: html, codeSynced: true, dirty: true });
    } else if (mode === 'nocode' && state.mode === 'code') {
      state.deserializeFromHtml(state.htmlSource);
      set({ mode, dirty: true });
    } else {
      set({ mode, dirty: true });
    }
  },

  serializeToHtml: () => {
    const { blocks } = get();
    return blocks.map((block) => blockToHtml(block, 0)).join('\n\n');
  },

  serializeToCss: () => {
    const { blocks } = get();
    const lines: string[] = [];

    lines.push('/* ===========================================');
    lines.push('   Base Element Styles');
    lines.push('   =========================================== */');
    lines.push('');
    lines.push('h1, h2, h3, h4 {');
    lines.push('  margin: 0;');
    lines.push('  font-weight: 700;');
    lines.push('  line-height: 1.25;');
    lines.push('}');
    lines.push('');
    lines.push('h1 { font-size: 2.5rem; }');
    lines.push('h2 { font-size: 2rem; }');
    lines.push('h3 { font-size: 1.5rem; }');
    lines.push('h4 { font-size: 1.25rem; }');
    lines.push('');
    lines.push('p {');
    lines.push('  margin: 0;');
    lines.push('  line-height: 1.6;');
    lines.push('}');
    lines.push('');
    lines.push('figure { margin: 0; }');
    lines.push('img {');
    lines.push('  max-width: 100%;');
    lines.push('  height: auto;');
    lines.push('  display: block;');
    lines.push('}');
    lines.push('figcaption {');
    lines.push('  font-size: 0.875rem;');
    lines.push('  color: #666;');
    lines.push('  margin-top: 0.5rem;');
    lines.push('}');
    lines.push('');
    lines.push('table { border-collapse: collapse; width: 100%; }');
    lines.push('th, td {');
    lines.push('  padding: 0.5rem 0.75rem;');
    lines.push('  border: 1px solid #ddd;');
    lines.push('  text-align: left;');
    lines.push('}');
    lines.push('th { background: #f5f5f5; font-weight: 600; }');
    lines.push('');
    lines.push('ul, ol { margin: 0; padding-left: 1.5rem; }');
    lines.push('li { margin: 0.25rem 0; }');
    lines.push('');
    lines.push('pre {');
    lines.push('  margin: 0;');
    lines.push('  padding: 1rem;');
    lines.push('  background: #1e1e1e;');
    lines.push('  color: #d4d4d4;');
    lines.push('  border-radius: 0.375rem;');
    lines.push('  overflow-x: auto;');
    lines.push('}');
    lines.push('code { font-family: monospace; }');
    lines.push('');
    lines.push('hr {');
    lines.push('  border: none;');
    lines.push('  border-top: 1px solid #ddd;');
    lines.push('  margin: 1rem 0;');
    lines.push('}');
    lines.push('hr.divider-dots { border-top-style: dotted; }');
    lines.push('hr.divider-double { border-top: 3px double #ddd; }');
    lines.push('');

    lines.push('/* ===========================================');
    lines.push('   Callout Variants');
    lines.push('   =========================================== */');
    lines.push('');
    lines.push('.callout { padding: 1rem; border-radius: 0.375rem; }');
    lines.push('.callout-note { background: #dbeafe; border-left: 4px solid #3b82f6; color: #1e40af; }');
    lines.push('.callout-tip { background: #dcfce7; border-left: 4px solid #22c55e; color: #166534; }');
    lines.push('.callout-important { background: #f3e8ff; border-left: 4px solid #a855f7; color: #6b21a8; }');
    lines.push('.callout-warning { background: #fef9c3; border-left: 4px solid #eab308; color: #854d0e; }');
    lines.push('.callout-caution { background: #fee2e2; border-left: 4px solid #ef4444; color: #991b1b; }');
    lines.push('');

    lines.push('/* ===========================================');
    lines.push('   Layout: Cover, Columns, Page Break');
    lines.push('   =========================================== */');
    lines.push('');
    lines.push('.cover {');
    lines.push('  padding: 3rem 2rem;');
    lines.push('  text-align: center;');
    lines.push('  min-height: 50vh;');
    lines.push('  display: flex;');
    lines.push('  flex-direction: column;');
    lines.push('  justify-content: center;');
    lines.push('  align-items: center;');
    lines.push('}');
    lines.push('');
    lines.push('.columns { display: flex; gap: 1rem; }');
    lines.push('.column { flex: 1; }');
    lines.push('.page-break { page-break-after: always; }');
    lines.push('');

    lines.push('/* ===========================================');
    lines.push('   Spacer & Wrapper & Page Divider');
    lines.push('   =========================================== */');
    lines.push('');
    lines.push('.spacer { display: block; }');
    lines.push('.wrapper { display: block; }');
    lines.push('.page-divider { border: none; }');
    lines.push('.page-divider-gradient {');
    lines.push('  background: linear-gradient(to right, transparent, #94a3b8, transparent);');
    lines.push('  height: 2px;');
    lines.push('}');
    lines.push('');

    lines.push('/* ===========================================');
    lines.push('   Block-Specific Styles');
    lines.push('   =========================================== */');
    lines.push('');
    for (const block of blocks) {
      const id = shortId(block.id);
      const className = `.block-${block.type}-${id}`;
      const css = blockStyleToCss(block.style);
      if (css) {
        const props = css.split('; ');
        if (props.length <= 2) {
          lines.push(`${className} { ${css}; }`);
        } else {
          lines.push(`${className} {`);
          props.forEach(prop => {
            lines.push(`  ${prop};`);
          });
          lines.push('}');
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  },

  deserializeFromHtml: (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
    const body = doc.body;
    const blocks: Block[] = [];

    for (const el of Array.from(body.children)) {
      const tag = el.tagName.toLowerCase();
      let block: Block | null = null;

      if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
        block = createBlock('heading');
        (block.props as HeadingProps).level = parseInt(tag[1]) as 1 | 2 | 3 | 4;
        (block.props as HeadingProps).text = el.textContent || '';
      } else if (tag === 'p') {
        block = createBlock('paragraph');
        (block.props as ParagraphProps).text = el.textContent || '';
        (block.props as ParagraphProps).html = el.innerHTML || undefined;
      } else if (tag === 'figure') {
        const img = el.querySelector('img');
        if (img) {
          block = createBlock('image');
          (block.props as ImageProps).src = img.getAttribute('src') || '';
          (block.props as ImageProps).alt = img.getAttribute('alt') || '';
          const figcaption = el.querySelector('figcaption');
          if (figcaption) (block.props as ImageProps).caption = figcaption.textContent || '';
        }
      } else if (tag === 'table') {
        block = createBlock('table');
        const rows: string[][] = [];
        let headerRows = 0;
        for (const tr of Array.from(el.querySelectorAll('tr'))) {
          const cells = Array.from(tr.querySelectorAll('th, td')).map(cell => cell.textContent || '');
          rows.push(cells);
          if (tr.querySelector('th')) headerRows++;
        }
        (block.props as TableProps).rows = rows.length ? rows : [['']];
        (block.props as TableProps).headerRows = headerRows || 1;
      } else if (tag === 'ul' || tag === 'ol') {
        block = createBlock('list');
        (block.props as ListProps).type = tag === 'ol' ? 'ordered' : 'unordered';
        (block.props as ListProps).items = Array.from(el.querySelectorAll('li')).map(li => ({
          id: generateId(),
          text: li.textContent || '',
        }));
      } else if (tag === 'pre') {
        const codeEl = el.querySelector('code');
        block = createBlock('code');
        (block.props as CodeProps).code = codeEl ? (codeEl.textContent || '') : (el.textContent || '');
        const langClass = codeEl?.className.match(/language-(\w+)/);
        if (langClass) (block.props as CodeProps).language = langClass[1];
      } else if (tag === 'hr') {
        block = createBlock('divider');
        if (el.classList.contains('divider-dots')) (block.props as DividerProps).style = 'dots';
        else if (el.classList.contains('divider-double')) (block.props as DividerProps).style = 'double';
      } else if (tag === 'div' && el.classList.contains('cover')) {
        block = createBlock('cover');
        const h1 = el.querySelector('h1');
        if (h1) (block.props as CoverProps).title = h1.textContent || '';
        const authorEl = el.querySelector('.author');
        if (authorEl) (block.props as CoverProps).author = authorEl.textContent || '';
        const dateEl = el.querySelector('.date');
        if (dateEl) (block.props as CoverProps).date = dateEl.textContent || '';
        const subtitleP = el.querySelector('p:not(.author):not(.date)');
        if (subtitleP && h1 && subtitleP !== h1) (block.props as CoverProps).subtitle = subtitleP.textContent || '';
      } else if (tag === 'div' && el.classList.contains('page-break')) {
        block = createBlock('pagebreak');
      } else if (tag === 'div' && el.classList.contains('callout')) {
        block = createBlock('callout');
        const p = el.querySelector('p');
        if (p) (block.props as CalloutProps).text = p.textContent || '';
        if (el.classList.contains('callout-warning')) (block.props as CalloutProps).variant = 'warning';
        else if (el.classList.contains('callout-caution')) (block.props as CalloutProps).variant = 'caution';
        else if (el.classList.contains('callout-tip')) (block.props as CalloutProps).variant = 'tip';
        else if (el.classList.contains('callout-important')) (block.props as CalloutProps).variant = 'important';
        else (block.props as CalloutProps).variant = 'note';
      } else if (tag === 'div' && el.classList.contains('columns')) {
        block = createBlock('columns');
        const cols = el.querySelectorAll('.column');
        const colBlocks: Block[] = [];
        for (const col of Array.from(cols)) {
          if (col.firstElementChild) {
            const innerHtml = col.firstElementChild.outerHTML;
            const colBlock = createBlock('paragraph');
            (colBlock.props as ParagraphProps).html = innerHtml;
            (colBlock.props as ParagraphProps).text = col.textContent || '';
            colBlocks.push(colBlock);
          }
        }
        (block.props as ColumnsProps).count = colBlocks.length || 2;
        block.children = colBlocks.length ? colBlocks : [createBlock('paragraph'), createBlock('paragraph')];
      } else if (tag === 'br' || (tag === 'div' && el.classList.contains('spacer'))) {
        block = createBlock('spacer');
        const height = el.getAttribute('data-height') || '32';
        (block.props as SpacerProps).height = height;
      } else if ((tag === 'div' || tag === 'section' || tag === 'article' || tag === 'aside') && el.classList.contains('wrapper')) {
        block = createBlock('wrapper');
        (block.props as WrapperProps).tag = tag as 'div' | 'section' | 'article' | 'aside';
        const children: Block[] = [];
        for (const child of Array.from(el.children)) {
          const childBlock = parseElementToBlock(child);
          if (childBlock) children.push(childBlock);
        }
        block.children = children;
      } else if (tag === 'hr' && el.classList.contains('page-divider')) {
        block = createBlock('pageDivider');
        const variant = el.getAttribute('data-variant') || 'solid';
        const thickness = el.getAttribute('data-thickness') || '2px';
        const spacing = el.getAttribute('data-spacing') || '16px';
        (block.props as PageDividerProps).variant = variant as 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient';
        (block.props as PageDividerProps).thickness = thickness;
        (block.props as PageDividerProps).spacing = spacing;
      } else {
        block = createBlock('html');
        (block.props as HtmlProps).html = el.outerHTML;
      }

      // Parse inline styles
      const styleAttr = el.getAttribute('style');
      if (styleAttr && block) {
        block.style = parseInlineStyle(styleAttr);
      }

      if (block) blocks.push(block);
    }

    set({ blocks, codeSynced: true, dirty: true });
  },

  syncCodeToBlocks: () => {
    const state = get();
    state.deserializeFromHtml(state.htmlSource);
  },

  setHtmlSource: (html: string) => {
    const { mode } = get();
    set({ htmlSource: html, dirty: true, codeSynced: mode !== 'code' ? true : false });
  },
  setCssSource: (css: string) => {
    const { mode } = get();
    set({ cssSource: css, dirty: true, codeSynced: mode !== 'code' ? true : false });
  },
  setHeadSource: (head: string) => set({ headSource: head, dirty: true }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        blocks: JSON.parse(JSON.stringify(history[newIndex].blocks)),
        historyIndex: newIndex,
        dirty: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        blocks: JSON.parse(JSON.stringify(history[newIndex].blocks)),
        historyIndex: newIndex,
        dirty: true,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  pushHistory: () => {
    set(
      produce((state: EditorState) => {
        const newPatch: Patch = {
          blocks: JSON.parse(JSON.stringify(state.blocks)),
          timestamp: Date.now(),
        };
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(newPatch);
        if (state.history.length > state.maxHistorySize) {
          state.history.shift();
        }
        state.historyIndex = state.history.length - 1;
      })
    );
  },

  setBlocks: (blocks: Block[]) => {
    set({
      blocks,
      dirty: false,
      history: [{ blocks: JSON.parse(JSON.stringify(blocks)), timestamp: Date.now() }],
      historyIndex: 0,
    });
  },

  setDirty: (dirty: boolean) => set({ dirty }),

  clearEditor: () => set({
    blocks: [],
    selectedBlockId: null,
    htmlSource: '',
    cssSource: '',
    headSource: '',
    dirty: false,
    history: [],
    historyIndex: -1,
  }),

  openSlashMenu: (blockId: string) => set({ slashMenuOpen: true, slashMenuBlockId: blockId }),
  closeSlashMenu: () => set({ slashMenuOpen: false, slashMenuBlockId: null }),
}));

function blockToHtml(block: Block, indent: number = 0): string {
  const pad = '  '.repeat(indent);
  const styleStr = blockStyleToCss(block.style);
  const id = shortId(block.id);
  const className = `block-${block.type}-${id}`;
  const attrs = styleStr ? ` class="${className}" style="${styleStr}"` : ` class="${className}"`;

  switch (block.type) {
    case 'heading': {
      const p = block.props as import('../types').HeadingProps;
      return `${pad}<h${p.level}${attrs}>${p.text}</h${p.level}>`;
    }
    case 'paragraph': {
      const p = block.props as import('../types').ParagraphProps;
      return `${pad}<p${attrs}>${p.html || p.text}</p>`;
    }
    case 'image': {
      const p = block.props as import('../types').ImageProps;
      if (p.caption) {
        return `${pad}<figure${attrs}>\n${pad}  <img src="${p.src}" alt="${p.alt}" />\n${pad}  <figcaption>${p.caption}</figcaption>\n${pad}</figure>`;
      }
      return `${pad}<figure${attrs}>\n${pad}  <img src="${p.src}" alt="${p.alt}" />\n${pad}</figure>`;
    }
    case 'table': {
      const p = block.props as import('../types').TableProps;
      const innerPad = pad + '  ';
      let html = `${pad}<table${attrs}>\n`;
      p.rows.forEach((row, ri) => {
        const tag = ri < p.headerRows ? 'th' : 'td';
        const cells = row.map(cell => `<${tag}>${cell}</${tag}>`).join('');
        html += `${innerPad}<tr>${cells}</tr>\n`;
      });
      html += `${pad}</table>`;
      return html;
    }
    case 'list': {
      const p = block.props as import('../types').ListProps;
      const tag = p.type === 'ordered' ? 'ol' : 'ul';
      const innerPad = pad + '  ';
      const items = p.items.map(i => `${innerPad}<li>${i.text}</li>`).join('\n');
      return `${pad}<${tag}${attrs}>\n${items}\n${pad}</${tag}>`;
    }
    case 'callout': {
      const p = block.props as import('../types').CalloutProps;
      const icons: Record<string, string> = { note: 'ℹ', tip: '✓', important: '◆', warning: '⚠', caution: '✕' };
      const labels: Record<string, string> = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };
      const icon = icons[p.variant] || icons.note;
      const label = labels[p.variant] || labels.note;
      const styleAttr = styleStr ? ` style="${styleStr}"` : '';
      return `${pad}<div class="callout callout-${p.variant} ${className}"${styleAttr}><div class="callout-title">${icon} ${label}</div><p>${p.text}</p></div>`;
    }
    case 'code': {
      const p = block.props as import('../types').CodeProps;
      const lang = p.language?.toLowerCase() || '';
      if (lang === 'mermaid') {
        return `${pad}<pre class="language-mermaid ${className}"${styleStr ? ` style="${styleStr}"` : ''}><code class="language-mermaid">${p.code}</code></pre>`;
      }
      return `${pad}<pre${attrs}><code class="language-${p.language}">${p.code}</code></pre>`;
    }
    case 'divider': {
      const p = block.props as import('../types').DividerProps;
      const cls = p.style === 'dots' ? 'divider-dots' : p.style === 'double' ? 'divider-double' : '';
      const classes = [cls, className].filter(Boolean).join(' ');
      return `${pad}<hr class="${classes}"${styleStr ? ` style="${styleStr}"` : ''} />`;
    }
    case 'pagebreak':
      return `${pad}<div class="page-break ${className}"></div>`;
    case 'cover': {
      const p = block.props as import('../types').CoverProps;
      const innerPad = pad + '  ';
      let html = `${pad}<div class="cover ${className}"${styleStr ? ` style="${styleStr}"` : ''}>\n`;
      html += `${innerPad}<h1>${p.title}</h1>\n`;
      if (p.subtitle) html += `${innerPad}<p>${p.subtitle}</p>\n`;
      if (p.author) html += `${innerPad}<p class="author">${p.author}</p>\n`;
      if (p.date) html += `${innerPad}<p class="date">${p.date}</p>\n`;
      html += `${pad}</div>`;
      return html;
    }
    case 'html': {
      const p = block.props as import('../types').HtmlProps;
      const lines = p.html.split('\n');
      return lines.map(l => `${pad}${l}`).join('\n');
    }
    case 'columns': {
      const p = block.props as import('../types').ColumnsProps;
      const colBlocks = block.children || [];
      const innerPad = pad + '  ';
      let html = `${pad}<div class="columns columns-${p.count} ${className}"${styleStr ? ` style="${styleStr}"` : ''}>\n`;
      for (let i = 0; i < p.count; i++) {
        html += `${innerPad}<div class="column">\n`;
        if (colBlocks[i]) {
          html += blockToHtml(colBlocks[i], indent + 2) + '\n';
        }
        html += `${innerPad}</div>\n`;
      }
      html += `${pad}</div>`;
      return html;
    }
    case 'spacer': {
      const p = block.props as import('../types').SpacerProps;
      return `${pad}<br data-height="${p.height}" class="spacer ${className}"${styleStr ? ` style="${styleStr}"` : ''} />`;
    }
    case 'wrapper': {
      const p = block.props as import('../types').WrapperProps;
      const colBlocks = block.children || [];
      const childrenHtml = colBlocks.map((child: Block) => blockToHtml(child, indent + 1)).join('\n');
      return `${pad}<${p.tag} class="wrapper ${className}"${styleStr ? ` style="${styleStr}"` : ''}>\n${childrenHtml}\n${pad}</${p.tag}>`;
    }
    case 'pageDivider': {
      const p = block.props as import('../types').PageDividerProps;
      const variantClass = p.variant === 'gradient' ? 'page-divider-gradient' : '';
      let styleAddon = '';
      if (p.variant !== 'gradient') {
        const borderStyle = p.variant === 'dashed' ? 'dashed' : p.variant === 'dotted' ? 'dotted' : p.variant === 'double' ? 'double' : 'solid';
        styleAddon = ` style="border-top: ${p.thickness || '2px'} ${borderStyle} ${p.color || '#94a3b8'}; margin: ${p.spacing || '16px'} 0;"`;
      } else {
        styleAddon = ` style="background: linear-gradient(to right, transparent, ${p.color || '#94a3b8'}, transparent); height: ${p.thickness || '2px'}; margin: ${p.spacing || '16px'} 0;"`;
      }
      return `${pad}<hr data-variant="${p.variant}" data-thickness="${p.thickness}" data-spacing="${p.spacing}" class="page-divider ${variantClass} ${className}"${styleAddon} />`;
    }
    default:
      return '';
  }
}

function blockStyleToCss(style: BlockStyle): string {
  const parts: string[] = [];
  if (style.padding) parts.push(`padding: ${style.padding}`);
  if (style.margin) parts.push(`margin: ${style.margin}`);
  if (style.backgroundColor) parts.push(`background-color: ${style.backgroundColor}`);
  if (style.border) parts.push(`border: ${style.border}`);
  if (style.fontSize) parts.push(`font-size: ${style.fontSize}`);
  if (style.color) parts.push(`color: ${style.color}`);
  if (style.textAlign) parts.push(`text-align: ${style.textAlign}`);
  if (style.fontFamily) parts.push(`font-family: ${style.fontFamily}`);
  if (style.fontWeight) parts.push(`font-weight: ${style.fontWeight}`);
  if (style.lineHeight) parts.push(`line-height: ${style.lineHeight}`);
  if (style.letterSpacing) parts.push(`letter-spacing: ${style.letterSpacing}`);
  if (style.textTransform) parts.push(`text-transform: ${style.textTransform}`);
  if (style.textDecoration) parts.push(`text-decoration: ${style.textDecoration}`);
  if (style.borderRadius) parts.push(`border-radius: ${style.borderRadius}`);
  if (style.borderTop) parts.push(`border-top: ${style.borderTop}`);
  if (style.borderBottom) parts.push(`border-bottom: ${style.borderBottom}`);
  if (style.borderLeft) parts.push(`border-left: ${style.borderLeft}`);
  if (style.borderRight) parts.push(`border-right: ${style.borderRight}`);
  if (style.boxShadow) parts.push(`box-shadow: ${style.boxShadow}`);
  if (style.width) parts.push(`width: ${style.width}`);
  if (style.height) parts.push(`height: ${style.height}`);
  if (style.maxWidth) parts.push(`max-width: ${style.maxWidth}`);
  if (style.minHeight) parts.push(`min-height: ${style.minHeight}`);
  if (style.display) parts.push(`display: ${style.display}`);
  if (style.flexDirection) parts.push(`flex-direction: ${style.flexDirection}`);
  if (style.gap) parts.push(`gap: ${style.gap}`);
  if (style.opacity) parts.push(`opacity: ${style.opacity}`);
  if (style.overflow) parts.push(`overflow: ${style.overflow}`);
  return parts.join('; ');
}

function parseInlineStyle(styleStr: string): BlockStyle {
  const style: BlockStyle = {};
  const rules = styleStr.split(';').map(r => r.trim()).filter(Boolean);
  for (const rule of rules) {
    const colonIdx = rule.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = rule.slice(0, colonIdx).trim();
    const value = rule.slice(colonIdx + 1).trim();
    const styleMap: Record<string, keyof BlockStyle> = {
      'padding': 'padding',
      'margin': 'margin',
      'background-color': 'backgroundColor',
      'border': 'border',
      'font-size': 'fontSize',
      'color': 'color',
      'text-align': 'textAlign',
      'font-family': 'fontFamily',
      'font-weight': 'fontWeight',
      'line-height': 'lineHeight',
      'letter-spacing': 'letterSpacing',
      'text-transform': 'textTransform',
      'text-decoration': 'textDecoration',
      'border-radius': 'borderRadius',
      'border-top': 'borderTop',
      'border-bottom': 'borderBottom',
      'border-left': 'borderLeft',
      'border-right': 'borderRight',
      'box-shadow': 'boxShadow',
      'width': 'width',
      'height': 'height',
      'max-width': 'maxWidth',
      'min-height': 'minHeight',
      'display': 'display',
      'flex-direction': 'flexDirection',
      'gap': 'gap',
      'opacity': 'opacity',
      'overflow': 'overflow',
    };
    const key = styleMap[prop];
    if (key) {
      (style as Record<string, string>)[key] = value;
    }
  }
  return style;
}

function parseElementToBlock(el: Element): Block | null {
  const tag = el.tagName.toLowerCase();
  let block: Block | null = null;

  if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
    block = createBlock('heading');
    (block.props as HeadingProps).level = parseInt(tag[1]) as 1 | 2 | 3 | 4;
    (block.props as HeadingProps).text = el.textContent || '';
  } else if (tag === 'p') {
    block = createBlock('paragraph');
    (block.props as ParagraphProps).text = el.textContent || '';
    (block.props as ParagraphProps).html = el.innerHTML || undefined;
  } else if (tag === 'figure') {
    const img = el.querySelector('img');
    if (img) {
      block = createBlock('image');
      (block.props as ImageProps).src = img.getAttribute('src') || '';
      (block.props as ImageProps).alt = img.getAttribute('alt') || '';
      const figcaption = el.querySelector('figcaption');
      if (figcaption) (block.props as ImageProps).caption = figcaption.textContent || '';
    }
  } else if (tag === 'table') {
    block = createBlock('table');
    const rows: string[][] = [];
    let headerRows = 0;
    for (const tr of Array.from(el.querySelectorAll('tr'))) {
      const cells = Array.from(tr.querySelectorAll('th, td')).map(cell => cell.textContent || '');
      rows.push(cells);
      if (tr.querySelector('th')) headerRows++;
    }
    (block.props as TableProps).rows = rows.length ? rows : [['']];
    (block.props as TableProps).headerRows = headerRows || 1;
  } else if (tag === 'ul' || tag === 'ol') {
    block = createBlock('list');
    (block.props as ListProps).type = tag === 'ol' ? 'ordered' : 'unordered';
    (block.props as ListProps).items = Array.from(el.querySelectorAll('li')).map(li => ({
      id: generateId(),
      text: li.textContent || '',
    }));
  } else if (tag === 'pre') {
    const codeEl = el.querySelector('code');
    block = createBlock('code');
    (block.props as CodeProps).code = codeEl ? (codeEl.textContent || '') : (el.textContent || '');
    const langClass = codeEl?.className.match(/language-(\w+)/);
    if (langClass) (block.props as CodeProps).language = langClass[1];
  } else if (tag === 'hr') {
    block = createBlock('divider');
    if (el.classList.contains('divider-dots')) (block.props as DividerProps).style = 'dots';
    else if (el.classList.contains('divider-double')) (block.props as DividerProps).style = 'double';
  } else if (tag === 'div' && el.classList.contains('cover')) {
    block = createBlock('cover');
    const h1 = el.querySelector('h1');
    if (h1) (block.props as CoverProps).title = h1.textContent || '';
    const authorEl = el.querySelector('.author');
    if (authorEl) (block.props as CoverProps).author = authorEl.textContent || '';
    const dateEl = el.querySelector('.date');
    if (dateEl) (block.props as CoverProps).date = dateEl.textContent || '';
    const subtitleP = el.querySelector('p:not(.author):not(.date)');
    if (subtitleP && h1 && subtitleP !== h1) (block.props as CoverProps).subtitle = subtitleP.textContent || '';
  } else if (tag === 'div' && el.classList.contains('page-break')) {
    block = createBlock('pagebreak');
  } else if (tag === 'div' && el.classList.contains('callout')) {
    block = createBlock('callout');
    const p = el.querySelector('p');
    if (p) (block.props as CalloutProps).text = p.textContent || '';
    if (el.classList.contains('callout-warning')) (block.props as CalloutProps).variant = 'warning';
    else if (el.classList.contains('callout-caution')) (block.props as CalloutProps).variant = 'caution';
    else if (el.classList.contains('callout-tip')) (block.props as CalloutProps).variant = 'tip';
    else if (el.classList.contains('callout-important')) (block.props as CalloutProps).variant = 'important';
    else (block.props as CalloutProps).variant = 'note';
  } else if (tag === 'div' && el.classList.contains('columns')) {
    block = createBlock('columns');
    const cols = el.querySelectorAll('.column');
    const colBlocks: Block[] = [];
    for (const col of Array.from(cols)) {
      if (col.firstElementChild) {
        const innerHtml = col.firstElementChild.outerHTML;
        const colBlock = createBlock('paragraph');
        (colBlock.props as ParagraphProps).html = innerHtml;
        (colBlock.props as ParagraphProps).text = col.textContent || '';
        colBlocks.push(colBlock);
      }
    }
    (block.props as ColumnsProps).count = colBlocks.length || 2;
    block.children = colBlocks.length ? colBlocks : [createBlock('paragraph'), createBlock('paragraph')];
  } else if (tag === 'br' || (tag === 'div' && el.classList.contains('spacer'))) {
    block = createBlock('spacer');
    const height = el.getAttribute('data-height') || '32';
    (block.props as SpacerProps).height = height;
  } else if ((tag === 'div' || tag === 'section' || tag === 'article' || tag === 'aside') && el.classList.contains('wrapper')) {
    block = createBlock('wrapper');
    (block.props as WrapperProps).tag = tag as 'div' | 'section' | 'article' | 'aside';
    const children: Block[] = [];
    for (const child of Array.from(el.children)) {
      const childBlock = parseElementToBlock(child);
      if (childBlock) children.push(childBlock);
    }
    block.children = children;
  } else if (tag === 'hr' && el.classList.contains('page-divider')) {
    block = createBlock('pageDivider');
    const variant = el.getAttribute('data-variant') || 'solid';
    const thickness = el.getAttribute('data-thickness') || '2px';
    const spacing = el.getAttribute('data-spacing') || '16px';
    (block.props as PageDividerProps).variant = variant as 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient';
    (block.props as PageDividerProps).thickness = thickness;
    (block.props as PageDividerProps).spacing = spacing;
  } else {
    block = createBlock('html');
    (block.props as HtmlProps).html = el.outerHTML;
  }

  // Parse inline styles
  const styleAttr = el.getAttribute('style');
  if (styleAttr && block) {
    block.style = parseInlineStyle(styleAttr);
  }

  return block;
}
