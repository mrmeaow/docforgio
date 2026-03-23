import { useRef, useState } from 'react';
import type { Block, HeadingProps, ParagraphProps, ImageProps, TableProps, ListProps, CalloutProps, CodeProps, DividerProps, ColumnsProps, CoverProps, HtmlProps } from '../../../types';
import { useEditorStore } from '../../../stores';
import { generateId } from '../../../utils/id';
import { GripVertical, Trash2, Copy, Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import { ContextMenu } from '../ContextMenu';

interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  const { selectedBlockId, selectBlock, deleteBlock, duplicateBlock, moveBlock, blocks } = useEditorStore();
  const isSelected = selectedBlockId === block.id;
  const index = blocks.findIndex((b: Block) => b.id === block.id);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
    <div
      className={`group relative rounded-xl transition-all duration-150 ${
        isSelected
          ? 'ring-2 ring-brand-500/50 bg-brand-50/40 dark:bg-brand-900/15 shadow-sm'
          : 'hover:bg-surface-50/80 dark:hover:bg-surface-800/40'
      } ${block.isSlot ? 'border-2 border-dashed border-amber-400/60' : ''}`}
      onClick={() => selectBlock(block.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Drag handle — left side */}
      <div className={`absolute -left-7 top-3 flex flex-col gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button className="p-1 rounded-lg hover:bg-surface-200/80 dark:hover:bg-surface-700 text-surface-300 dark:text-surface-600 cursor-grab active:cursor-grabbing transition-colors" title="Drag to reorder">
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Action buttons — right side */}
      <div className={`absolute -right-1 top-2 flex items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="flex items-center gap-0.5 bg-white dark:bg-surface-800 rounded-xl shadow-md border border-surface-200/60 dark:border-surface-700/50 p-0.5">
          {index > 0 && (
            <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, index - 1); }} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors" title="Move up">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
          {index < blocks.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, index + 1); }} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors" title="Move down">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="w-px h-5 bg-surface-200 dark:bg-surface-700 mx-0.5" />
          <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors" title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-surface-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slot indicator */}
      {block.isSlot && block.slotHint && (
        <div className="px-3.5 py-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 border-b border-amber-200/60 dark:border-amber-800/50 rounded-t-xl flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Template Slot: {block.slotHint}
        </div>
      )}

      <div className="px-4 py-3">
        <BlockContent block={block} />
      </div>
    </div>
    {contextMenu && (
      <ContextMenu
        blockId={block.id}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu(null)}
      />
    )}
    </>
  );
}

function BlockContent({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading': return <HeadingBlock block={block} />;
    case 'paragraph': return <ParagraphBlock block={block} />;
    case 'image': return <ImageBlock block={block} />;
    case 'table': return <TableBlock block={block} />;
    case 'list': return <ListBlock block={block} />;
    case 'callout': return <CalloutBlock block={block} />;
    case 'code': return <CodeBlockContent block={block} />;
    case 'divider': return <DividerBlock block={block} />;
    case 'columns': return <ColumnsBlock block={block} />;
    case 'pagebreak': return <PageBreakBlock />;
    case 'cover': return <CoverBlock block={block} />;
    case 'html': return <HtmlBlock block={block} />;
    default: return <div className="text-surface-400 italic text-sm">Unknown block type</div>;
  }
}

function HeadingBlock({ block }: { block: Block }) {
  const props = block.props as HeadingProps;
  const { updateBlockProps } = useEditorStore();
  return (
    <div className="flex items-start gap-2">
      <select
        value={props.level}
        onChange={(e) => updateBlockProps(block.id, { level: Number(e.target.value) })}
        className="w-14 text-[11px] font-bold bg-surface-100 dark:bg-surface-800 border-0 rounded-lg px-2 py-1 text-surface-500 dark:text-surface-400 cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
      >
        <option value="1">H1</option><option value="2">H2</option><option value="3">H3</option><option value="4">H4</option>
      </select>
      <input
        type="text"
        value={props.text}
        onChange={(e) => updateBlockProps(block.id, { text: e.target.value })}
        className={`flex-1 bg-transparent border-0 outline-none font-bold text-surface-900 dark:text-surface-100 placeholder-surface-300 dark:placeholder-surface-600 ${
          props.level === 1 ? 'text-3xl tracking-tight' : props.level === 2 ? 'text-2xl tracking-tight' : props.level === 3 ? 'text-xl' : 'text-lg'
        }`}
        placeholder="Heading text..."
      />
    </div>
  );
}

