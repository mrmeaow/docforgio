import { useState, useCallback, useRef } from 'react';
import { useEditorStore } from '../../stores';
import { BlockRenderer } from './blocks/BlockRenderer';
import { SlashMenu } from './SlashMenu';
import { Plus } from 'lucide-react';

export function NoCodeEditor() {
  const { blocks, slashMenuOpen, slashMenuBlockId, openSlashMenu, closeSlashMenu } = useEditorStore();
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSlashTrigger = useCallback((blockId: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom - (containerRect?.top || 0) + 4, left: 0 });
    openSlashMenu(blockId);
  }, [openSlashMenu]);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4">
            <Plus className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-1">Start building your document</p>
          <p className="text-[13px] text-surface-400 mb-5">Click below or type <kbd className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[11px] font-mono font-bold text-surface-500">/</kbd> to insert blocks</p>
          <button
            onClick={(e) => handleSlashTrigger('', e)}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4" /> Add First Block
          </button>
        </div>
      ) : (
        <>
          {blocks.map((block) => (
            <div key={block.id} className="pl-8 pr-2">
              <BlockRenderer block={block} />
              {slashMenuOpen && slashMenuBlockId === block.id && <SlashMenu blockId={block.id} onClose={closeSlashMenu} position={menuPosition} />}
            </div>
          ))}
          <div className="pl-8 pr-2 mt-3">
            <button
              onClick={(e) => handleSlashTrigger(blocks[blocks.length - 1]?.id || '', e)}
              className="w-full py-2.5 text-left text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-50/50 dark:hover:bg-surface-800/50 rounded-xl text-[13px] font-medium flex items-center gap-2 px-3 transition-all border border-dashed border-transparent hover:border-surface-200 dark:hover:border-surface-700"
            >
              <Plus className="w-4 h-4" /> Add block
            </button>
          </div>
        </>
      )}
    </div>
  );
}
