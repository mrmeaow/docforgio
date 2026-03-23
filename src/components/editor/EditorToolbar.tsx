import { useNavigate } from 'react-router-dom';
import { useEditorStore, useDocumentStore } from '../../stores';
import { ArrowLeft, Code, Type, Download, Undo, Redo, Command, FolderOpen } from 'lucide-react';

interface EditorToolbarProps {
  onExport: () => void;
  onTemplateBuilder: () => void;
  onCommandPalette: () => void;
}

export function EditorToolbar({ onExport, onTemplateBuilder, onCommandPalette }: EditorToolbarProps) {
  const navigate = useNavigate();
  const { mode, switchMode, undo, redo, canUndo, canRedo, codeSynced } = useEditorStore();
  const { saveStatus } = useDocumentStore();

  return (
    <header className="flex items-center justify-between px-5 py-2.5 bg-white dark:bg-surface-800 border-b border-surface-200/60 dark:border-surface-700/50 shrink-0">
      <div className="flex items-center gap-1">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-surface-100/80 dark:hover:bg-surface-700/60 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-all" title="Back to home">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </button>

        <div className="divider-v mx-2 h-5" />

        {/* Mode toggle — segmented control */}
        <div className="segment-group">
          <button onClick={() => switchMode('nocode')} className={`segment-item flex items-center gap-1.5 ${mode === 'nocode' ? 'active' : ''}`}>
            <Type className="w-3.5 h-3.5" /> Visual
          </button>
          <button onClick={() => switchMode('code')} className={`segment-item flex items-center gap-1.5 ${mode === 'code' ? 'active' : ''}`}>
            <Code className="w-3.5 h-3.5" /> Code
          </button>
        </div>

        <div className="divider-v mx-2 h-5" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={!canUndo()} className="p-2 rounded-xl hover:bg-surface-100/80 dark:hover:bg-surface-700/60 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 disabled:opacity-25 disabled:cursor-not-allowed transition-all" title="Undo (Ctrl+Z)">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={redo} disabled={!canRedo()} className="p-2 rounded-xl hover:bg-surface-100/80 dark:hover:bg-surface-700/60 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 disabled:opacity-25 disabled:cursor-not-allowed transition-all" title="Redo (Ctrl+Y)">
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {mode === 'code' && <SyncStatusIndicator synced={codeSynced} />}
        <SaveStatusIndicator status={saveStatus} />

        <button onClick={onCommandPalette} className="p-2 rounded-xl hover:bg-surface-100/80 dark:hover:bg-surface-700/60 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-all" title="Command Palette (Ctrl+K)">
          <Command className="w-4 h-4" />
        </button>

        <button onClick={onTemplateBuilder} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200/60 dark:border-surface-700/50 text-surface-700 dark:text-surface-300 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700/40 transition-all">
          <FolderOpen className="w-4 h-4" /> Templates
        </button>

        <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-sm font-semibold hover:opacity-90 transition-all shadow-sm hover:shadow-md">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>
    </header>
  );
}

function SaveStatusIndicator({ status }: { status: string }) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-2 text-[13px] text-surface-400 font-medium">
        <div className="w-3 h-3 border-2 border-surface-200 dark:border-surface-600 border-t-brand-500 rounded-full animate-spin" />
        Saving...
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Saved
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-[13px] text-red-600 dark:text-red-400 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Error
      </span>
    );
  }
  return null;
}

function SyncStatusIndicator({ synced }: { synced: boolean }) {
  if (synced) {
    return (
      <span className="flex items-center gap-1.5 text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Synced
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-amber-600 dark:text-amber-400 font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Unsynced
    </span>
  );
}