function ParagraphBlock({ block }: { block: Block }) {
  const props = block.props as ParagraphProps;
  const { updateBlockProps } = useEditorStore();
  const ref = useRef<HTMLTextAreaElement>(null);
  const handleInput = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
      updateBlockProps(block.id, { text: ref.current.value });
    }
  };
  return (
    <textarea
      ref={ref}
      value={props.text}
      onChange={handleInput}
      rows={1}
      className="w-full bg-transparent border-0 outline-none resize-none text-base leading-relaxed text-surface-800 dark:text-surface-200 placeholder-surface-300 dark:placeholder-surface-600"
      placeholder="Start writing..."
      style={{ height: 'auto', minHeight: '1.5em' }}
    />
  );
}

function ImageBlock({ block }: { block: Block }) {
  const props = block.props as ImageProps;
  const { updateBlockProps } = useEditorStore();
  if (!props.src) {
    return (
      <div className="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-8 text-center bg-surface-50/50 dark:bg-surface-900/30">
        <div className="w-10 h-10 rounded-xl bg-surface-200/60 dark:bg-surface-700/60 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
        </div>
        <input type="text" placeholder="Paste image URL..." value={props.src} onChange={(e) => updateBlockProps(block.id, { src: e.target.value })} className="w-full max-w-sm mx-auto bg-transparent border-b border-surface-300 dark:border-surface-600 text-center outline-none py-1 text-sm text-surface-700 dark:text-surface-300 placeholder-surface-400" />
        <p className="text-[11px] text-surface-400 mt-2">Paste an image URL above</p>
      </div>
    );
  }
  return (
    <figure>
      <img src={props.src} alt={props.alt} className="max-w-full h-auto rounded-xl shadow-sm" />
      <input type="text" value={props.caption || ''} onChange={(e) => updateBlockProps(block.id, { caption: e.target.value })} className="w-full text-center text-[13px] text-surface-400 bg-transparent border-0 outline-none mt-2 placeholder-surface-300" placeholder="Add caption..." />
    </figure>
  );
}

function TableBlock({ block }: { block: Block }) {
  const props = block.props as TableProps;
  const { updateBlockProps } = useEditorStore();
  const updateCell = (row: number, col: number, value: string) => {
    const newRows = props.rows.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? value : c) : [...r]);
    updateBlockProps(block.id, { rows: newRows });
  };
  const addRow = () => { updateBlockProps(block.id, { rows: [...props.rows, Array(props.rows[0]?.length || 2).fill('')] }); };
  const addCol = () => { updateBlockProps(block.id, { rows: props.rows.map(r => [...r, '']) }); };
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse rounded-xl overflow-hidden">
        <tbody>
          {props.rows.map((row: string[], ri: number) => (
            <tr key={ri}>{row.map((cell: string, ci: number) => {
              const Tag = ri < props.headerRows ? 'th' : 'td';
              return (
                <Tag key={ci} className="border border-surface-200 dark:border-surface-700 p-0">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    className="w-full bg-transparent border-0 outline-none px-3 py-2 text-sm text-surface-800 dark:text-surface-200 placeholder-surface-300"
                    placeholder={ri < props.headerRows ? 'Header' : 'Cell'}
                  />
                </Tag>
              );
            })}</tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-2">
        <button onClick={addRow} className="text-[11px] text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 font-medium transition-colors"><Plus className="w-3 h-3" /> Row</button>
        <button onClick={addCol} className="text-[11px] text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 font-medium transition-colors"><Plus className="w-3 h-3" /> Column</button>
      </div>
    </div>
  );
}

function ListBlock({ block }: { block: Block }) {
  const props = block.props as ListProps;
  const { updateBlockProps } = useEditorStore();
  const updateItem = (index: number, text: string) => { updateBlockProps(block.id, { items: props.items.map((item, i) => i === index ? { ...item, text } : item) }); };
  const addItem = () => { updateBlockProps(block.id, { items: [...props.items, { id: generateId(), text: '' }] }); };
  const removeItem = (index: number) => { if (props.items.length > 1) updateBlockProps(block.id, { items: props.items.filter((_, i) => i !== index) }); };
  const Tag = props.type === 'ordered' ? 'ol' : 'ul';
  return (
    <div>
      <div className="segment-group mb-3">
        <button onClick={() => updateBlockProps(block.id, { type: 'unordered' })} className={`segment-item text-[11px] ${props.type === 'unordered' ? 'active' : ''}`}>Bullets</button>
        <button onClick={() => updateBlockProps(block.id, { type: 'ordered' })} className={`segment-item text-[11px] ${props.type === 'ordered' ? 'active' : ''}`}>Numbered</button>
      </div>
      <Tag className={`${props.type === 'ordered' ? 'list-decimal' : 'list-disc'} pl-5 space-y-1`}>
        {props.items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-2 group/item">
            <input type="text" value={item.text} onChange={(e) => updateItem(i, e.target.value)} className="flex-1 bg-transparent border-0 outline-none text-surface-800 dark:text-surface-200 placeholder-surface-300" placeholder="List item..." />
            {props.items.length > 1 && <button onClick={() => removeItem(i)} className="opacity-0 group-hover/item:opacity-100 text-surface-300 hover:text-red-500 transition-all"><Minus className="w-3 h-3" /></button>}
          </li>
        ))}
      </Tag>
      <button onClick={addItem} className="text-[11px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 mt-2 flex items-center gap-1 font-medium transition-colors"><Plus className="w-3 h-3" /> Add item</button>
    </div>
  );
}

