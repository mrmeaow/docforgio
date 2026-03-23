import { create } from 'zustand';
import { produce } from 'immer';
import type { Block, BlockType, EditorMode, BlockStyle, HeadingProps, ParagraphProps, ImageProps, TableProps, ListProps, CalloutProps, CodeProps, DividerProps, ColumnsProps, CoverProps, HtmlProps } from '../types';
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
      return { ...baseBlock, props: { text: 'Callout text', variant: 'info' } };
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
      const css = state.serializeToCss();
      set({ mode, htmlSource: html, cssSource: css, codeSynced: true, dirty: true });
    } else if (mode === 'nocode' && state.mode === 'code') {
      state.deserializeFromHtml(state.htmlSource);
      set({ mode, dirty: true });
    } else {
      set({ mode, dirty: true });
    }
  },

  serializeToHtml: () => {
    const { blocks } = get();
    return blocks.map(blockToHtml).join('\n');
  },

  serializeToCss: () => {
    const { blocks } = get();
    const lines: string[] = [];

    lines.push('/* Base styles */');
    lines.push('h1, h2, h3, h4 { margin: 0; font-weight: 700; line-height: 1.25; }');
    lines.push('h1 { font-size: 2.5rem; }');
    lines.push('h2 { font-size: 2rem; }');
    lines.push('h3 { font-size: 1.5rem; }');
    lines.push('h4 { font-size: 1.25rem; }');
    lines.push('p { margin: 0; line-height: 1.6; }');
    lines.push('figure { margin: 0; }');
    lines.push('img { max-width: 100%; height: auto; display: block; }');
    lines.push('figcaption { font-size: 0.875rem; color: #666; margin-top: 0.5rem; }');
    lines.push('table { border-collapse: collapse; width: 100%; }');
    lines.push('th, td { padding: 0.5rem 0.75rem; border: 1px solid #ddd; text-align: left; }');
    lines.push('th { background: #f5f5f5; font-weight: 600; }');
    lines.push('ul, ol { margin: 0; padding-left: 1.5rem; }');
    lines.push('li { margin: 0.25rem 0; }');
    lines.push('pre { margin: 0; padding: 1rem; background: #1e1e1e; color: #d4d4d4; border-radius: 0.375rem; overflow-x: auto; }');
    lines.push('code { font-family: monospace; }');
    lines.push('hr { border: none; border-top: 1px solid #ddd; margin: 1rem 0; }');
    lines.push('hr.divider-dots { border-top-style: dotted; }');
    lines.push('hr.divider-double { border-top: 3px double #ddd; }');
    lines.push('.callout { padding: 1rem; border-radius: 0.375rem; }');
    lines.push('.callout-info { background: #eff6ff; border-left: 4px solid #3b82f6; }');
    lines.push('.callout-warning { background: #fffbeb; border-left: 4px solid #f59e0b; }');
    lines.push('.callout-error { background: #fef2f2; border-left: 4px solid #ef4444; }');
    lines.push('.callout-success { background: #f0fdf4; border-left: 4px solid #22c55e; }');
    lines.push('.cover { padding: 3rem 2rem; text-align: center; min-height: 50vh; display: flex; flex-direction: column; justify-content: center; align-items: center; }');
    lines.push('.columns { display: flex; gap: 1rem; }');
    lines.push('.column { flex: 1; }');
    lines.push('.page-break { page-break-after: always; }');
    lines.push('');

    lines.push('/* Block-specific styles */');
    for (const block of blocks) {
      const id = shortId(block.id);
      const className = `.block-${block.type}-${id}`;
      const css = blockStyleToCss(block.style);
      if (css) {
        lines.push(`${className} { ${css}; }`);
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
        else if (el.classList.contains('callout-error')) (block.props as CalloutProps).variant = 'error';
        else if (el.classList.contains('callout-success')) (block.props as CalloutProps).variant = 'success';
        else (block.props as CalloutProps).variant = 'info';
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

function blockToHtml(block: Block): string {
  const styleStr = blockStyleToCss(block.style);
  const id = shortId(block.id);
  const className = `block-${block.type}-${id}`;
  const attrs = styleStr ? ` class="${className}" style="${styleStr}"` : ` class="${className}"`;

  switch (block.type) {
    case 'heading': {
      const p = block.props as import('../types').HeadingProps;
      return `<h${p.level}${attrs}>${p.text}</h${p.level}>`;
    }
    case 'paragraph': {
      const p = block.props as import('../types').ParagraphProps;
      return `<p${attrs}>${p.html || p.text}</p>`;
    }
    case 'image': {
      const p = block.props as import('../types').ImageProps;
      const caption = p.caption ? `<figcaption>${p.caption}</figcaption>` : '';
      return `<figure${attrs}><img src="${p.src}" alt="${p.alt}" />${caption}</figure>`;
    }
    case 'table': {
      const p = block.props as import('../types').TableProps;
      let html = `<table${attrs}>`;
      p.rows.forEach((row, ri) => {
        const tag = ri < p.headerRows ? 'th' : 'td';
        html += '<tr>' + row.map(cell => `<${tag}>${cell}</${tag}>`).join('') + '</tr>';
      });
      html += '</table>';
      return html;
    }
    case 'list': {
      const p = block.props as import('../types').ListProps;
      const tag = p.type === 'ordered' ? 'ol' : 'ul';
      return `<${tag}${attrs}>${p.items.map(i => `<li>${i.text}</li>`).join('')}</${tag}>`;
    }
    case 'callout': {
      const p = block.props as import('../types').CalloutProps;
      return `<div class="callout callout-${p.variant} ${className}"${styleStr ? ` style="${styleStr}"` : ''}><p>${p.text}</p></div>`;
    }
    case 'code': {
      const p = block.props as import('../types').CodeProps;
      return `<pre${attrs}><code class="language-${p.language}">${p.code}</code></pre>`;
    }
    case 'divider': {
      const p = block.props as import('../types').DividerProps;
      const cls = p.style === 'dots' ? 'divider-dots' : p.style === 'double' ? 'divider-double' : '';
      return `<hr class="${[cls, className].filter(Boolean).join(' ')}"${styleStr ? ` style="${styleStr}"` : ''} />`;
    }
    case 'pagebreak':
      return `<div class="page-break ${className}"></div>`;
    case 'cover': {
      const p = block.props as import('../types').CoverProps;
      return `<div class="cover ${className}"${styleStr ? ` style="${styleStr}"` : ''}><h1>${p.title}</h1>${p.subtitle ? `<p>${p.subtitle}</p>` : ''}${p.author ? `<p class="author">${p.author}</p>` : ''}${p.date ? `<p class="date">${p.date}</p>` : ''}</div>`;
    }
    case 'html': {
      const p = block.props as import('../types').HtmlProps;
      return p.html;
    }
    case 'columns': {
      const p = block.props as import('../types').ColumnsProps;
      const colBlocks = block.children || [];
      const cols = Array.from({ length: p.count }, (_, i) => {
        const colContent = colBlocks[i] ? blockToHtml(colBlocks[i]) : '';
        return `<div class="column">${colContent}</div>`;
      }).join('');
      return `<div class="columns columns-${p.count} ${className}"${styleStr ? ` style="${styleStr}"` : ''}>${cols}</div>`;
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
