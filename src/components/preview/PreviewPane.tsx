import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useEditorStore, usePreviewStore, useDocumentStore } from '../../stores';
import { PAGE_SIZES, type Block, type HeadingProps, type ParagraphProps, type ImageProps, type TableProps, type ListProps, type CalloutProps, type CodeProps, type DividerProps, type ColumnsProps, type CoverProps, type HtmlProps, type BlockStyle, type SpacerProps, type WrapperProps, type PageDividerProps } from '../../types';
import { ZoomIn, ZoomOut, Monitor, FileText, Printer } from 'lucide-react';

const HIGHLIGHTJS_VERSION = '11.11.1';
const MERMAID_VERSION = '11.13.0';

function hasMermaidBlock(blocks: Block[]): boolean {
  for (const block of blocks) {
    if (block.type === 'code' && (block.props as CodeProps).language?.toLowerCase() === 'mermaid') return true;
    if (block.children && hasMermaidBlock(block.children)) return true;
  }
  return false;
}

function getCodeHighlightHead(theme: 'light' | 'dark', hasMermaid: boolean): string {
  const hljsTheme = theme === 'dark' ? 'github-dark.min.css' : 'github.min.css';
  let head = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@${HIGHLIGHTJS_VERSION}/build/styles/${hljsTheme}">`;
  head += `\n<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@${HIGHLIGHTJS_VERSION}/build/highlight.min.js"></script>`;
  if (hasMermaid) {
    head += `\n<script src="https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js"></script>`;
  }
  return head;
}

function getCodeHighlightScript(hasMermaid: boolean): string {
  let script = `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('pre code:not(.language-mermaid)').forEach(function(el) {
    if (!el.dataset.highlighted) {
      hljs.highlightElement(el);
      el.dataset.highlighted = 'true';
    }
  });
`;
  if (hasMermaid) {
    script += `
  mermaid.initialize({ startOnLoad: false, theme: 'dark', fontFamily: "'JetBrains Mono', monospace" });
  var mermaidBlocks = document.querySelectorAll('pre.language-mermaid');
  if (mermaidBlocks.length > 0) {
    var id = 0;
    mermaidBlocks.forEach(function(block) {
      var codeEl = block.querySelector('code') || block;
      var definition = codeEl.textContent;
      var container = document.createElement('div');
      container.className = 'mermaid-diagram';
      container.style.background = 'white';
      container.style.padding = '1rem';
      container.style.borderRadius = '0.5rem';
      container.style.margin = '0.5rem 0';
      container.style.overflowX = 'auto';
      mermaid.render('mermaid-' + (id++), definition).then(function(result) {
        container.innerHTML = result.svg;
        block.parentNode.replaceChild(container, block);
      }).catch(function(err) {
        container.innerHTML = '<pre style="color:red;">Mermaid Error: ' + err.message + '</pre>';
        block.parentNode.replaceChild(container, block);
      });
    });
  }
`;
  }
  script += `});\n</script>`;
  return script;
}

