import { useRef, useState } from 'react';
import type { Block, HeadingProps, ParagraphProps, ImageProps, TableProps, ListProps, CalloutProps, CodeProps, DividerProps, ColumnsProps, CoverProps, HtmlProps, SpacerProps, WrapperProps, PageDividerProps } from '../../../types';
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
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';
    // Slightly transparent ghost
    const el = blockRef.current;
    if (el) {
      const ghost = el.cloneNode(true) as HTMLElement;
      ghost.style.opacity = '0.6';
      ghost.style.width = el.offsetWidth + 'px';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 20, 20);
      requestAnimationFrame(() => document.body.removeChild(ghost));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = blockRef.current?.getBoundingClientRect();
    if (rect) {
      const midY = rect.top + rect.height / 2;
      setDropPosition(e.clientY < midY ? 'top' : 'bottom');
    }
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropPosition(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === block.id) return;

    const rect = blockRef.current?.getBoundingClientRect();
    if (!rect) return;

    const midY = rect.top + rect.height / 2;
    const draggedIndex = blocks.findIndex((b: Block) => b.id === draggedId);
    let targetIndex = index;

    if (e.clientY < midY) {
      // Drop above this block
      targetIndex = draggedIndex < index ? index - 1 : index;
    } else {
      // Drop below this block
      targetIndex = draggedIndex < index ? index : index + 1;
    }

    if (draggedIndex !== targetIndex) {
      moveBlock(draggedId, targetIndex);
    }
  };

  return (
    <>
    <div
      ref={blockRef}
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop indicator lines */}
      {dropPosition === 'top' && (
        <div className="absolute -top-0.5 left-2 right-2 h-1 bg-brand-500 rounded-full z-10" />
      )}
      {dropPosition === 'bottom' && (
        <div className="absolute -bottom-0.5 left-2 right-2 h-1 bg-brand-500 rounded-full z-10" />
      )}

      {/* Drag handle — left side */}
      <div className={`absolute -left-7 top-3 flex flex-col gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div
          draggable
          onDragStart={handleDragStart}
          className="p-1 rounded-lg hover:bg-surface-200/80 dark:hover:bg-surface-700 text-surface-300 dark:text-surface-600 cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>
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
    case 'spacer': return <SpacerBlock block={block} />;
    case 'wrapper': return <WrapperBlock block={block} />;
    case 'pageDivider': return <PageDividerBlock block={block} />;
    default: return <div className="text-sm text-surface-400">Unknown block type</div>;
  }
}

// ---- Block Components ----

function HeadingBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as HeadingProps;
  const tags: Record<number, string> = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' };

  return (
    <div className="flex items-start gap-2">
      <input
        value={props.text}
        onChange={(e) => updateBlockProps(block.id, { text: e.target.value })}
        className={`flex-1 bg-transparent border-0 outline-none font-bold text-surface-900 dark:text-surface-100 placeholder-surface-400 ${tags[props.level] || 'text-xl'}`}
        placeholder={`Heading ${props.level}...`}
      />
      <select
        value={props.level}
        onChange={(e) => updateBlockProps(block.id, { level: parseInt(e.target.value) })}
        className="bg-surface-100 dark:bg-surface-700 border-0 rounded-lg px-2 py-1 text-xs font-semibold text-surface-500 dark:text-surface-400 outline-none cursor-pointer"
      >
        {[1, 2, 3, 4].map(l => <option key={l} value={l}>H{l}</option>)}
      </select>
    </div>
  );
}

function ParagraphBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as ParagraphProps;
  return (
    <textarea
      value={props.text}
      onChange={(e) => updateBlockProps(block.id, { text: e.target.value })}
      className="w-full bg-transparent border-0 outline-none resize-none text-[15px] leading-relaxed text-surface-800 dark:text-surface-200 placeholder-surface-400 min-h-[2em]"
      placeholder="Type something..."
      rows={Math.max(1, Math.ceil(props.text.length / 80))}
    />
  );
}

function ImageBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as ImageProps;
  const [url, setUrl] = useState(props.src || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateBlockProps(block.id, { src: dataUrl, alt: file.name });
      setUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  if (!props.src) {
    return (
      <div className="flex flex-col gap-3">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all"
        >
          <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Click to upload an image</p>
          <p className="text-xs text-surface-400 mt-1">PNG, JPG, SVG, WebP</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <div className="flex items-center gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') updateBlockProps(block.id, { src: url }); }}
            className="flex-1 bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
            placeholder="Or paste image URL..."
          />
          <button
            onClick={() => updateBlockProps(block.id, { src: url })}
            className="btn-secondary text-xs"
          >
            Set
          </button>
        </div>
      </div>
    );
  }

  return (
    <figure className="flex flex-col gap-2">
      <img src={props.src} alt={props.alt || ''} className="max-w-full h-auto rounded-lg" />
      <input
        value={props.caption || ''}
        onChange={(e) => updateBlockProps(block.id, { caption: e.target.value })}
        className="bg-transparent border-0 outline-none text-xs text-surface-400 text-center italic placeholder-surface-300"
        placeholder="Add caption..."
      />
    </figure>
  );
}

function TableBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as TableProps;

  const updateCell = (row: number, col: number, value: string) => {
    const newRows = props.rows.map((r, ri) =>
      ri === row ? r.map((c, ci) => ci === col ? value : c) : [...r]
    );
    updateBlockProps(block.id, { rows: newRows });
  };

  const addRow = () => {
    const newRow = Array(props.rows[0]?.length || 2).fill('');
    updateBlockProps(block.id, { rows: [...props.rows, newRow] });
  };

  const addCol = () => {
    const newRows = props.rows.map(r => [...r, '']);
    updateBlockProps(block.id, { rows: newRows });
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {props.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-surface-200 dark:border-surface-600 p-0">
                    {ri < props.headerRows ? (
                      <input
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        className="w-full bg-surface-50 dark:bg-surface-700/50 border-0 outline-none px-2 py-1.5 text-sm font-semibold text-surface-800 dark:text-surface-200"
                        placeholder="Header..."
                      />
                    ) : (
                      <input
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm text-surface-700 dark:text-surface-300"
                        placeholder="Cell..."
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={addRow} className="text-xs text-surface-400 hover:text-brand-500 flex items-center gap-1 transition-colors">
          <Plus className="w-3 h-3" /> Row
        </button>
        <button onClick={addCol} className="text-xs text-surface-400 hover:text-brand-500 flex items-center gap-1 transition-colors">
          <Plus className="w-3 h-3" /> Column
        </button>
      </div>
    </div>
  );
}

function ListBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as ListProps;

  const updateItem = (id: string, text: string) => {
    const newItems = props.items.map(item => item.id === id ? { ...item, text } : item);
    updateBlockProps(block.id, { items: newItems });
  };

  const addItem = () => {
    updateBlockProps(block.id, { items: [...props.items, { id: generateId(), text: '' }] });
  };

  const removeItem = (id: string) => {
    if (props.items.length > 1) {
      updateBlockProps(block.id, { items: props.items.filter(item => item.id !== id) });
    }
  };

  const Tag = props.type === 'ordered' ? 'ol' : 'ul';
  const listStyle = props.type === 'ordered' ? 'list-decimal' : 'list-disc';

  return (
    <div className="space-y-1">
      <Tag className={`${listStyle} pl-5 space-y-0.5`}>
        {props.items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-1.5 group/item">
            <input
              value={item.text}
              onChange={(e) => updateItem(item.id, e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-[15px] text-surface-800 dark:text-surface-200 placeholder-surface-400"
              placeholder={`Item ${i + 1}...`}
            />
            {props.items.length > 1 && (
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-red-500 transition-all"
              >
                <Minus className="w-3 h-3" />
              </button>
            )}
          </li>
        ))}
      </Tag>
      <button onClick={addItem} className="text-xs text-surface-400 hover:text-brand-500 flex items-center gap-1 transition-colors">
        <Plus className="w-3 h-3" /> Add item
      </button>
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => updateBlockProps(block.id, { type: props.type === 'ordered' ? 'unordered' : 'ordered' })}
          className="text-xs text-surface-400 hover:text-brand-500 flex items-center gap-1 transition-colors"
        >
          Switch to {props.type === 'ordered' ? 'unordered' : 'ordered'}
        </button>
      </div>
    </div>
  );
}

function CalloutBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as CalloutProps;
  const variants: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700', icon: 'ℹ' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-700', icon: '⚠' },
    error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700', icon: '✕' },
    success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-700', icon: '✓' },
  };
  const v = variants[props.variant] || variants.info;

  return (
    <div className={`${v.bg} border-l-4 ${v.border} rounded-r-lg p-3 flex items-start gap-2`}>
      <span className="text-sm mt-0.5 select-none">{v.icon}</span>
      <textarea
        value={props.text}
        onChange={(e) => updateBlockProps(block.id, { text: e.target.value })}
        className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-surface-700 dark:text-surface-300 placeholder-surface-400 min-h-[2em]"
        placeholder="Write a callout..."
        rows={Math.max(1, Math.ceil(props.text.length / 60))}
      />
      <select
        value={props.variant}
        onChange={(e) => updateBlockProps(block.id, { variant: e.target.value })}
        className="bg-transparent border-0 outline-none text-xs text-surface-400 cursor-pointer"
      >
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="error">Error</option>
        <option value="success">Success</option>
      </select>
    </div>
  );
}

function CodeBlockContent({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as CodeProps;

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-surface-800 dark:bg-surface-900 px-3 py-1.5">
        <input
          value={props.language}
          onChange={(e) => updateBlockProps(block.id, { language: e.target.value })}
          className="bg-transparent border-0 outline-none text-xs text-surface-400 uppercase font-mono placeholder-surface-600 w-24"
          placeholder="language..."
        />
      </div>
      <textarea
        value={props.code}
        onChange={(e) => updateBlockProps(block.id, { code: e.target.value })}
        className="w-full bg-surface-900 dark:bg-surface-950 border-0 outline-none resize-none text-sm text-surface-100 font-mono p-4 leading-relaxed placeholder-surface-600 min-h-[6em]"
        placeholder="Paste your code here..."
        rows={Math.max(4, props.code.split('\n').length + 1)}
        spellCheck={false}
      />
    </div>
  );
}

function DividerBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as DividerProps;
  const styles: Record<string, string> = {
    line: 'border-t border-surface-300 dark:border-surface-600',
    dots: 'border-t-2 border-dotted border-surface-300 dark:border-surface-600',
    double: 'border-t-[3px] border-double border-surface-300 dark:border-surface-600',
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`flex-1 ${styles[props.style] || styles.line}`} />
      <select
        value={props.style}
        onChange={(e) => updateBlockProps(block.id, { style: e.target.value })}
        className="bg-transparent border-0 outline-none text-xs text-surface-400 cursor-pointer"
      >
        <option value="line">Line</option>
        <option value="dots">Dots</option>
        <option value="double">Double</option>
      </select>
    </div>
  );
}

function ColumnsBlock({ block }: { block: Block }) {
  const { updateBlockProps, blocks } = useEditorStore();
  const props = block.props as ColumnsProps;
  const colBlocks = block.children || [];

  const updateChildBlock = (colIndex: number, updates: Partial<Block>) => {
    const newChildren = [...colBlocks];
    if (newChildren[colIndex]) {
      newChildren[colIndex] = { ...newChildren[colIndex], ...updates };
      // Use the parent block's update mechanism
      useEditorStore.getState().setBlocks(
        blocks.map(b => b.id === block.id ? { ...b, children: newChildren } : b)
      );
    }
  };

  const gridCols = props.count === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="space-y-2">
      <div className={`grid ${gridCols} gap-4`}>
        {Array.from({ length: props.count }).map((_, i) => {
          const child = colBlocks[i];
          return (
            <div key={i} className="bg-surface-50/50 dark:bg-surface-800/30 rounded-lg p-3 min-h-[3em] border border-dashed border-surface-200 dark:border-surface-700">
              {child ? (
                <textarea
                  value={(child.props as ParagraphProps).text || ''}
                  onChange={(e) => updateChildBlock(i, { props: { ...child.props, text: e.target.value } })}
                  className="w-full bg-transparent border-0 outline-none resize-none text-sm text-surface-700 dark:text-surface-300 placeholder-surface-400"
                  placeholder={`Column ${i + 1}...`}
                  rows={2}
                />
              ) : (
                <p className="text-xs text-surface-400 text-center py-4">Column {i + 1}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {[2, 3].map(c => (
          <button
            key={c}
            onClick={() => updateBlockProps(block.id, { count: c })}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${props.count === c ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'text-surface-400 hover:text-surface-600'}`}
          >
            {c} columns
          </button>
        ))}
      </div>
    </div>
  );
}

