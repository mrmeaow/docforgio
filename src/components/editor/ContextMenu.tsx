import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../stores';
import {
  Copy, Trash2, ChevronUp, ChevronDown,
  ArrowUp, ArrowDown, Code,
  PaintBucket, Clipboard,
  Plus, Type, Palette, Box, AlignLeft, AlignCenter, AlignRight,
  Heading, Image, Table, List, AlertCircle, Minus, Columns, Scissors, BookOpen, FileCode,
  ArrowLeft
} from 'lucide-react';
import type { BlockType, BlockStyle } from '../../types';
import { SLASH_MENU_ITEMS } from '../../types';

interface ContextMenuProps {
  blockId: string;
  x: number;
  y: number;
  onClose: () => void;
}

type Panel = 'main' | 'insert-above' | 'insert-below' | 'styles';

export function ContextMenu({ blockId, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { blocks, deleteBlock, duplicateBlock, moveBlock, insertBlock, selectBlock, updateBlockStyle } = useEditorStore();
  const block = blocks.find(b => b.id === blockId);
  const index = blocks.findIndex(b => b.id === blockId);
  const [panel, setPanel] = useState<Panel>('main');
  const [insertPosition, setInsertPosition] = useState<'above' | 'below' | null>(null);

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    heading: Heading, type: Type, image: Image, table: Table, list: List,
    'alert-circle': AlertCircle, code: Code, minus: Minus, columns: Columns,
    scissors: Scissors, 'book-open': BookOpen, 'file-code': FileCode,
    'move-vertical': Type, box: Box, 'separator-horizontal': Minus,
  };

  const handleInsertBlock = (type: BlockType) => {
    if (insertPosition) {
      if (insertPosition === 'above' && index > 0) {
        insertBlock(type, blocks[index - 1].id);
      } else {
        insertBlock(type, blockId);
      }
    }
    setPanel('main');
    setInsertPosition(null);
    onClose();
  };

  const handleStyleClick = (style: Partial<BlockStyle>) => {
    updateBlockStyle(blockId, style);
    setPanel('main');
    onClose();
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape (or go back if in submenu)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (panel !== 'main') {
          setPanel('main');
          setInsertPosition(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, panel]);

  if (!block) return null;

  const adjustedStyle: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 350),
    left: Math.min(x, window.innerWidth - 280),
    zIndex: 9999,
  };

  const MenuItem = ({ icon: Icon, label, shortcut, onClick, danger, divider }: {
    icon?: React.ComponentType<{ className?: string }>;
    label?: string;
    shortcut?: string;
    onClick?: () => void;
    danger?: boolean;
    divider?: boolean;
  }) => {
    if (divider) return <div className="h-px bg-surface-200 dark:bg-surface-700 my-1" />;
    return (
      <button
        onClick={() => { onClick?.(); onClose(); }}
        className={`w-full flex items-center gap-3 px-3 py-1.5 text-[13px] rounded-lg transition-colors ${
          danger
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/60'
        }`}
      >
        {Icon && <Icon className="w-4 h-4 opacity-60" />}
        <span className="flex-1 text-left">{label}</span>
        {shortcut && <span className="text-[11px] text-surface-400 font-mono">{shortcut}</span>}
      </button>
    );
  };

  const BackHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <button
      onClick={onBack}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700/40 rounded-lg transition-colors mb-0.5"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>{title}</span>
    </button>
  );

  const stylePresets: { label: string; icon: typeof Type; style: Partial<BlockStyle>; iconColor?: string }[] = [
    { label: 'Bold', icon: Type, style: { fontWeight: '700' } },
    { label: 'Italic', icon: Type, style: { textDecoration: 'italic' } },
    { label: 'Uppercase', icon: Type, style: { textTransform: 'uppercase' } },
    { label: 'Align Left', icon: AlignLeft, style: { textAlign: 'left' } },
    { label: 'Align Center', icon: AlignCenter, style: { textAlign: 'center' } },
    { label: 'Align Right', icon: AlignRight, style: { textAlign: 'right' } },
    { label: 'Add Padding', icon: Box, style: { padding: '1rem' } },
    { label: 'Add Margin', icon: Box, style: { margin: '1rem 0' } },
    {
      label: 'Reset Styles', icon: PaintBucket, iconColor: 'text-red-400',
      style: {
        padding: undefined, margin: undefined, backgroundColor: undefined,
        border: undefined, fontSize: undefined, color: undefined,
        fontFamily: undefined, textAlign: undefined, fontWeight: undefined,
        lineHeight: undefined, letterSpacing: undefined, textTransform: undefined,
        textDecoration: undefined, borderRadius: undefined, boxShadow: undefined,
        width: undefined, height: undefined, maxWidth: undefined,
        className: undefined, tailwindClasses: undefined,
      }
    },
  ];

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      className="w-64 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200/60 dark:border-surface-700/50 py-1.5 animate-scale-in max-h-[80vh] flex flex-col"
    >
      {/* ===== MAIN PANEL ===== */}
      {panel === 'main' && (
        <div className="flex flex-col">
          <div className="px-3 py-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-widest">
            {block.type} Block
          </div>

          <button
            onClick={() => { setInsertPosition('above'); setPanel('insert-above'); }}
            className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] rounded-lg transition-colors text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/60"
          >
            <Plus className="w-4 h-4 opacity-60" />
            <span className="flex-1 text-left">Insert Block Above</span>
            <ChevronDown className="w-3 h-3 opacity-60 -rotate-90" />
          </button>

          <button
            onClick={() => { setInsertPosition('below'); setPanel('insert-below'); }}
            className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] rounded-lg transition-colors text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/60"
          >
            <Plus className="w-4 h-4 opacity-60" />
            <span className="flex-1 text-left">Insert Block Below</span>
            <ChevronDown className="w-3 h-3 opacity-60 -rotate-90" />
          </button>

          <MenuItem divider />

          <MenuItem icon={ArrowUp} label="Move to Top" shortcut="⌘↑" onClick={() => moveBlock(blockId, 0)} />
          <MenuItem icon={ChevronUp} label="Move Up" shortcut="⌘⇧↑" onClick={() => index > 0 && moveBlock(blockId, index - 1)} />
          <MenuItem icon={ChevronDown} label="Move Down" shortcut="⌘⇧↓" onClick={() => index < blocks.length - 1 && moveBlock(blockId, index + 1)} />
          <MenuItem icon={ArrowDown} label="Move to Bottom" shortcut="⌘↓" onClick={() => moveBlock(blockId, blocks.length - 1)} />

          <MenuItem divider />

          <MenuItem icon={Copy} label="Duplicate" shortcut="⌘D" onClick={() => duplicateBlock(blockId)} />
          <MenuItem icon={Clipboard} label="Copy Block HTML" onClick={() => { selectBlock(blockId); }} />
          <MenuItem icon={Code} label="Wrap in Columns" onClick={() => { insertBlock('columns', blockId); }} />

          <button
            onClick={() => setPanel('styles')}
            className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] rounded-lg transition-colors text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/60"
          >
            <Palette className="w-4 h-4 opacity-60" />
            <span className="flex-1 text-left">Styles</span>
            <ChevronDown className="w-3 h-3 opacity-60 -rotate-90" />
          </button>

          <MenuItem divider />

          <MenuItem icon={Trash2} label="Delete" shortcut="Del" onClick={() => deleteBlock(blockId)} danger />
        </div>
      )}

      {/* ===== INSERT ABOVE PANEL ===== */}
      {panel === 'insert-above' && (
        <div className="flex flex-col overflow-y-auto max-h-[70vh]">
          <div className="px-2 pt-0.5">
            <BackHeader title="Insert Block Above" onBack={() => { setPanel('main'); setInsertPosition(null); }} />
          </div>
          {SLASH_MENU_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || Type;
            return (
              <button
                key={item.type}
                onClick={() => handleInsertBlock(item.type)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700/40 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-surface-100 dark:bg-surface-700/60 text-surface-500 dark:text-surface-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-surface-900 dark:text-surface-100">{item.label}</div>
                  <div className="text-[11px] text-surface-400 truncate">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== INSERT BELOW PANEL ===== */}
      {panel === 'insert-below' && (
        <div className="flex flex-col overflow-y-auto max-h-[70vh]">
          <div className="px-2 pt-0.5">
            <BackHeader title="Insert Block Below" onBack={() => { setPanel('main'); setInsertPosition(null); }} />
          </div>
          {SLASH_MENU_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || Type;
            return (
              <button
                key={item.type}
                onClick={() => handleInsertBlock(item.type)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700/40 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-surface-100 dark:bg-surface-700/60 text-surface-500 dark:text-surface-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-surface-900 dark:text-surface-100">{item.label}</div>
                  <div className="text-[11px] text-surface-400 truncate">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== STYLES PANEL ===== */}
      {panel === 'styles' && (
        <div className="flex flex-col">
          <div className="px-2 pt-0.5">
            <BackHeader title="Quick Styles" onBack={() => setPanel('main')} />
          </div>
          {stylePresets.map((preset, i) => {
            const Icon = preset.icon;
            const isDivider = i === 3 || i === 6 || i === 8;
            return (
              <div key={preset.label}>
                {isDivider && <div className="h-px bg-surface-200 dark:bg-surface-700 mx-3 my-1" />}
                <button
                  onClick={() => handleStyleClick(preset.style)}
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] rounded-lg transition-colors text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/60"
                >
                  <Icon className={`w-4 h-4 opacity-60 ${preset.iconColor || ''}`} />
                  <span className="flex-1 text-left">{preset.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