function CalloutBlock({ block }: { block: Block }) {
  const props = block.props as CalloutProps;
  const { updateBlockProps } = useEditorStore();
  const variants: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: 'bg-blue-50/80 dark:bg-blue-900/15', border: 'border-blue-200/60 dark:border-blue-800/40', icon: '\u2139' },
    warning: { bg: 'bg-amber-50/80 dark:bg-amber-900/15', border: 'border-amber-200/60 dark:border-amber-800/40', icon: '\u26A0' },
    error: { bg: 'bg-red-50/80 dark:bg-red-900/15', border: 'border-red-200/60 dark:border-red-800/40', icon: '\u2715' },
    success: { bg: 'bg-emerald-50/80 dark:bg-emerald-900/15', border: 'border-emerald-200/60 dark:border-emerald-800/40', icon: '\u2713' },
  };
  const v = variants[props.variant] || variants.info;
  return (
    <div className={`${v.bg} border ${v.border} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{v.icon}</span>
        <select value={props.variant} onChange={(e) => updateBlockProps(block.id, { variant: e.target.value })} className="text-[11px] font-bold bg-transparent border-0 outline-none uppercase tracking-wider text-surface-500 cursor-pointer">
          <option value="info">Info</option><option value="warning">Warning</option><option value="error">Error</option><option value="success">Success</option>
        </select>
      </div>
      <textarea value={props.text} onChange={(e) => updateBlockProps(block.id, { text: e.target.value })} className="w-full bg-transparent border-0 outline-none resize-none text-[13px] text-surface-700 dark:text-surface-300 placeholder-surface-300" rows={2} placeholder="Callout text..." />
    </div>
  );
}

function CodeBlockContent({ block }: { block: Block }) {
  const props = block.props as CodeProps;
  const { updateBlockProps } = useEditorStore();
  return (
    <div className="rounded-xl overflow-hidden border border-surface-200/60 dark:border-surface-700/50">
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-800 text-surface-400">
        <div className="flex gap-1.5 mr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
        </div>
        <input type="text" value={props.language} onChange={(e) => updateBlockProps(block.id, { language: e.target.value })} className="bg-transparent border-0 outline-none text-[11px] font-bold uppercase tracking-widest placeholder-surface-600" placeholder="language" />
      </div>
      <textarea value={props.code} onChange={(e) => updateBlockProps(block.id, { code: e.target.value })} className="w-full bg-surface-900 text-surface-100 p-4 font-mono text-sm border-0 outline-none resize-none leading-relaxed placeholder-surface-600" rows={Math.max(3, props.code.split('\n').length)} placeholder="// Your code here" spellCheck={false} />
    </div>
  );
}

function DividerBlock({ block }: { block: Block }) {
  const props = block.props as DividerProps;
  const { updateBlockProps } = useEditorStore();
  return (
    <div>
      <div className="segment-group mb-3">
        {(['line', 'dots', 'double'] as const).map(s => (
          <button key={s} onClick={() => updateBlockProps(block.id, { style: s })} className={`segment-item text-[11px] capitalize ${props.style === s ? 'active' : ''}`}>{s}</button>
        ))}
      </div>
      {props.style === 'line' && <hr className="border-surface-200 dark:border-surface-700" />}
      {props.style === 'dots' && <hr className="border-t-2 border-dotted border-surface-300 dark:border-surface-600" />}
      {props.style === 'double' && <div><hr className="border-surface-200 dark:border-surface-700 mb-0.5" /><hr className="border-surface-200 dark:border-surface-700" /></div>}
    </div>
  );
}

function ColumnsBlock({ block }: { block: Block }) {
  const props = block.props as ColumnsProps;
  const { updateBlockProps } = useEditorStore();
  const children = block.children || [];
  return (
    <div>
      <div className="segment-group mb-3">
        {[2, 3].map(n => (
          <button key={n} onClick={() => updateBlockProps(block.id, { count: n })} className={`segment-item text-[11px] ${props.count === n ? 'active' : ''}`}>{n} Columns</button>
        ))}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${props.count}, 1fr)` }}>
        {Array.from({ length: props.count }).map((_, i) => (
          <div key={i} className="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-3 min-h-[60px] bg-surface-50/50 dark:bg-surface-900/20">
            {children[i] ? <BlockContent block={children[i]} /> : <p className="text-[11px] text-surface-400 italic text-center py-2">Column {i + 1}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PageBreakBlock() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-surface-300 dark:via-surface-600 to-transparent" />
      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Page Break</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-surface-300 dark:via-surface-600 to-transparent" />
    </div>
  );
}

function CoverBlock({ block }: { block: Block }) {
  const props = block.props as CoverProps;
  const { updateBlockProps } = useEditorStore();
  return (
    <div className="text-center py-12 px-6 bg-gradient-to-b from-surface-50/50 to-transparent dark:from-surface-800/30 dark:to-transparent rounded-xl">
      <input type="text" value={props.title} onChange={(e) => updateBlockProps(block.id, { title: e.target.value })} className="w-full text-4xl font-extrabold text-center bg-transparent border-0 outline-none text-surface-900 dark:text-surface-100 tracking-tight placeholder-surface-300" placeholder="Document Title" />
      <input type="text" value={props.subtitle || ''} onChange={(e) => updateBlockProps(block.id, { subtitle: e.target.value })} className="w-full text-lg text-surface-500 dark:text-surface-400 text-center bg-transparent border-0 outline-none mt-3 placeholder-surface-300" placeholder="Subtitle" />
      <div className="flex justify-center gap-4 mt-5">
        <input type="text" value={props.author || ''} onChange={(e) => updateBlockProps(block.id, { author: e.target.value })} className="text-[13px] text-surface-400 bg-transparent border-0 outline-none text-center placeholder-surface-300" placeholder="Author" />
        <span className="text-surface-300">&middot;</span>
        <input type="text" value={props.date || ''} onChange={(e) => updateBlockProps(block.id, { date: e.target.value })} className="text-[13px] text-surface-400 bg-transparent border-0 outline-none text-center placeholder-surface-300" placeholder="Date" />
      </div>
    </div>
  );
}

function HtmlBlock({ block }: { block: Block }) {
  const props = block.props as HtmlProps;
  const { updateBlockProps } = useEditorStore();
  return (
    <div>
      <div className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-2">Custom HTML</div>
      <textarea value={props.html} onChange={(e) => updateBlockProps(block.id, { html: e.target.value })} className="w-full bg-surface-900 text-surface-100 p-3.5 font-mono text-sm border-0 outline-none resize-none rounded-xl leading-relaxed placeholder-surface-600" rows={3} placeholder="<div>Your HTML here</div>" spellCheck={false} />
    </div>
  );
}
