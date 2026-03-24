import { useState } from 'react';
import { useEditorStore, useDocumentStore } from '../../stores';
import { type ExportFormat, PAGE_SIZES, type PageSize, type BlockStyle, type Block, type ColumnsProps, type HeadingProps, type ParagraphProps, type ImageProps, type TableProps, type ListProps, type CalloutProps, type CodeProps, type CoverProps, type HtmlProps } from '../../types';
import { X, FileText, Code, FileJson, Archive, FileDown, Check } from 'lucide-react';
import JSZip from 'jszip';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { blocks, htmlSource, cssSource, headSource, mode } = useEditorStore();
  const { getCurrentDocument } = useDocumentStore();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margins, setMargins] = useState('25mm');
  const [includeTailwind, setIncludeTailwind] = useState(true);
  const [inlineAssets, setInlineAssets] = useState(true);

  const formats: { id: ExportFormat; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'pdf', label: 'PDF', icon: FileDown, desc: 'Print-ready via browser' },
    { id: 'html', label: 'HTML', icon: Code, desc: 'Self-contained file' },
    { id: 'markdown', label: 'Markdown', icon: FileText, desc: 'CommonMark format' },
    { id: 'json', label: 'JSON', icon: FileJson, desc: 'Full document state' },
    { id: 'folio', label: '.folio', icon: Archive, desc: 'Portable ZIP archive' },
  ];

  const handleExport = async () => {
    const doc = getCurrentDocument();
    const title = doc?.title || 'document';

    try {
      switch (format) {
      case 'pdf': {
        const html = generateExportHtml();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
        break;
      }
      case 'html': {
        const html = generateExportHtml();
        downloadFile(`${title}.html`, html, 'text/html');
        break;
      }
      case 'markdown': {
        const md = blocksToMarkdown(blocks);
        downloadFile(`${title}.md`, md, 'text/markdown');
        break;
      }
      case 'json': {
        const doc = getCurrentDocument();
        if (doc) {
          downloadFile(`${title}.json`, JSON.stringify(doc, null, 2), 'application/json');
        }
        break;
      }
      case 'folio': {
        const doc = getCurrentDocument();
        const zip = new JSZip();
        zip.file('manifest.json', JSON.stringify({
          version: '1.0.0',
          appVersion: '0.1.0',
          title: doc?.title || 'Untitled Document',
          exportedAt: new Date().toISOString(),
        }, null, 2));
        zip.file('document.json', JSON.stringify({
          title: doc?.title || 'Untitled Document',
          blocks,
          cssSource,
          headSource,
          settings: doc?.settings || {},
        }, null, 2));
        const blob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(`${title}.folio`, blob);
        break;
      }
    }
    } catch (err) {
      console.error('Export failed:', err);
    }
    onClose();
  };

  const generateExportHtml = () => {
    const doc = getCurrentDocument();
    const settings = doc?.settings;

    const fontFamily = settings?.fontFamily || 'Inter';
    const baseFontSize = settings?.baseFontSize || 16;
    const pageBackground = settings?.pageBackground;
    const pageBorderRadius = settings?.pageBorderRadius;
    const pageShadow = settings?.pageShadow;
    const customCss = settings?.customCss || '';

    // Calculate page dimensions for consistent rendering
    const size = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
    const pageWidth = orientation === 'landscape' ? size.height : size.width;

    const pageStyles: string[] = [];
    if (pageBackground) pageStyles.push(`background: ${pageBackground}`);
    // Don't add padding here - @page margin handles it for print
    if (pageBorderRadius) pageStyles.push(`border-radius: ${pageBorderRadius}`);
    if (pageShadow) pageStyles.push(`box-shadow: ${pageShadow}`);
    const pageStyleAttr = pageStyles.length ? ` style="${pageStyles.join('; ')}"` : '';

    const bodyStyles: string[] = [
      `font-family: '${fontFamily}', system-ui, sans-serif`,
      `font-size: ${baseFontSize}px`,
      'line-height: 1.6',
      'color: #111827',
    ];
    if (pageBackground) bodyStyles.push(`background: ${pageBackground}`);

    if (mode === 'code') {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc?.title || 'Document'}</title>
<style>
  @import url('https://cdn.jsdelivr.net/npm/tailwindcss@4/dist/tailwind.css');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; min-height: 100%; }
  body { ${bodyStyles.join('; ')}; }
  @page { size: ${pageSize} ${orientation}; margin: ${margins}; }
  .cover {
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    page-break-after: always;
    page-break-inside: avoid;
  }
  .cover h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  .cover p { font-size: 1.125rem; color: #6b7280; margin-top: 0.5rem; }
  .cover .author, .cover .date { font-size: 0.875rem; color: #9ca3af; }
  .page-break { page-break-after: always; }
  ${cssSource}
  ${customCss}
</style>${headSource}</head><body${pageStyleAttr}>${htmlSource}</body></html>`;
    }

    const blocksHtml = blocks.map(b => blockToSimpleHtml(b)).join('\n');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc?.title || 'Document'}</title>
<style>
  @import url('https://cdn.jsdelivr.net/npm/tailwindcss@4/dist/tailwind.css');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; min-height: 100%; }
  body { ${bodyStyles.join('; ')}; }
  @page { size: ${pageSize} ${orientation}; margin: ${margins}; }
  .page { width: 100%; max-width: ${pageWidth}px; margin: 0 auto; min-height: 100%; }
  .page-break { page-break-after: always; }
  .cover {
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    page-break-after: always;
    page-break-inside: avoid;
  }
  .cover h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  .cover p { font-size: 1.125rem; color: #6b7280; margin-top: 0.5rem; }
  .cover .author, .cover .date { font-size: 0.875rem; color: #9ca3af; }
  .callout { padding: 1rem; border-radius: 0.5rem; border-left: 4px solid; margin: 0.5rem 0; }
  .callout-info { background: #eff6ff; border-color: #3b82f6; }
  .callout-warning { background: #fffbeb; border-color: #f59e0b; }
  .callout-error { background: #fef2f2; border-color: #ef4444; }
  .callout-success { background: #f0fdf4; border-color: #22c55e; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
  th { background: #f9fafb; }
  pre { background: #1f2937; color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
  .columns-2, .columns-3 { display: grid; gap: 1rem; }
  .columns-2 { grid-template-columns: 1fr 1fr; }
  .columns-3 { grid-template-columns: 1fr 1fr 1fr; }
  ${cssSource}
  ${customCss}
</style></head><body><div class="page"${pageStyleAttr}>${blocksHtml}</div></body></html>`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200/60 dark:border-surface-700/50">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">Export Document</h2>
            <p className="text-[13px] text-surface-400 mt-0.5">Choose a format and configure settings.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format selection */}
          <div>
            <label className="form-label">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      format === f.id
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-900/20 shadow-sm'
                        : 'border-surface-200/60 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/30'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      format === f.id
                        ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                        : 'bg-surface-100 dark:bg-surface-700/60 text-surface-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold ${
                        format === f.id ? 'text-brand-700 dark:text-brand-300' : 'text-surface-900 dark:text-surface-100'
                      }`}>{f.label}</div>
                      <div className="text-[11px] text-surface-400 mt-0.5">{f.desc}</div>
                    </div>
                    {format === f.id && (
                      <Check className="w-4 h-4 text-brand-500 shrink-0 ml-auto mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PDF-specific settings */}
          {format === 'pdf' && (
            <div className="space-y-4 p-4 bg-surface-50/60 dark:bg-surface-900/40 rounded-xl border border-surface-200/40 dark:border-surface-700/40 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Page Size</label>
                  <select value={pageSize} onChange={e => setPageSize(e.target.value as PageSize)} className="input-select">
                    {(Object.keys(PAGE_SIZES) as PageSize[]).filter(s => s !== 'Custom').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Orientation</label>
                  <select value={orientation} onChange={e => setOrientation(e.target.value as 'portrait' | 'landscape')} className="input-select">
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Margins</label>
                <select value={margins} onChange={e => setMargins(e.target.value)} className="input-select">
                  <option value="12mm">Narrow (12mm)</option>
                  <option value="25mm">Normal (25mm)</option>
                  <option value="38mm">Wide (38mm)</option>
                </select>
              </div>
            </div>
          )}

          {/* HTML-specific settings */}
          {format === 'html' && (
            <div className="space-y-3 p-4 bg-surface-50/60 dark:bg-surface-900/40 rounded-xl border border-surface-200/40 dark:border-surface-700/40 animate-fade-in">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={includeTailwind} onChange={e => setIncludeTailwind(e.target.checked)} className="input-checkbox" />
                <div>
                  <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">Include Tailwind CDN</span>
                  <p className="text-[11px] text-surface-400">Adds Tailwind CSS v4 from CDN</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={inlineAssets} onChange={e => setInlineAssets(e.target.checked)} className="input-checkbox" />
                <div>
                  <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">Inline assets</span>
                  <p className="text-[11px] text-surface-400">Embed images and fonts as base64</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200/60 dark:border-surface-700/50 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleExport} className="btn-primary">
            <FileDown className="w-4 h-4" /> Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
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

function blockToSimpleHtml(block: Block): string {
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
      return `<figure${attrs}><img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.alt)}" />${p.caption ? `<figcaption>${escapeHtml(p.caption)}</figcaption>` : ''}</figure>`;
    }
    case 'table': {
      const p = block.props as TableProps;
      let html = `<table${attrs}>`;
      p.rows.forEach((row: string[], ri: number) => {
        const tag = ri < p.headerRows ? 'th' : 'td';
        html += '<tr>' + row.map((c: string) => `<${tag}>${escapeHtml(c)}</${tag}>`).join('') + '</tr>';
      });
      return html + '</table>';
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
    case 'divider': return `<hr${attrs} />`;
    case 'pagebreak': return '<div class="page-break"></div>';
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
        const colContent = colBlocks[i] ? blockToSimpleHtml(colBlocks[i]) : '';
        return `<div class="column">${colContent}</div>`;
      }).join('');
      return `<div class="columns columns-${p.count}"${attrs}>${cols}</div>`;
    }
    default: return '';
  }
}

function blocksToMarkdown(blocks: any[]): string {
  return blocks.map(b => {
    switch (b.type) {
      case 'heading': return `${'#'.repeat(b.props.level)} ${b.props.text}`;
      case 'paragraph': return b.props.text;
      case 'code': return `\`\`\`${b.props.language}\n${b.props.code}\n\`\`\``;
      case 'list': return b.props.items.map((i: any) => `- ${i.text}`).join('\n');
      case 'divider': return '---';
      case 'callout': return `> **${b.props.variant.toUpperCase()}:** ${b.props.text}`;
      case 'image': return `![${b.props.alt}](${b.props.src})`;
      case 'table': {
        const rows = b.props.rows;
        let md = '';
        rows.forEach((row: string[], ri: number) => {
          md += '| ' + row.join(' | ') + ' |\n';
          if (ri === 0) md += '| ' + row.map(() => '---').join(' | ') + ' |\n';
        });
        return md;
      }
      default: return `<!-- ${b.type} block -->`;
    }
  }).join('\n\n');
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  downloadBlob(name, blob);
}

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Delay revoke so the browser can start the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
