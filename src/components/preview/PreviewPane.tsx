import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useEditorStore, usePreviewStore, useDocumentStore } from '../../stores';
import { PAGE_SIZES, type Block, type HeadingProps, type ParagraphProps, type ImageProps, type TableProps, type ListProps, type CalloutProps, type CodeProps, type DividerProps, type ColumnsProps, type CoverProps, type HtmlProps, type BlockStyle } from '../../types';
import { ZoomIn, ZoomOut, Monitor, FileText, Printer } from 'lucide-react';

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

    const bodyStyles: string[] = [
      `font-family: '${fontFamily}', system-ui, sans-serif`,
      `font-size: ${baseFontSize}px`,
      'line-height: 1.6',
      'color: #111827',
    ];
    if (pageBackground) bodyStyles.push(`background: ${pageBackground}`);

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
<style>
  @import url('https://cdn.jsdelivr.net/npm/tailwindcss@4/dist/tailwind.css');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { ${bodyStyles.join('; ')}; padding: 2rem; }
  ${blockStyles}
  ${cssSource}
  ${customCss}
</style>
${headSource}
</head>
<body>
${htmlSource || '<p>Start writing in code mode...</p>'}
</body>
</html>`;
    }

    const blocksHtml = blocks.map(blockToHtml).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://cdn.jsdelivr.net/npm/tailwindcss@4/dist/tailwind.css');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { ${bodyStyles.join('; ')}; }
  .page-break { page-break-after: always; height: 0; }
  .cover { text-align: center; padding: 4rem 2rem; }
  .cover h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  .cover p { font-size: 1.125rem; color: #6b7280; margin-top: 0.5rem; }
  .cover .author, .cover .date { font-size: 0.875rem; color: #9ca3af; }
  .callout { padding: 1rem; border-radius: 0.5rem; border-left: 4px solid; margin: 0.5rem 0; }
  .callout-info { background: #eff6ff; border-color: #3b82f6; }
  .callout-warning { background: #fffbeb; border-color: #f59e0b; }
  .callout-error { background: #fef2f2; border-color: #ef4444; }
  .callout-success { background: #f0fdf4; border-color: #22c55e; }
  table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
  th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #f9fafb; font-weight: 600; }
  pre { background: #1f2937; color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; }
  pre code { background: none; padding: 0; }
  code { font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
  hr.divider-dots { border-top-style: dotted; }
  hr.divider-double { border-top: 3px double #e5e7eb; }
  figure img { max-width: 100%; height: auto; }
  figcaption { text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; }
  .columns-2, .columns-3 { display: grid; gap: 1rem; }
  .columns-2 { grid-template-columns: 1fr 1fr; }
  .columns-3 { grid-template-columns: 1fr 1fr 1fr; }
  @media print {
    .page-break { page-break-after: always; }
  }
  ${cssSource}
  ${customCss}
</style>
${headSource}
</head>
<body>
${blocksHtml}
</body>
</html>`;
  }, [blocks, htmlSource, cssSource, headSource, mode]);

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
    const pagePadding = settings?.pagePadding;
    const pageBorderRadius = settings?.pageBorderRadius;
    const pageShadow = settings?.pageShadow;

    if (previewMode === 'web') {
      return { minHeight: '100%', padding: '2rem', width: '100%', maxWidth: '100%' };
    }
    if (previewMode === 'page') {
      return {
        width: dimensions.width,
        minHeight: dimensions.height,
        padding: pagePadding || '25mm',
        background: pageBackground || undefined,
        borderRadius: pageBorderRadius || undefined,
        boxShadow: pageShadow || undefined,
      };
    }
    // print mode
    return {
      width: dimensions.width,
      minHeight: dimensions.height,
      padding: pagePadding || '25mm',
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
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

function blockToHtml(block: Block): string {
  const styleStr = blockStyleToCss(block.style);
  const attrs = styleStr ? ` style="${styleStr}"` : '';

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
      return `<div class="callout callout-${p.variant}"${attrs}><p>${escapeHtml(p.text)}</p></div>`;
    }
    case 'code': {
      const p = block.props as CodeProps;
      return `<pre${attrs}><code class="language-${escapeHtml(p.language)}">${escapeHtml(p.code)}</code></pre>`;
    }
    case 'divider': {
      const p = block.props as DividerProps;
      const cls = p.style === 'dots' ? 'divider-dots' : p.style === 'double' ? 'divider-double' : '';
      return `<hr${cls ? ` class="${cls}"` : ''}${attrs} />`;
    }
    case 'pagebreak':
      return '<div class="page-break"></div>';
    case 'cover': {
      const p = block.props as CoverProps;
      return `<div class="cover"${attrs}><h1>${escapeHtml(p.title)}</h1>${p.subtitle ? `<p>${escapeHtml(p.subtitle)}</p>` : ''}${p.author ? `<p class="author">${escapeHtml(p.author)}</p>` : ''}${p.date ? `<p class="date">${escapeHtml(p.date)}</p>` : ''}</div>`;
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
      return `<div class="columns columns-${p.count}"${attrs}>${cols}</div>`;
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