export function PreviewPane() {
  const { blocks, htmlSource, cssSource, headSource, mode } = useEditorStore();
  const { previewMode, zoom, pageSize, orientation, setPreviewMode, setZoom } = usePreviewStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const dimensions = useMemo(() => {
    const size = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
    return orientation === 'landscape'
      ? { width: size.height, height: size.width }
      : size;
  }, [pageSize, orientation]);

  const generateHtml = useCallback(() => {
    const doc = useDocumentStore.getState().getCurrentDocument();
    const settings = doc?.settings;
    const fontFamily = settings?.fontFamily || 'Inter';
    const baseFontSize = settings?.baseFontSize || 16;
    const pageBackground = settings?.pageBackground;
    const customCss = settings?.customCss || '';
    const hasMermaid = hasMermaidBlock(blocks);

    const bodyStyles: string[] = [
      `font-family: '${fontFamily}', system-ui, sans-serif`,
      `font-size: ${baseFontSize}px`,
      'line-height: 1.6',
      'color: #111827',
    ];
    if (pageBackground) bodyStyles.push(`background: ${pageBackground}`);

    // Page/Print mode specific CSS
    const pagePrintCss = previewMode !== 'web' ? `
  /* Page/Print mode specific styles */
  @page { size: ${pageSize} ${orientation}; margin: 20mm; }
  body { 
    ${bodyStyles.join('; ')} !important;
    padding: 20mm !important;
    max-width: ${dimensions.width}px !important;
    margin: 0 auto !important;
    min-height: auto !important;
    width: auto !important;
    transform: none !important;
  }
  .page-break { page-break-after: always; height: 0; }
  .cover {
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 40mm - 40mm);
    min-height: calc(100dvh - 40mm - 40mm);
    page-break-after: always;
    page-break-inside: avoid;
  }
  .cover h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  .cover p { font-size: 1.125rem; color: #6b7280; margin-top: 0.5rem; }
  .cover .author, .cover .date { font-size: 0.875rem; color: #9ca3af; }
  .callout { padding: 1rem 1rem 1rem 0.75rem; border-radius: 0.5rem; border-left: 4px solid; margin: 0.5rem 0; page-break-inside: avoid; }
  .callout-title { font-weight: 700; font-size: 0.85em; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.4rem; }
  .callout-note { background: #dbeafe; border-color: #3b82f6; color: #1e40af; }
  .callout-tip { background: #dcfce7; border-color: #22c55e; color: #166534; }
  .callout-important { background: #f3e8ff; border-color: #a855f7; color: #6b21a8; }
  .callout-warning { background: #fef9c3; border-color: #eab308; color: #854d0e; }
  .callout-caution { background: #fee2e2; border-color: #ef4444; color: #991b1b; }
  table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; page-break-inside: avoid; }
  th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #f9fafb; font-weight: 600; }
  pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; page-break-inside: avoid; }
  pre code { background: none; padding: 0; font-size: 0.85em; line-height: 1.5; color: #cdd6f4; }
  pre.language-mermaid { background: #1e1e2e; border: 1px solid #313244; }
  code { font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
  :not(pre) > code { background: rgba(49,50,68,0.6); color: #cba6f7; padding: 0.2em 0.4em; border-radius: 0.25rem; }
  .mermaid-diagram { background: #1e1e2e; padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0; overflow-x: auto; border: 1px solid #313244; }
  .mermaid-diagram svg { max-width: 100%; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
  hr.divider-dots { border-top-style: dotted; }
  hr.divider-double { border-top: 3px double #e5e7eb; }
  .spacer { display: block; }
  .wrapper { display: block; }
  .page-divider { border: none; }
  .page-divider-gradient { background: linear-gradient(to right, transparent, #94a3b8, transparent); height: 2px; }
  figure { margin: 0; page-break-inside: avoid; }
  figure img { max-width: 100%; height: auto; }
  figcaption { text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; }
  .columns { display: grid; gap: 1rem; page-break-inside: avoid; }
  .columns-2 { grid-template-columns: 1fr 1fr; }
  .columns-3 { grid-template-columns: 1fr 1fr 1fr; }
  h1, h2, h3 { page-break-after: avoid; }
  @media print {
    body { padding: 15mm !important; }
    .page-break { page-break-after: always; }
  }
` : `
  /* Web mode styles - same as page/print for consistency */
  body { 
    ${bodyStyles.join('; ')} !important;
    padding: 20mm !important;
    max-width: ${dimensions.width}px !important;
    margin: 0 auto !important;
    min-height: auto !important;
  }
  .page-break { page-break-after: always; height: 0; }
  .cover {
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 40mm - 40mm);
    min-height: calc(100dvh - 40mm - 40mm);
    page-break-after: always;
    page-break-inside: avoid;
  }
  .cover h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  .cover p { font-size: 1.125rem; color: #6b7280; margin-top: 0.5rem; }
  .cover .author, .cover .date { font-size: 0.875rem; color: #9ca3af; }
  .callout { padding: 1rem 1rem 1rem 0.75rem; border-radius: 0.5rem; border-left: 4px solid; margin: 0.5rem 0; }
  .callout-title { font-weight: 700; font-size: 0.85em; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.4rem; }
  .callout-note { background: #dbeafe; border-color: #3b82f6; color: #1e40af; }
  .callout-tip { background: #dcfce7; border-color: #22c55e; color: #166534; }
  .callout-important { background: #f3e8ff; border-color: #a855f7; color: #6b21a8; }
  .callout-warning { background: #fef9c3; border-color: #eab308; color: #854d0e; }
  .callout-caution { background: #fee2e2; border-color: #ef4444; color: #991b1b; }
  table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
  th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #f9fafb; font-weight: 600; }
  pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; }
  pre code { background: none; padding: 0; font-size: 0.85em; line-height: 1.5; color: #cdd6f4; }
  pre.language-mermaid { background: #1e1e2e; border: 1px solid #313244; }
  code { font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
  :not(pre) > code { background: rgba(49,50,68,0.6); color: #cba6f7; padding: 0.2em 0.4em; border-radius: 0.25rem; }
  .mermaid-diagram { background: #1e1e2e; padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0; overflow-x: auto; border: 1px solid #313244; }
  .mermaid-diagram svg { max-width: 100%; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
  hr.divider-dots { border-top-style: dotted; }
  hr.divider-double { border-top: 3px double #e5e7eb; }
  .spacer { display: block; }
  .wrapper { display: block; }
  .page-divider { border: none; }
  .page-divider-gradient { background: linear-gradient(to right, transparent, #94a3b8, transparent); height: 2px; }
  figure img { max-width: 100%; height: auto; }
  figcaption { text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; }
  .columns-2, .columns-3 { display: grid; gap: 1rem; }
  .columns-2 { grid-template-columns: 1fr 1fr; }
  .columns-3 { grid-template-columns: 1fr 1fr 1fr; }
  @media print {
    .page-break { page-break-after: always; }
  }
`;

    const codeHighlightHead = getCodeHighlightHead('dark', hasMermaid);
    const codeHighlightScript = getCodeHighlightScript(hasMermaid);

    if (mode === 'code') {
      // In Code Mode, also include block styles from current blocks to prevent styles from going black-white
      const blockStyles = blocks.map(block => {
        const id = block.id.split('-')[0];
        const className = `.block-${block.type}-${id}`;
        const css = blockStyleToCss(block.style);
        // Use !important to override Tailwind preflight resets
        return css ? `${className} { ${css} !important; }` : '';
      }).filter(Boolean).join('\n');

      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @import url('https://cdn.jsdelivr.net/npm/tailwindcss@4/dist/tailwind.css');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  ${pagePrintCss}
  ${blockStyles}
  ${cssSource}
  ${customCss}
</style>
${codeHighlightHead}
${headSource}
</head>
<body>
${htmlSource || '<p>Start writing in code mode...</p>'}
${codeHighlightScript}
</body>
</html>`;
    }

    const blocksHtml = blocks.map(blockToHtml).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @import url('https://cdn.jsdelivr.net/npm/tailwindcss@4/dist/tailwind.css');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  ${pagePrintCss}
  ${cssSource}
  ${customCss}
</style>
${codeHighlightHead}
${headSource}
</head>
<body>
${blocksHtml}
${codeHighlightScript}
</body>
</html>`;
  }, [blocks, htmlSource, cssSource, headSource, mode, previewMode, pageSize, orientation, dimensions]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const html = generateHtml();
    iframeRef.current.srcdoc = html;
  }, [generateHtml]);

  const previewClassName = useMemo(() => {
    let cls = 'bg-white shadow-lg transition-all duration-200 mx-auto';
    if (previewMode === 'page') {
      cls += ' border border-gray-200';
    }
    return cls;
  }, [previewMode]);

  const previewStyle = useMemo((): React.CSSProperties => {
    const doc = useDocumentStore.getState().getCurrentDocument();
    const settings = doc?.settings;
    const pageBackground = settings?.pageBackground;
    const pageBorderRadius = settings?.pageBorderRadius;
    const pageShadow = settings?.pageShadow;

    // All modes now use page dimensions for consistency
    return {
      width: dimensions.width,
      minHeight: dimensions.height,
      padding: 0, // Padding is handled inside iframe body
      background: pageBackground || undefined,
      borderRadius: pageBorderRadius || undefined,
      boxShadow: pageShadow || undefined,
    };
  }, [previewMode, dimensions]);

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-1">
          <button onClick={() => setPreviewMode('web')} className={`p-1.5 rounded text-sm flex items-center gap-1.5 ${previewMode === 'web' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <Monitor className="w-4 h-4" /> Web
          </button>
          <button onClick={() => setPreviewMode('page')} className={`p-1.5 rounded text-sm flex items-center gap-1.5 ${previewMode === 'page' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <FileText className="w-4 h-4" /> Page
          </button>
          <button onClick={() => setPreviewMode('print')} className={`p-1.5 rounded text-sm flex items-center gap-1.5 ${previewMode === 'print' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(zoom - 10)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-gray-500 w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(zoom + 10)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div className={previewClassName} style={{ ...previewStyle, transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
          <iframe
            ref={iframeRef}
            title="Preview"
            className="w-full border-0 bg-white"
            style={{ minHeight: previewMode === 'web' ? '100%' : dimensions.height }}
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}

function blockToHtml(block: Block): string {
  const styleStr = blockStyleToCss(block.style);
  const id = block.id.split('-')[0];
  const className = `block-${block.type}-${id}`;
  const attrs = styleStr ? ` class="${className}" style="${styleStr}"` : ` class="${className}"`;

  switch (block.type) {
    case 'heading': {
      const p = block.props as HeadingProps;
      return `<h${p.level}${attrs}>${escapeHtml(p.text)}</h${p.level}>`;
    }
    case 'paragraph': {
      const p = block.props as ParagraphProps;
      return `<p${attrs}>${escapeHtml(p.text)}</p>`;
    }
    case 'image': {
      const p = block.props as ImageProps;
      const caption = p.caption ? `<figcaption>${escapeHtml(p.caption)}</figcaption>` : '';
      return `<figure${attrs}><img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.alt)}" />${caption}</figure>`;
    }
    case 'table': {
      const p = block.props as TableProps;
      let html = `<table${attrs}>`;
      p.rows.forEach((row: string[], ri: number) => {
        const tag = ri < p.headerRows ? 'th' : 'td';
        html += '<tr>' + row.map((cell: string) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join('') + '</tr>';
      });
      html += '</table>';
      return html;
    }
    case 'list': {
      const p = block.props as ListProps;
      const tag = p.type === 'ordered' ? 'ol' : 'ul';
      return `<${tag}${attrs}>${p.items.map((i) => `<li>${escapeHtml(i.text)}</li>`).join('')}</${tag}>`;
    }
    case 'callout': {
      const p = block.props as CalloutProps;
      const icons: Record<string, string> = { note: 'ℹ', tip: '✓', important: '◆', warning: '⚠', caution: '✕' };
      const labels: Record<string, string> = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };
      const icon = icons[p.variant] || icons.note;
      const label = labels[p.variant] || labels.note;
      return `<div class="callout callout-${p.variant} ${className}"${styleStr ? ` style="${styleStr}"` : ''}><div class="callout-title">${icon} ${label}</div><p>${escapeHtml(p.text)}</p></div>`;
    }
    case 'code': {
      const p = block.props as CodeProps;
      const lang = p.language?.toLowerCase() || '';
      if (lang === 'mermaid') {
        return `<pre class="language-mermaid ${className}"${styleStr ? ` style="${styleStr}"` : ''}><code class="language-mermaid">${escapeHtml(p.code)}</code></pre>`;
      }
      return `<pre${attrs}><code class="language-${escapeHtml(p.language)}">${escapeHtml(p.code)}</code></pre>`;
    }
    case 'divider': {
      const p = block.props as DividerProps;
      const cls = p.style === 'dots' ? 'divider-dots' : p.style === 'double' ? 'divider-double' : '';
      return `<hr class="${cls} ${className}"${styleStr ? ` style="${styleStr}"` : ''} />`;
    }
    case 'pagebreak':
      return `<div class="page-break ${className}"></div>`;
    case 'cover': {
      const p = block.props as CoverProps;
      return `<div class="cover ${className}"${styleStr ? ` style="${styleStr}"` : ''}><h1>${escapeHtml(p.title)}</h1>${p.subtitle ? `<p>${escapeHtml(p.subtitle)}</p>` : ''}${p.author ? `<p class="author">${escapeHtml(p.author)}</p>` : ''}${p.date ? `<p class="date">${escapeHtml(p.date)}</p>` : ''}</div>`;
    }
    case 'html': {
      const p = block.props as HtmlProps;
      return p.html;
    }
    case 'columns': {
      const p = block.props as ColumnsProps;
      const colBlocks = block.children || [];
      const cols = Array.from({ length: p.count }, (_, i) => {
        const colContent = colBlocks[i] ? blockToHtml(colBlocks[i]) : '';
        return `<div class="column">${colContent}</div>`;
      }).join('');
      return `<div class="columns columns-${p.count} ${className}"${styleStr ? ` style="${styleStr}"` : ''}>${cols}</div>`;
    }
    case 'spacer': {
      const p = block.props as SpacerProps;
      return `<div class="spacer ${className}"${styleStr ? ` style="${styleStr}"` : ''} style="height: ${p.height || '32'}px; min-height: ${p.height || '32'}px;"></div>`;
    }
    case 'wrapper': {
      const p = block.props as WrapperProps;
      const colBlocks = block.children || [];
      const childrenHtml = colBlocks.map((child: Block) => blockToHtml(child)).join('\n');
      return `<${p.tag} class="wrapper ${className}"${styleStr ? ` style="${styleStr}"` : ''}>${childrenHtml}</${p.tag}>`;
    }
    case 'pageDivider': {
      const p = block.props as PageDividerProps;
      const variantClass = p.variant === 'gradient' ? 'page-divider-gradient' : '';
      let styleAddon = '';
      if (p.variant !== 'gradient') {
        const borderStyle = p.variant === 'dashed' ? 'dashed' : p.variant === 'dotted' ? 'dotted' : p.variant === 'double' ? 'double' : 'solid';
        styleAddon = ` style="border-top: ${p.thickness || '2px'} ${borderStyle} ${p.color || '#94a3b8'}; margin: ${p.spacing || '16px'} 0;"`;
      } else {
        styleAddon = ` style="background: linear-gradient(to right, transparent, ${p.color || '#94a3b8'}, transparent); height: ${p.thickness || '2px'}; margin: ${p.spacing || '16px'} 0;"`;
      }
      return `<hr class="page-divider ${variantClass} ${className}"${styleAddon} />`;
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

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
