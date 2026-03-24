import { useState, useEffect } from 'react';
import { useEditorStore } from '../../stores';
import type { BlockType, SlashMenuItem } from '../../types';
import { SLASH_MENU_ITEMS } from '../../types';
import {
  Heading, Type, Image, Table, List, AlertCircle, Code, Minus,
  Columns, Scissors, BookOpen, FileCode, Search, MoveVertical, Box, SeparatorHorizontal
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  heading: Heading, type: Type, image: Image, table: Table, list: List,
  'alert-circle': AlertCircle, code: Code, minus: Minus, columns: Columns,
  scissors: Scissors, 'book-open': BookOpen, 'file-code': FileCode,
  'move-vertical': MoveVertical, box: Box, 'separator-horizontal': SeparatorHorizontal,
};

interface SlashMenuProps {
  blockId: string;
  onClose: () => void;
  position: { top: number; left: number };
}

export function SlashMenu({ blockId, onClose, position }: SlashMenuProps) {
  const { insertBlock } = useEditorStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered: SlashMenuItem[] = SLASH_MENU_ITEMS.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex].type);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [filtered, selectedIndex]);

  useEffect(() => { setSelectedIndex(0); }, [search]);

  const handleSelect = (type: BlockType) => { insertBlock(type, blockId); onClose(); };

  return (
    <div
      className="absolute z-50 w-72 bg-white dark:bg-surface-800 border border-surface-200/60 dark:border-surface-700/50 rounded-2xl shadow-xl overflow-hidden animate-scale-in"
      style={{ top: position.top, left: position.left }}
    >
      {/* Search */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-surface-100 dark:border-surface-700/50">
        <Search className="w-4 h-4 text-surface-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search blocks..."
          className="flex-1 bg-transparent border-0 outline-none text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400"
          autoFocus
        />
      </div>

      {/* Block list */}
      <div className="max-h-64 overflow-y-auto py-1.5">
        {filtered.map((item: SlashMenuItem, i: number) => {
          const Icon = iconMap[item.icon] || Type;
          return (
            <button
              key={item.type}
              onClick={() => handleSelect(item.type)}
              className={`w-full flex items-center gap-3 px-3.5 py-2 text-left transition-colors ${
                i === selectedIndex
                  ? 'bg-brand-50/60 dark:bg-brand-900/20'
                  : 'hover:bg-surface-50 dark:hover:bg-surface-700/40'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                i === selectedIndex
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                  : 'bg-surface-100 dark:bg-surface-700/60 text-surface-500 dark:text-surface-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${
                  i === selectedIndex ? 'text-brand-700 dark:text-brand-300' : 'text-surface-900 dark:text-surface-100'
                }`}>{item.label}</div>
                <div className="text-[11px] text-surface-400 truncate">{item.description}</div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-[13px] text-surface-400">No blocks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
