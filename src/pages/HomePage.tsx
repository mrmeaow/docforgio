import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Settings, Grid, List, Sparkles, Clock3, FolderOpen, Trash2, ChevronRight } from 'lucide-react';
import { useDocumentStore } from '../stores';
import { formatDate } from '../utils/id';

export function HomePage() {
  const navigate = useNavigate();
  const { documents, loadDocuments, deleteDocument, isLoading } = useDocumentStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => { loadDocuments(); }, []);

  const handleCreate = async () => {
    const { createDocument } = useDocumentStore.getState();
    const doc = await createDocument('Untitled Document');
    navigate(`/editor/${doc.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this document?')) await deleteDocument(id);
  };

  const sortedDocs = [...documents].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 pt-5">
        <div className="max-w-7xl mx-auto glass-strong rounded-2xl px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-surface-900 flex items-center justify-center text-white shadow-lg">
              <FileText className="w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-surface-900 dark:text-surface-100 leading-none">DocForgio</p>
              <p className="text-[11px] text-surface-400 leading-none mt-0.5">Open document studio</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => navigate('/templates')} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-surface-600 dark:text-surface-300 hover:bg-surface-100/60 dark:hover:bg-surface-700/60 transition-all">
              <Sparkles className="w-4 h-4 text-brand-500" /> Templates
            </button>
            <button onClick={() => navigate('/settings')} className="p-2 rounded-xl hover:bg-surface-100/60 dark:hover:bg-surface-700/60 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-all">
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-end pb-10">
          <div className="animate-fade-in">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400 text-[11px] font-extrabold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2 animate-pulse" />
              Workspace
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tighter leading-[0.95] text-surface-900 dark:text-surface-100">
              Build documents that<br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">look intentional.</span>
            </h1>
            <p className="mt-4 text-base text-surface-500 dark:text-surface-400 max-w-lg leading-relaxed">
              A free, open-source document studio running entirely in your browser. No accounts, no servers, no subscriptions.
            </p>
          </div>
          <div className="flex flex-wrap lg:justify-end gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <button onClick={handleCreate} className="btn-brand">
              <Plus className="w-5 h-5" /> New Document
            </button>
            <button onClick={() => navigate('/templates')} className="btn-secondary">
              <Sparkles className="w-4 h-4 text-brand-500" /> Browse Templates
            </button>
          </div>
        </section>

        {/* Content grid */}
        <section className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar summary */}
          <aside className="section-card p-5 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="flex items-end justify-between mb-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Library</span>
              <span className="text-3xl font-extrabold tracking-tighter text-surface-900 dark:text-surface-100">{documents.length}</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50/50 dark:bg-surface-900/40 border border-surface-200/30 dark:border-surface-700/30 transition-colors hover:bg-surface-50 dark:hover:bg-surface-900/60">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-surface-400 font-medium">Documents</p>
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">{documents.length} file{documents.length !== 1 ? 's' : ''} ready</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50/50 dark:bg-surface-900/40 border border-surface-200/30 dark:border-surface-700/30 transition-colors hover:bg-surface-50 dark:hover:bg-surface-900/60">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                  <Clock3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-surface-400 font-medium">Last activity</p>
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">{sortedDocs[0] ? formatDate(sortedDocs[0].updatedAt) : 'No edits yet'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50/50 dark:bg-surface-900/40 border border-surface-200/30 dark:border-surface-700/30 transition-colors hover:bg-surface-50 dark:hover:bg-surface-900/60">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-surface-400 font-medium">Next step</p>
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">{documents.length > 0 ? 'Open a doc and refine it' : 'Start from a blank document'}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Document list */}
          <section className="section-card p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">My Documents</h2>
                <p className="text-[13px] text-surface-400 mt-0.5">Your active drafts, ready to open.</p>
              </div>
              <div className="segment-group">
                <button onClick={() => setViewMode('grid')} className={`segment-item flex items-center gap-1.5 ${viewMode === 'grid' ? 'active' : ''}`}>
                  <Grid className="w-3.5 h-3.5" /> Grid
                </button>
                <button onClick={() => setViewMode('list')} className={`segment-item flex items-center gap-1.5 ${viewMode === 'list' ? 'active' : ''}`}>
                  <List className="w-3.5 h-3.5" /> List
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[20rem]">
                <div className="spinner" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[20rem] bg-surface-50/50 dark:bg-surface-900/30 border border-dashed border-surface-200 dark:border-surface-700 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 dark:text-brand-400 mb-5">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">No documents yet</h3>
                <p className="text-sm text-surface-400 mt-1.5 max-w-sm">Start with a blank page or use a template to get moving.</p>
                <button onClick={handleCreate} className="mt-5 btn-brand">
                  <Plus className="w-4 h-4" /> Create Document
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
                {sortedDocs.map((doc: any) => (
                  <article key={doc.id} onClick={() => navigate(`/editor/${doc.id}`)} className="group section-card p-4 card-interactive">
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-brand-50/80 to-blue-50/60 dark:from-brand-900/15 dark:to-surface-800/60 border border-white/60 dark:border-surface-700/40 mb-3 flex items-center justify-center overflow-hidden">
                      {doc.thumbnail ? <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover" /> : <FileText className="w-10 h-10 text-brand-400/40" />}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-extrabold uppercase tracking-wide">{doc.mode}</span>
                        <span className="text-[11px] text-surface-400">{formatDate(doc.updatedAt)}</span>
                      </div>
                      <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 line-clamp-1 leading-snug">{doc.title}</h3>
                      <div className="flex items-center justify-between pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                          Open <ChevronRight className="w-3 h-3" />
                        </span>
                        <button onClick={(e) => handleDelete(e, doc.id)} className="text-surface-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-surface-200/50 dark:border-surface-700/50">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-surface-50/80 dark:bg-surface-800/50">
                      <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-surface-400">Title</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-surface-400">Modified</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-surface-400">Mode</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-surface-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDocs.map((doc: any) => (
                      <tr key={doc.id} onClick={() => navigate(`/editor/${doc.id}`)} className="border-t border-surface-100 dark:border-surface-700/40 cursor-pointer hover:bg-surface-50/50 dark:hover:bg-surface-700/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-surface-400">{formatDate(doc.updatedAt)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-extrabold uppercase tracking-wide">{doc.mode}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={(e) => handleDelete(e, doc.id)} className="text-surface-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
