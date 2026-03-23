import { useState, useEffect } from 'react';
import { useEditorStore, useDocumentStore } from '../../stores';
import type { Block, HeadingProps, ParagraphProps, CalloutProps, CodeProps, DividerProps, ColumnsProps, CoverProps, BlockStyle, DocumentSettings } from '../../types';
import { Copy, Trash2, ChevronDown, ChevronRight, Palette, Type, Box, Layers, AlignLeft } from 'lucide-react';

const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  fontFamily: 'Inter',
  baseFontSize: 16,
  colorPalette: {},
  pageWidth: '210mm',
  pageNumbers: false,
  pageNumberPosition: 'bottom-center',
};

function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-surface-200/60 dark:border-surface-700/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700/40 transition-colors"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 text-surface-400" /> : <ChevronRight className="w-3.5 h-3.5 text-surface-400" />}
        <Icon className="w-3.5 h-3.5 text-surface-400" />
        <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{title}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function ColorInput({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value && !value.includes('gradient') && !value.includes('url') ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 input-field font-mono"
          placeholder={placeholder || '#000000'}
        />
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-select">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function SegmentedControl({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="segment-group">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`segment-item text-[11px] capitalize ${value === opt ? 'active' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const FONT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia' },
  { value: "'Times New Roman'", label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: "'Courier New'", label: 'Courier New' },
  { value: 'system-ui', label: 'System UI' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
];

const FONT_WEIGHT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: '100', label: '100 — Thin' },
  { value: '200', label: '200 — Extra Light' },
  { value: '300', label: '300 — Light' },
  { value: '400', label: '400 — Normal' },
  { value: '500', label: '500 — Medium' },
  { value: '600', label: '600 — Semi Bold' },
  { value: '700', label: '700 — Bold' },
  { value: '800', label: '800 — Extra Bold' },
  { value: '900', label: '900 — Black' },
  { value: 'normal', label: 'normal' },
  { value: 'bold', label: 'bold' },
];

const TEXT_TRANSFORM_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

const TEXT_DECORATION_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'none', label: 'None' },
  { value: 'underline', label: 'Underline' },
  { value: 'line-through', label: 'Line Through' },
  { value: 'overline', label: 'Overline' },
];

const DISPLAY_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'block', label: 'Block' },
  { value: 'inline', label: 'Inline' },
  { value: 'inline-block', label: 'Inline Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'inline-flex', label: 'Inline Flex' },
  { value: 'grid', label: 'Grid' },
  { value: 'none', label: 'None' },
];

const FLEX_DIRECTION_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'row', label: 'Row' },
  { value: 'column', label: 'Column' },
  { value: 'row-reverse', label: 'Row Reverse' },
  { value: 'column-reverse', label: 'Column Reverse' },
];

const OVERFLOW_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'auto', label: 'Auto' },
];

const PAGE_FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia' },
  { value: "'Times New Roman'", label: 'Times New Roman' },
  { value: "'Courier New'", label: 'Courier New' },
  { value: 'system-ui', label: 'System UI' },
  { value: 'Arial', label: 'Arial' },
];