function PageBreakBlock() {
  return (
    <div className="flex items-center justify-center py-4 text-surface-400">
      <div className="flex-1 border-t border-dashed border-surface-300 dark:border-surface-600" />
      <span className="px-3 text-xs font-semibold uppercase tracking-wider">Page Break</span>
      <div className="flex-1 border-t border-dashed border-surface-300 dark:border-surface-600" />
    </div>
  );
}

function CoverBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as CoverProps;

  return (
    <div className="bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-800 dark:to-surface-900 rounded-xl p-8 text-center space-y-3">
      <input
        value={props.title}
        onChange={(e) => updateBlockProps(block.id, { title: e.target.value })}
        className="w-full bg-transparent border-0 outline-none text-3xl font-bold text-surface-900 dark:text-surface-100 text-center placeholder-surface-400"
        placeholder="Document Title..."
      />
      <input
        value={props.subtitle || ''}
        onChange={(e) => updateBlockProps(block.id, { subtitle: e.target.value })}
        className="w-full bg-transparent border-0 outline-none text-lg text-surface-500 dark:text-surface-400 text-center placeholder-surface-300"
        placeholder="Subtitle..."
      />
      <div className="flex items-center justify-center gap-6 pt-4">
        <input
          value={props.author || ''}
          onChange={(e) => updateBlockProps(block.id, { author: e.target.value })}
          className="bg-transparent border-0 outline-none text-sm text-surface-400 text-center placeholder-surface-300"
          placeholder="Author..."
        />
        <input
          value={props.date || ''}
          onChange={(e) => updateBlockProps(block.id, { date: e.target.value })}
          className="bg-transparent border-0 outline-none text-sm text-surface-400 text-center placeholder-surface-300"
          placeholder="Date..."
        />
      </div>
    </div>
  );
}

function HtmlBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as HtmlProps;

  return (
    <div className="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700">
      <div className="bg-surface-100 dark:bg-surface-800 px-3 py-1.5 text-xs font-semibold text-surface-500 dark:text-surface-400 flex items-center gap-2">
        <span className="font-mono">&lt;/&gt;</span> Custom HTML
      </div>
      <textarea
        value={props.html}
        onChange={(e) => updateBlockProps(block.id, { html: e.target.value })}
        className="w-full bg-surface-50 dark:bg-surface-900 border-0 outline-none resize-none text-sm text-surface-700 dark:text-surface-300 font-mono p-3 leading-relaxed placeholder-surface-400 min-h-[4em]"
        placeholder="<div>Your HTML here...</div>"
        rows={Math.max(3, props.html.split('\n').length + 1)}
        spellCheck={false}
      />
    </div>
  );
}

function SpacerBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as SpacerProps;
  const heightNum = parseInt(props.height) || 32;

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center justify-center w-full" style={{ height: `${Math.min(heightNum, 120)}px` }}>
        <div className="flex-1 border-t border-dashed border-surface-200 dark:border-surface-700" />
        <div className="flex items-center gap-2 px-2">
          <input
            type="range"
            min="8"
            max="200"
            value={heightNum}
            onChange={(e) => updateBlockProps(block.id, { height: e.target.value })}
            className="w-24 h-1 accent-brand-500"
          />
          <span className="text-xs text-surface-400 font-mono w-10">{heightNum}px</span>
        </div>
        <div className="flex-1 border-t border-dashed border-surface-200 dark:border-surface-700" />
      </div>
    </div>
  );
}

