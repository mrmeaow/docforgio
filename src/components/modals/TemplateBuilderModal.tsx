import { useState, useRef } from 'react';
import { useEditorStore, useTemplateStore } from '../../stores';
import type { Template, TemplateCategory } from '../../types';
import { X, Download, Upload, FileJson, Trash2, Save, FolderOpen, Copy, Check, AlertCircle } from 'lucide-react';

interface TemplateBuilderModalProps {
  onClose: () => void;
}

type Tab = 'save' | 'import' | 'templates' | 'export';

const CATEGORIES: TemplateCategory[] = ['business', 'academic', 'legal', 'creative', 'personal', 'technical'];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  business: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  academic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  legal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  creative: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  personal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  technical: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
};

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function isValidTemplate(obj: any): obj is Template {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.description === 'string' &&
    Array.isArray(obj.blocks) &&
    typeof obj.cssSource === 'string' &&
    typeof obj.headSource === 'string'
  );
}

export function TemplateBuilderModal({ onClose }: TemplateBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('save');
  const { userTemplates } = useTemplateStore();

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'save', label: 'Save', icon: Save },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'templates', label: 'My Templates', icon: FolderOpen },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200/60 dark:border-surface-700/50">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">Template Builder</h2>
            <p className="text-[13px] text-surface-400 mt-0.5">Save, import, and manage your document templates.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-1 border-b border-surface-200/60 dark:border-surface-700/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-t-lg transition-all relative ${
                  activeTab === tab.id
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'save' && <SaveAsTemplateTab />}
          {activeTab === 'import' && <ImportTemplateTab />}
          {activeTab === 'templates' && <MyTemplatesTab templates={userTemplates} />}
          {activeTab === 'export' && <ExportDocumentTab />}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200/60 dark:border-surface-700/50 flex justify-end">
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
}

function SaveAsTemplateTab() {
  const { blocks, cssSource, headSource } = useEditorStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('business');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setResult({ type: 'error', message: 'Template name is required.' });
      return;
    }
    if (blocks.length === 0) {
      setResult({ type: 'error', message: 'Document has no blocks to save.' });
      return;
    }

    setSaving(true);
    setResult(null);
    try {
      await useTemplateStore.getState().saveAsTemplate(name.trim(), category, description.trim(), blocks, cssSource, headSource);
      setResult({ type: 'success', message: 'Template saved successfully!' });
      setName('');
      setDescription('');
    } catch (err) {
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save template.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label className="form-label">Template Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Monthly Report"
          className="input-field"
        />
      </div>

      <div>
        <label className="form-label">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value as TemplateCategory)} className="input-select">
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what this template is for..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      <div className="text-[13px] text-surface-400">
        {blocks.length} block{blocks.length !== 1 ? 's' : ''} will be saved with this template.
      </div>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
          result.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {result.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {result.message}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Template'}
      </button>
    </div>
  );
}

function ImportTemplateTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Template | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.docforgio')) {
      setResult({ type: 'error', message: 'Please select a .json or .docforgio file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!isValidTemplate(data)) {
          setResult({ type: 'error', message: 'Invalid template format. Missing required fields.' });
          setPreview(null);
          return;
        }
        setPreview(data);
        setResult(null);
      } catch {
        setResult({ type: 'error', message: 'Failed to parse file as JSON.' });
        setPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    setResult(null);
    try {
      await useTemplateStore.getState().importTemplate(preview);
      setResult({ type: 'success', message: 'Template imported successfully!' });
      setPreview(null);
    } catch (err) {
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Failed to import template.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-400">
          <FileJson className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">Drop a template file here</p>
          <p className="text-[12px] text-surface-400 mt-1">or click to browse (.json, .docforgio)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.docforgio"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          className="hidden"
        />
      </div>

      {preview && (
        <div className="p-4 rounded-xl border border-surface-200/60 dark:border-surface-700/50 bg-surface-50/60 dark:bg-surface-900/40 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">{preview.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CATEGORY_COLORS[preview.category]}`}>
              {preview.category}
            </span>
          </div>
          <p className="text-[13px] text-surface-500">{preview.description || 'No description'}</p>
          <p className="text-[12px] text-surface-400">{preview.blocks.length} block{preview.blocks.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
          result.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {result.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {result.message}
        </div>
      )}

      {preview && (
        <button onClick={handleImport} disabled={importing} className="btn-primary w-full">
          <Upload className="w-4 h-4" />
          {importing ? 'Importing...' : 'Import Template'}
        </button>
      )}
    </div>
  );
}

function MyTemplatesTab({ templates }: { templates: Template[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleExport = async (id: string) => {
    const blob = await useTemplateStore.getState().exportTemplate(id);
    if (blob) {
      const template = templates.find(t => t.id === id);
      downloadBlob(`${template?.name || 'template'}.json`, blob);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await useTemplateStore.getState().deleteTemplate(id);
    } catch {
      // error handled by store
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-300 mb-3">
          <FolderOpen className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-surface-500">No saved templates yet</p>
        <p className="text-[12px] text-surface-400 mt-1">Use the Save tab to create your first template.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {templates.map(template => (
        <div key={template.id} className="p-4 rounded-xl border border-surface-200/60 dark:border-surface-700/50 bg-surface-50/40 dark:bg-surface-900/30 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 truncate">{template.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CATEGORY_COLORS[template.category]}`}>
                  {template.category}
                </span>
                <span className="text-[12px] text-surface-400">
                  {template.blocks.length} block{template.blocks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleExport(template.id)}
                className="p-1.5 rounded-lg hover:bg-surface-200/60 dark:hover:bg-surface-600/60 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-all"
                title="Export template"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setConfirmDeleteId(template.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-all"
                title="Delete template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {template.description && (
            <p className="text-[13px] text-surface-500 line-clamp-2">{template.description}</p>
          )}

          {confirmDeleteId === template.id && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-[13px] text-red-700 dark:text-red-300 font-medium">Delete this template?</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <button onClick={() => setConfirmDeleteId(null)} className="btn-ghost text-[13px] px-2 py-1">Cancel</button>
                <button
                  onClick={() => handleDelete(template.id)}
                  disabled={deletingId === template.id}
                  className="px-2 py-1 rounded-lg bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {deletingId === template.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExportDocumentTab() {
  const { blocks, cssSource, headSource } = useEditorStore();
  const [includeBlocks, setIncludeBlocks] = useState(true);
  const [includeStyles, setIncludeStyles] = useState(true);
  const [includeHead, setIncludeHead] = useState(true);

  const handleDownload = () => {
    const template = {
      name: 'Exported Document',
      slug: 'exported-document',
      category: 'personal' as TemplateCategory,
      description: 'Exported from current document',
      thumbnail: null,
      blocks: includeBlocks ? blocks : [],
      cssSource: includeStyles ? cssSource : '',
      headSource: includeHead ? headSource : '',
      isBuiltIn: false,
      source: 'user' as const,
      version: '1.0.0',
      createdAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    downloadBlob('template.json', blob);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-sm text-surface-500">Choose what to include in the exported template file.</p>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" checked={includeBlocks} onChange={e => setIncludeBlocks(e.target.checked)} className="input-checkbox" />
          <div>
            <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">Blocks</span>
            <p className="text-[11px] text-surface-400">{blocks.length} block{blocks.length !== 1 ? 's' : ''} from the current document</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" checked={includeStyles} onChange={e => setIncludeStyles(e.target.checked)} className="input-checkbox" />
          <div>
            <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">Custom CSS</span>
            <p className="text-[11px] text-surface-400">{cssSource ? `${cssSource.length} chars` : 'No custom CSS'}</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" checked={includeHead} onChange={e => setIncludeHead(e.target.checked)} className="input-checkbox" />
          <div>
            <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">Head Content</span>
            <p className="text-[11px] text-surface-400">{headSource ? `${headSource.length} chars` : 'No head content'}</p>
          </div>
        </label>
      </div>

      <button onClick={handleDownload} className="btn-primary w-full">
        <Download className="w-4 h-4" />
        Download Template
      </button>
    </div>
  );
}