function PageStylesPanel() {
  const doc = useDocumentStore((s) => s.getCurrentDocument());
  const settings = doc?.settings || DEFAULT_DOCUMENT_SETTINGS;

  const [pageBackground, setPageBackground] = useState(settings.pageBackground || '');
  const [pagePadding, setPagePadding] = useState(settings.pagePadding || '');
  const [pageBorderRadius, setPageBorderRadius] = useState(settings.pageBorderRadius || '');
  const [pageShadow, setPageShadow] = useState(settings.pageShadow || '');
  const [customCss, setCustomCss] = useState(settings.customCss || '');
  const [fontFamily, setFontFamily] = useState(settings.fontFamily || 'Inter');
  const [baseFontSize, setBaseFontSize] = useState(String(settings.baseFontSize || 16));
  const [fontSizeUnit, setFontSizeUnit] = useState('px');

  useEffect(() => {
    const s = doc?.settings || DEFAULT_DOCUMENT_SETTINGS;
    setPageBackground(s.pageBackground || '');
    setPagePadding(s.pagePadding || '');
    setPageBorderRadius(s.pageBorderRadius || '');
    setPageShadow(s.pageShadow || '');
    setCustomCss(s.customCss || '');
    setFontFamily(s.fontFamily || 'Inter');
    setBaseFontSize(String(s.baseFontSize || 16));
  }, [doc]);

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-4 border-b border-surface-200/60 dark:border-surface-700/50">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">Page Styles</h3>
        <p className="text-[11px] text-surface-400 mt-0.5">Document-level styling</p>
      </div>

      <CollapsibleSection title="Typography" icon={Type} defaultOpen={true}>
        <SelectInput
          label="Document Font Family"
          value={fontFamily}
          onChange={setFontFamily}
          options={PAGE_FONT_OPTIONS}
        />
        <div>
          <label className="form-label">Base Font Size</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={baseFontSize}
              onChange={(e) => setBaseFontSize(e.target.value)}
              className="flex-1 input-field"
              min={1}
            />
            <select
              value={fontSizeUnit}
              onChange={(e) => setFontSizeUnit(e.target.value)}
              className="w-16 input-select"
            >
              <option value="px">px</option>
              <option value="pt">pt</option>
              <option value="rem">rem</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Background & Border" icon={Palette} defaultOpen={true}>
        <ColorInput
          label="Page Background"
          value={pageBackground}
          onChange={setPageBackground}
          placeholder="color, gradient, or url(...)"
        />
        <TextInput
          label="Page Padding"
          value={pagePadding}
          onChange={setPagePadding}
          placeholder="e.g. 2rem, 25mm"
        />
        <TextInput
          label="Page Border Radius"
          value={pageBorderRadius}
          onChange={setPageBorderRadius}
          placeholder="e.g. 8px"
        />
        <TextInput
          label="Page Shadow"
          value={pageShadow}
          onChange={setPageShadow}
          placeholder="e.g. 0 4px 12px rgba(0,0,0,0.1)"
        />
      </CollapsibleSection>

      <CollapsibleSection title="Custom CSS" icon={Layers} defaultOpen={false}>
        <div>
          <label className="form-label">Custom CSS</label>
          <textarea
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            className="input-field font-mono resize-none"
            rows={8}
            placeholder=".page { ... }"
            spellCheck={false}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}

