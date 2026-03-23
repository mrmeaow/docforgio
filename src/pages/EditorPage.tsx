import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore, useEditorStore } from '../stores';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { NoCodeEditor } from '../components/editor/NoCodeEditor';
import { CodeEditor } from '../components/editor/CodeEditor';
import { PreviewPane } from '../components/preview/PreviewPane';
import { ExportModal } from '../components/modals/ExportModal';
import { TemplateBuilderModal } from '../components/modals/TemplateBuilderModal';
import { CommandPalette } from '../components/modals/CommandPalette';
import { useDB } from '../db/DBProvider';

export function EditorPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { db } = useDB();
  const { mode, blocks, htmlSource, cssSource, headSource, dirty, setBlocks, setDirty, undo, redo } = useEditorStore();
  const { setSaveStatus } = useDocumentStore();
  const [showExport, setShowExport] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load document
  useEffect(() => {
    if (!docId || !db) return;
    const load = async () => {
      const { getDocument } = await import('../db');
      const doc = await getDocument(db, docId);
      if (doc) {
        setBlocks(doc.blocks);
        useEditorStore.getState().switchMode(doc.mode);
        useEditorStore.getState().setHtmlSource(doc.htmlSource || '');
        useEditorStore.getState().setCssSource(doc.cssSource || '');
        useEditorStore.getState().setHeadSource(doc.headSource || '');
        setDocTitle(doc.title);
      }
    };
    load();
  }, [docId, db]);

  // Auto-save
  useEffect(() => {
    if (!dirty || !docId || !db) return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const { getDocument, saveDocument: saveToDb } = await import('../db');
        const doc = await getDocument(db, docId);
        if (doc) {
          const editorState = useEditorStore.getState();
          doc.blocks = editorState.blocks;
          doc.mode = editorState.mode;
          doc.htmlSource = editorState.htmlSource;
          doc.cssSource = editorState.cssSource;
          doc.headSource = editorState.headSource;
          doc.title = docTitle;
          await saveToDb(db, doc);
          setSaveStatus('saved');
          setDirty(false);
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('error');
      }
    }, 800);

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [blocks, htmlSource, cssSource, headSource, mode, dirty, docId, db, docTitle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(v => !v); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); /* auto-save handles this */ }
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') { e.preventDefault(); setShowExport(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') { e.preventDefault(); useEditorStore.getState().switchMode(mode === 'nocode' ? 'code' : 'nocode'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, undo, redo]);

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    if (!docId || !db) return;
    try {
      const { getDocument, saveDocument: saveToDb } = await import('../db');
      const doc = await getDocument(db, docId);
      if (doc) { doc.title = docTitle; await saveToDb(db, doc); }
    } catch (err) { console.error('Title save failed:', err); }
  };

  if (!docId) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-50 dark:bg-surface-900">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mx-auto mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
          </div>
          <p className="text-surface-500 mb-4 font-medium">No document selected</p>
          <button onClick={() => navigate('/')} className="btn-primary">Back to Documents</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-surface-900">
      <EditorToolbar onExport={() => setShowExport(true)} onTemplateBuilder={() => setShowTemplateBuilder(true)} onCommandPalette={() => setShowCommandPalette(true)} />

      {/* Document title bar */}
      <div className="flex items-center px-5 py-2 bg-surface-50/80 dark:bg-surface-800/40 border-b border-surface-200/60 dark:border-surface-700/50">
        {isEditingTitle ? (
          <input
            type="text"
            value={docTitle}
            onChange={e => setDocTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
            className="bg-transparent border-0 outline-none text-sm font-semibold text-surface-900 dark:text-surface-100 w-72 placeholder-surface-300"
            placeholder="Document title..."
            autoFocus
          />
        ) : (
          <button onClick={() => setIsEditingTitle(true)} className="text-sm font-semibold text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 transition-colors flex items-center gap-1.5 group">
            {docTitle || 'Untitled'}
            <svg className="w-3.5 h-3.5 text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
        )}
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor pane */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-surface-900">
          {mode === 'nocode' ? (
            <div className="flex-1 overflow-auto">
              <div className="max-w-3xl mx-auto py-8 px-4">
                <NoCodeEditor />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <CodeEditor />
            </div>
          )}
        </div>

        {/* Preview pane */}
        <div className="w-1/2 border-l border-surface-200/60 dark:border-surface-700/50 overflow-hidden bg-surface-50/50 dark:bg-surface-800/30">
          <PreviewPane />
        </div>
      </div>

      {/* Modals */}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showTemplateBuilder && <TemplateBuilderModal onClose={() => setShowTemplateBuilder(false)} />}
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}
    </div>
  );
}
