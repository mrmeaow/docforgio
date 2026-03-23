import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorStore, useDocumentStore } from '../../stores';
import { Search, FileText, Code, Download, Settings, ArrowLeft, Type, Undo, Redo } from 'lucide-react';

interface CommandPaletteProps {
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  action: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { switchMode, mode, undo, redo, insertBlock } = useEditorStore();
  const { documents, loadDocuments } = useDocumentStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => { loadDocuments(); }, []);

  const commands: Command[] = [
    { id: 'mode-toggle', label: mode === 'nocode' ? 'Switch to Code Mode' : 'Switch to Visual Mode', shortcut: 'Ctrl+\\', icon: Code, category: 'Editor', action: () => switchMode(mode === 'nocode' ? 'code' : 'nocode') },
    { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', icon: Undo, category: 'Editor', action: undo },
    { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', icon: Redo, category: 'Editor', action: redo },
    { id: 'add-heading', label: 'Add Heading', icon: Type, category: 'Insert', action: () => insertBlock('heading') },
    { id: 'add-paragraph', label: 'Add Paragraph', icon: FileText, category: 'Insert', action: () => insertBlock('paragraph') },
    { id: 'add-code', label: 'Add Code Block', icon: Code, category: 'Insert', action: () => insertBlock('code') },
    { id: 'export', label: 'Export Document...', shortcut: 'Ctrl+E', icon: Download, category: 'Actions', action: () => {} },
    { id: 'settings', label: 'Open Settings', icon: Settings, category: 'Navigation', action: () => navigate('/settings') },
    { id: 'home', label: 'Go to Home', icon: ArrowLeft, category: 'Navigation', action: () => navigate('/') },
    ...documents.slice(0, 5).map((doc: any) => ({
      id: `doc-${doc.id}`, label: `Open: ${doc.title}`, icon: FileText, category: 'Documents',
      action: () => navigate(`/editor/${doc.id}`),
    })),
  ];

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setSelectedIndex(0); }, [search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) { filtered[selectedIndex].action(); onClose(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [filtered, selectedIndex]);

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Search bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-200/60 dark:border-surface-700/50">
          <Search className="w-5 h-5 text-surface-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-0 outline-none text-surface-900 dark:text-surface-100 placeholder-surface-400 text-sm"
            autoFocus
          />
          <kbd className="text-[11px] text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded-lg font-mono font-semibold">ESC</kbd>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto py-2">
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <div className="px-5 py-2 text-[10px] font-bold text-surface-400 uppercase tracking-widest">{category}</div>
              {cmds.map((cmd) => {
                const globalIndex = filtered.indexOf(cmd);
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose(); }}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                      globalIndex === selectedIndex
                        ? 'bg-brand-50/60 dark:bg-brand-900/20'
                        : 'hover:bg-surface-50 dark:hover:bg-surface-700/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      globalIndex === selectedIndex
                        ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                        : 'bg-surface-100 dark:bg-surface-700/60 text-surface-400'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={`flex-1 text-sm font-medium ${
                      globalIndex === selectedIndex ? 'text-brand-700 dark:text-brand-300' : 'text-surface-800 dark:text-surface-200'
                    }`}>{cmd.label}</span>
                    {cmd.shortcut && <kbd className="text-[10px] text-surface-400 bg-surface-100 dark:bg-surface-700/60 px-1.5 py-0.5 rounded-md font-mono font-semibold">{cmd.shortcut}</kbd>}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5 text-surface-300" />
              </div>
              <p className="text-sm text-surface-400">No commands found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