function WrapperBlock({ block }: { block: Block }) {
  const { updateBlockProps, blocks } = useEditorStore();
  const props = block.props as WrapperProps;
  const childBlocks = block.children || [];

  const updateChildBlock = (childIndex: number, updates: Partial<Block>) => {
    const newChildren = [...childBlocks];
    if (newChildren[childIndex]) {
      newChildren[childIndex] = { ...newChildren[childIndex], ...updates };
      useEditorStore.getState().setBlocks(
        blocks.map(b => b.id === block.id ? { ...b, children: newChildren } : b)
      );
    }
  };

  const tags = [
    { value: 'div', label: 'Div' },
    { value: 'section', label: 'Section' },
    { value: 'article', label: 'Article' },
    { value: 'aside', label: 'Aside' },
  ];

  return (
    <div className="border border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs text-surface-400 font-mono">
        <span>&lt;{props.tag}&gt;</span>
        <div className="flex gap-1 ml-auto">
          {tags.map(t => (
            <button
              key={t.value}
              onClick={() => updateBlockProps(block.id, { tag: t.value })}
              className={`px-1.5 py-0.5 rounded transition-colors ${props.tag === t.value ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'hover:bg-surface-100 dark:hover:bg-surface-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {childBlocks.length > 0 ? (
        <div className="space-y-2 pl-2">
          {childBlocks.map((child, i) => (
            <div key={child.id} className="bg-surface-50 dark:bg-surface-800/50 rounded-lg p-2">
              <textarea
                value={(child.props as ParagraphProps).text || ''}
                onChange={(e) => updateChildBlock(i, { props: { ...child.props, text: e.target.value } })}
                className="w-full bg-transparent border-0 outline-none resize-none text-sm text-surface-700 dark:text-surface-300 placeholder-surface-400"
                placeholder="Wrapper content..."
                rows={1}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-surface-400 text-center py-2">Wrapper content area</p>
      )}
    </div>
  );
}

function PageDividerBlock({ block }: { block: Block }) {
  const { updateBlockProps } = useEditorStore();
  const props = block.props as PageDividerProps;

  const variants: Record<string, { className: string; style: React.CSSProperties }> = {
    solid: { className: 'border-t', style: { borderTopWidth: props.thickness || '2px', borderTopColor: props.color || '#94a3b8', margin: `${props.spacing || '16px'} 0` } },
    dashed: { className: 'border-t border-dashed', style: { borderTopWidth: props.thickness || '2px', borderTopColor: props.color || '#94a3b8', margin: `${props.spacing || '16px'} 0` } },
    dotted: { className: 'border-t border-dotted', style: { borderTopWidth: props.thickness || '2px', borderTopColor: props.color || '#94a3b8', margin: `${props.spacing || '16px'} 0` } },
    double: { className: '', style: { borderTop: `${props.thickness || '3px'} double ${props.color || '#94a3b8'}`, margin: `${props.spacing || '16px'} 0` } },
    gradient: { className: '', style: { background: `linear-gradient(to right, transparent, ${props.color || '#94a3b8'}, transparent)`, height: props.thickness || '2px', margin: `${props.spacing || '16px'} 0` } },
  };

  const v = variants[props.variant] || variants.solid;

  return (
    <div className="flex items-center gap-3 py-1">
      <div className={`flex-1 ${v.className}`} style={v.style} />
      <div className="flex gap-1">
        {['solid', 'dashed', 'dotted', 'double', 'gradient'].map(variant => (
          <button
            key={variant}
            onClick={() => updateBlockProps(block.id, { variant })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${props.variant === variant ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'text-surface-400 hover:text-surface-600'}`}
          >
            {variant}
          </button>
        ))}
      </div>
    </div>
  );
}
