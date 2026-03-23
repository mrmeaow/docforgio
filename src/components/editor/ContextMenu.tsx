import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../stores';
import {
  Copy, Trash2, ChevronUp, ChevronDown,
  ArrowUp, ArrowDown, Code,
  PaintBucket, Clipboard,
  Plus
} from 'lucide-react';

interface ContextMenuProps {
  blockId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ blockId, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { blocks, deleteBlock, duplicateBlock, moveBlock, insertBlock, selectBlock } = useEditorStore();
  const block = blocks.find(b => b.id === blockId);
  const index = blocks.findIndex(b => b.id === blockId);

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

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!block) return null;

  // Adjust position to stay within viewport
  const adjustedStyle: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 400),
    left: Math.min(x, window.innerWidth - 220),
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

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      className="w-56 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200/60 dark:border-surface-700/50 py-1.5 animate-scale-in overflow-hidden"
    >
      <div className="px-3 py-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-widest">
        {block.type} Block
      </div>

      {/* Insert */}
      <MenuItem icon={Plus} label="Insert Block Above" onClick={() => {
        if (index > 0) {
          insertBlock('paragraph', blocks[index - 1].id);
        } else {
          insertBlock('paragraph');
          moveBlock(blocks[blocks.length - 1].id, 0);
        }
      }} />
      <MenuItem icon={Plus} label="Insert Block Below" shortcut="Enter" onClick={() => insertBlock('paragraph', blockId)} />

      <MenuItem divider />

      {/* Move */}
      <MenuItem icon={ArrowUp} label="Move to Top" shortcut="⌘↑" onClick={() => moveBlock(blockId, 0)} />
      <MenuItem icon={ChevronUp} label="Move Up" shortcut="⌘⇧↑" onClick={() => index > 0 && moveBlock(blockId, index - 1)} />
      <MenuItem icon={ChevronDown} label="Move Down" shortcut="⌘⇧↓" onClick={() => index < blocks.length - 1 && moveBlock(blockId, index + 1)} />
      <MenuItem icon={ArrowDown} label="Move to Bottom" shortcut="⌘↓" onClick={() => moveBlock(blockId, blocks.length - 1)} />

      <MenuItem divider />

      {/* Actions */}
      <MenuItem icon={Copy} label="Duplicate" shortcut="⌘D" onClick={() => duplicateBlock(blockId)} />
      <MenuItem icon={Clipboard} label="Copy Block HTML" onClick={() => {
        selectBlock(blockId);
      }} />
      <MenuItem icon={Code} label="Wrap in Columns" onClick={() => {
        const { blocks: currentBlocks } = useEditorStore.getState();
        const blockIdx = currentBlocks.findIndex(b => b.id === blockId);
        if (blockIdx !== -1) {
          // Insert a columns block after this one, then move current block into it
          insertBlock('columns', blockId);
        }
      }} />
      <MenuItem icon={PaintBucket} label="Reset Styles" onClick={() => {
        const { updateBlockStyle } = useEditorStore.getState();
        updateBlockStyle(blockId, {
          padding: undefined, margin: undefined, backgroundColor: undefined,
          border: undefined, fontSize: undefined, color: undefined,
          fontFamily: undefined, textAlign: undefined, fontWeight: undefined,
          lineHeight: undefined, letterSpacing: undefined, textTransform: undefined,
          textDecoration: undefined, borderRadius: undefined, boxShadow: undefined,
          width: undefined, height: undefined, maxWidth: undefined,
          className: undefined, tailwindClasses: undefined,
        });
      }} />

      <MenuItem divider />

      <MenuItem icon={Trash2} label="Delete" shortcut="Del" onClick={() => deleteBlock(blockId)} danger />
    </div>
  );
}