export function PropertiesPanel() {
  const { selectedBlockId, blocks, deleteBlock, duplicateBlock } = useEditorStore();
  const block = blocks.find((b: Block) => b.id === selectedBlockId);

  if (!block) {
    return (
      <div className="w-72 border-l border-surface-200/60 dark:border-surface-700/50 bg-white dark:bg-surface-800 overflow-hidden flex flex-col">
        <PageStylesPanel />
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-surface-200/60 dark:border-surface-700/50 bg-white dark:bg-surface-800 overflow-y-auto">
      <div className="p-4 border-b border-surface-200/60 dark:border-surface-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 capitalize">{block.type} Block</h3>
          <div className="flex gap-1">
            <button onClick={() => duplicateBlock(block.id)} className="flex items-center gap-1 text-[11px] font-semibold text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 px-2 py-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              <Copy className="w-3 h-3" /> Copy
            </button>
            <button onClick={() => deleteBlock(block.id)} className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-surface-200/60 dark:border-surface-700/50">
        <div className="px-4 py-2.5">
          <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Content</span>
        </div>
        <div className="px-4 pb-4">
          <BlockPropsEditor block={block} />
        </div>
      </div>

      <CollapsibleSection title="Typography" icon={Type} defaultOpen={true}>
        <TypographyEditor block={block} />
      </CollapsibleSection>

      <CollapsibleSection title="Spacing" icon={AlignLeft} defaultOpen={false}>
        <SpacingEditor block={block} />
      </CollapsibleSection>

      <CollapsibleSection title="Background & Border" icon={Palette} defaultOpen={false}>
        <BackgroundBorderEditor block={block} />
      </CollapsibleSection>

      <CollapsibleSection title="Layout" icon={Box} defaultOpen={false}>
        <LayoutEditor block={block} />
      </CollapsibleSection>

      <CollapsibleSection title="Classes" icon={Layers} defaultOpen={false}>
        <ClassesEditor block={block} />
      </CollapsibleSection>
    </div>
  );
}

function BlockPropsEditor({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();

  switch (block.type) {
    case 'heading': {
      const p = block.props as HeadingProps;
      return (
        <div className="space-y-3">
          <div>
            <label className="form-label">Level</label>
            <select value={p.level} onChange={(e) => updateBlockProps(block.id, { level: Number(e.target.value) })} className="input-select">
              <option value="1">H1 — Large heading</option>
              <option value="2">H2 — Section heading</option>
              <option value="3">H3 — Subsection</option>
              <option value="4">H4 — Minor heading</option>
            </select>
          </div>
          <div>
            <label className="form-label">Text</label>
            <input type="text" value={p.text} onChange={(e) => updateBlockProps(block.id, { text: e.target.value })} className="input-field" placeholder="Heading text..." />
          </div>
        </div>
      );
    }
    case 'paragraph': {
      const p = block.props as ParagraphProps;
      return (
        <div>
          <label className="form-label">Text</label>
          <textarea value={p.text} onChange={(e) => updateBlockProps(block.id, { text: e.target.value })} className="input-field resize-none" rows={4} placeholder="Paragraph text..." />
        </div>
      );
    }
    case 'callout': {
      const p = block.props as CalloutProps;
      return (
        <div className="space-y-3">
          <div>
            <label className="form-label">Variant</label>
            <select value={p.variant} onChange={(e) => updateBlockProps(block.id, { variant: e.target.value })} className="input-select">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
          </div>
          <div>
            <label className="form-label">Text</label>
            <textarea value={p.text} onChange={(e) => updateBlockProps(block.id, { text: e.target.value })} className="input-field resize-none" rows={3} placeholder="Callout text..." />
          </div>
        </div>
      );
    }
    case 'code': {
      const p = block.props as CodeProps;
      return (
        <div className="space-y-3">
          <div>
            <label className="form-label">Language</label>
            <input type="text" value={p.language} onChange={(e) => updateBlockProps(block.id, { language: e.target.value })} className="input-field" placeholder="e.g. javascript" />
          </div>
          <div>
            <label className="form-label">Code</label>
            <textarea value={p.code} onChange={(e) => updateBlockProps(block.id, { code: e.target.value })} className="input-field font-mono resize-none" rows={6} placeholder="// Your code here" spellCheck={false} />
          </div>
        </div>
      );
    }
    case 'divider': {
      const p = block.props as DividerProps;
      return (
        <div>
          <label className="form-label">Style</label>
          <select value={p.style} onChange={(e) => updateBlockProps(block.id, { style: e.target.value })} className="input-select">
            <option value="line">Line</option>
            <option value="dots">Dots</option>
            <option value="double">Double</option>
          </select>
        </div>
      );
    }
    case 'cover': {
      const p = block.props as CoverProps;
      return (
        <div className="space-y-3">
          <div><label className="form-label">Title</label><input type="text" value={p.title} onChange={(e) => updateBlockProps(block.id, { title: e.target.value })} className="input-field" placeholder="Document title" /></div>
          <div><label className="form-label">Subtitle</label><input type="text" value={p.subtitle || ''} onChange={(e) => updateBlockProps(block.id, { subtitle: e.target.value })} className="input-field" placeholder="Subtitle" /></div>
          <div><label className="form-label">Author</label><input type="text" value={p.author || ''} onChange={(e) => updateBlockProps(block.id, { author: e.target.value })} className="input-field" placeholder="Author name" /></div>
          <div><label className="form-label">Date</label><input type="text" value={p.date || ''} onChange={(e) => updateBlockProps(block.id, { date: e.target.value })} className="input-field" placeholder="Date" /></div>
        </div>
      );
    }
    case 'columns': {
      const p = block.props as ColumnsProps;
      return (
        <div>
          <label className="form-label">Column Count</label>
          <select value={p.count} onChange={(e) => updateBlockProps(block.id, { count: Number(e.target.value) })} className="input-select">
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
          </select>
        </div>
      );
    }
    default:
      return <p className="text-[13px] text-surface-400 italic">No editable properties for this block type.</p>;
  }
}

function TypographyEditor({ block }: { block: Block }) {
  const { updateBlockStyle } = useEditorStore();
  const style = block.style;

  return (
    <div className="space-y-3">
      <SelectInput
        label="Font Family"
        value={style.fontFamily || ''}
        onChange={(v) => updateBlockStyle(block.id, { fontFamily: v || undefined })}
        options={FONT_OPTIONS}
      />
      <TextInput
        label="Font Size"
        value={style.fontSize || ''}
        onChange={(v) => updateBlockStyle(block.id, { fontSize: v || undefined })}
        placeholder="e.g. 16px, 1.25rem"
      />
      <SelectInput
        label="Font Weight"
        value={style.fontWeight || ''}
        onChange={(v) => updateBlockStyle(block.id, { fontWeight: v || undefined })}
        options={FONT_WEIGHT_OPTIONS}
      />
      <TextInput
        label="Line Height"
        value={style.lineHeight || ''}
        onChange={(v) => updateBlockStyle(block.id, { lineHeight: v || undefined })}
        placeholder="e.g. 1.6, 24px"
      />
      <TextInput
        label="Letter Spacing"
        value={style.letterSpacing || ''}
        onChange={(v) => updateBlockStyle(block.id, { letterSpacing: v || undefined })}
        placeholder="e.g. 0.05em"
      />
      <SelectInput
        label="Text Transform"
        value={style.textTransform || ''}
        onChange={(v) => updateBlockStyle(block.id, { textTransform: (v || undefined) as BlockStyle['textTransform'] })}
        options={TEXT_TRANSFORM_OPTIONS}
      />
      <SelectInput
        label="Text Decoration"
        value={style.textDecoration || ''}
        onChange={(v) => updateBlockStyle(block.id, { textDecoration: v || undefined })}
        options={TEXT_DECORATION_OPTIONS}
      />
      <ColorInput
        label="Text Color"
        value={style.color || ''}
        onChange={(v) => updateBlockStyle(block.id, { color: v || undefined })}
        placeholder="#000000"
      />
      <SegmentedControl
        label="Text Align"
        value={style.textAlign || 'left'}
        onChange={(v) => updateBlockStyle(block.id, { textAlign: v as BlockStyle['textAlign'] })}
        options={['left', 'center', 'right', 'justify']}
      />
    </div>
  );
}

function SpacingEditor({ block }: { block: Block }) {
  const { updateBlockStyle } = useEditorStore();
  const style = block.style;

  return (
    <div className="space-y-3">
      <TextInput
        label="Padding"
        value={style.padding || ''}
        onChange={(v) => updateBlockStyle(block.id, { padding: v || undefined })}
        placeholder="e.g. 1rem"
      />
      <TextInput
        label="Margin"
        value={style.margin || ''}
        onChange={(v) => updateBlockStyle(block.id, { margin: v || undefined })}
        placeholder="e.g. 1rem 0"
      />
      <TextInput
        label="Width"
        value={style.width || ''}
        onChange={(v) => updateBlockStyle(block.id, { width: v || undefined })}
        placeholder="e.g. 100%, 300px"
      />
      <TextInput
        label="Height"
        value={style.height || ''}
        onChange={(v) => updateBlockStyle(block.id, { height: v || undefined })}
        placeholder="e.g. auto, 200px"
      />
      <TextInput
        label="Max Width"
        value={style.maxWidth || ''}
        onChange={(v) => updateBlockStyle(block.id, { maxWidth: v || undefined })}
        placeholder="e.g. 800px"
      />
      <TextInput
        label="Min Height"
        value={style.minHeight || ''}
        onChange={(v) => updateBlockStyle(block.id, { minHeight: v || undefined })}
        placeholder="e.g. 100px"
      />
    </div>
  );
}

function BackgroundBorderEditor({ block }: { block: Block }) {
  const { updateBlockStyle } = useEditorStore();
  const style = block.style;
  const [showIndividualBorders, setShowIndividualBorders] = useState(false);

  return (
    <div className="space-y-3">
      <ColorInput
        label="Background Color"
        value={style.backgroundColor || ''}
        onChange={(v) => updateBlockStyle(block.id, { backgroundColor: v || undefined })}
        placeholder="#ffffff"
      />
      <TextInput
        label="Border"
        value={style.border || ''}
        onChange={(v) => updateBlockStyle(block.id, { border: v || undefined })}
        placeholder="e.g. 1px solid #e5e7eb"
      />
      <div>
        <button
          onClick={() => setShowIndividualBorders(!showIndividualBorders)}
          className="text-[11px] font-semibold text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 flex items-center gap-1"
        >
          {showIndividualBorders ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Individual Borders
        </button>
        {showIndividualBorders && (
          <div className="mt-2 space-y-2">
            <TextInput
              label="Border Top"
              value={style.borderTop || ''}
              onChange={(v) => updateBlockStyle(block.id, { borderTop: v || undefined })}
              placeholder="e.g. 1px solid #e5e7eb"
            />
            <TextInput
              label="Border Right"
              value={style.borderRight || ''}
              onChange={(v) => updateBlockStyle(block.id, { borderRight: v || undefined })}
              placeholder="e.g. 1px solid #e5e7eb"
            />
            <TextInput
              label="Border Bottom"
              value={style.borderBottom || ''}
              onChange={(v) => updateBlockStyle(block.id, { borderBottom: v || undefined })}
              placeholder="e.g. 1px solid #e5e7eb"
            />
            <TextInput
              label="Border Left"
              value={style.borderLeft || ''}
              onChange={(v) => updateBlockStyle(block.id, { borderLeft: v || undefined })}
              placeholder="e.g. 1px solid #e5e7eb"
            />
          </div>
        )}
      </div>
      <TextInput
        label="Border Radius"
        value={style.borderRadius || ''}
        onChange={(v) => updateBlockStyle(block.id, { borderRadius: v || undefined })}
        placeholder="e.g. 8px"
      />
      <TextInput
        label="Box Shadow"
        value={style.boxShadow || ''}
        onChange={(v) => updateBlockStyle(block.id, { boxShadow: v || undefined })}
        placeholder="e.g. 0 4px 12px rgba(0,0,0,0.1)"
      />
    </div>
  );
}

function LayoutEditor({ block }: { block: Block }) {
  const { updateBlockStyle } = useEditorStore();
  const style = block.style;
  const opacityValue = style.opacity ? parseFloat(style.opacity) : 1;

  return (
    <div className="space-y-3">
      <SelectInput
        label="Display"
        value={style.display || ''}
        onChange={(v) => updateBlockStyle(block.id, { display: v || undefined })}
        options={DISPLAY_OPTIONS}
      />
      {(style.display === 'flex' || style.display === 'inline-flex') && (
        <>
          <SelectInput
            label="Flex Direction"
            value={style.flexDirection || ''}
            onChange={(v) => updateBlockStyle(block.id, { flexDirection: v || undefined })}
            options={FLEX_DIRECTION_OPTIONS}
          />
          <TextInput
            label="Gap"
            value={style.gap || ''}
            onChange={(v) => updateBlockStyle(block.id, { gap: v || undefined })}
            placeholder="e.g. 1rem, 8px"
          />
        </>
      )}
      <div>
        <label className="form-label">Opacity</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacityValue}
            onChange={(e) => updateBlockStyle(block.id, { opacity: e.target.value })}
            className="flex-1"
          />
          <input
            type="text"
            value={style.opacity || ''}
            onChange={(e) => updateBlockStyle(block.id, { opacity: e.target.value || undefined })}
            className="w-16 input-field font-mono text-center"
            placeholder="1"
          />
        </div>
      </div>
      <SelectInput
        label="Overflow"
        value={style.overflow || ''}
        onChange={(v) => updateBlockStyle(block.id, { overflow: v || undefined })}
        options={OVERFLOW_OPTIONS}
      />
    </div>
  );
}

function ClassesEditor({ block }: { block: Block }) {
  const { updateBlockStyle } = useEditorStore();
  const style = block.style;

  return (
    <div className="space-y-3">
      <TextInput
        label="Tailwind Classes"
        value={style.tailwindClasses || ''}
        onChange={(v) => updateBlockStyle(block.id, { tailwindClasses: v || undefined })}
        placeholder="e.g. text-center bg-gray-100"
      />
      <TextInput
        label="Custom Class Name"
        value={style.className || ''}
        onChange={(v) => updateBlockStyle(block.id, { className: v || undefined })}
        placeholder="e.g. my-custom-class"
      />
    </div>
  );
}
