import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Search, Filter, Sparkles, Users } from 'lucide-react';
import { useTemplateStore, useDocumentStore } from '../stores';
import type { TemplateCategory } from '../types';

const categories: (TemplateCategory | 'all')[] = ['all', 'business', 'academic', 'legal', 'creative', 'personal', 'technical'];

export function TemplatesPage() {
  const navigate = useNavigate();
  const { builtInTemplates, userTemplates, communityTemplates, loadTemplates, isLoading } = useTemplateStore();
  const { createDocument } = useDocumentStore();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'builtin' | 'user' | 'community'>('builtin');

  useEffect(() => { loadTemplates(); }, []);

  const handleUse = async (templateId: string) => {
    const { applyTemplate } = useTemplateStore.getState();
    const template = await applyTemplate(templateId);
    if (template) {
      const doc = await createDocument(`${template.name} Document`, template.id, template.blocks, template.cssSource, template.headSource);
      navigate(`/editor/${doc.id}`);
    }
  };

  const allTemplates = activeTab === 'builtin' ? builtInTemplates : activeTab === 'user' ? userTemplates : communityTemplates;
  const filtered = allTemplates.filter((t: any) => {
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const tabs = [
    { id: 'builtin' as const, label: 'Built-in', count: builtInTemplates.length, icon: Sparkles },
    { id: 'user' as const, label: 'My Templates', count: userTemplates.length, icon: FileText },
    { id: 'community' as const, label: 'Community', count: communityTemplates.length, icon: Users },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 pt-5">
        <div className="max-w-7xl mx-auto glass-strong rounded-2xl px-5 py-3.5 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-surface-100/60 dark:hover:bg-surface-700/60 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-all">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <h1 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">Templates</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs and search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-surface-900 dark:bg-white text-white dark:text-surface-900 shadow-md'
                      : 'section-card text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                    activeTab === tab.id
                      ? 'bg-white/20 dark:bg-surface-900/20'
                      : 'bg-surface-100 dark:bg-surface-700/60 text-surface-400'
                  }`}>{tab.count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 pr-4 py-2.5 w-72 text-sm"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-surface-400 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all capitalize ${
                selectedCategory === cat
                  ? 'bg-brand-500/10 text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100/60 dark:hover:bg-surface-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-5">
              <FileText className="w-8 h-8 text-surface-300 dark:text-surface-600" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-2">
              {activeTab === 'community' ? 'No community templates' : 'No templates found'}
            </h3>
            <p className="text-sm text-surface-400 max-w-sm mx-auto">
              {activeTab === 'community'
                ? 'Community templates appear here when enabled in settings.'
                : 'Try adjusting your search or filter to find what you need.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
            {filtered.map((template: any) => (
              <div
                key={template.id}
                className="group section-card overflow-hidden card-interactive"
                onClick={() => handleUse(template.id)}
              >
                {/* Thumbnail area */}
                <div className="aspect-[16/10] bg-gradient-to-br from-brand-50/80 to-amber-50/50 dark:from-brand-900/15 dark:to-surface-800/60 flex items-center justify-center relative overflow-hidden">
                  {template.thumbnail ? (
                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-12 h-12 text-surface-200 dark:text-surface-700" />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/10 transition-all duration-300 flex items-center justify-center">
                    <span className="px-4 py-2 rounded-full bg-white/90 dark:bg-surface-900/90 text-sm font-bold text-brand-700 dark:text-brand-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg">
                      Use Template
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 truncate flex-1 leading-snug">{template.name}</h3>
                    {template.isBuiltIn && (
                      <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded">Built-in</span>
                    )}
                  </div>
                  <p className="text-[13px] text-surface-400 mt-1 line-clamp-2 leading-relaxed">{template.description}</p>
                  <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700/40">
                    <span className="text-[10px] text-surface-400 uppercase font-bold tracking-widest">{template.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'builtin' && (
          <div className="mt-10 p-5 section-card border-l-4 border-l-brand-500">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-1">Built-in Templates</h3>
                <p className="text-[13px] text-surface-500 dark:text-surface-400 leading-relaxed">
                  DocForgio ships with 16 professionally designed templates for PRDs, research papers, screenplays, legal documents, and more. Click any template to create a new document.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
