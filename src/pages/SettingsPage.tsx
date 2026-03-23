import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Monitor, Code, Type, Trash2, RotateCcw, Palette, Sliders, Download, FileText } from 'lucide-react';
import { useSettingsStore, useTemplateStore } from '../stores';
import type { PageSize } from '../types';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, defaultMode, autoSaveInterval, defaultPageSize, defaultOrientation, communityEnabled, updateSetting, resetSettings } = useSettingsStore();
  const { userTemplates, deleteTemplate } = useTemplateStore();
  const [activeTab, setActiveTab] = useState<'general' | 'editor' | 'export' | 'templates'>('general');

  const handleReset = async () => {
    if (confirm('Reset all settings to default?')) await resetSettings();
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Palette, count: undefined },
    { id: 'editor' as const, label: 'Editor', icon: Sliders, count: undefined },
    { id: 'export' as const, label: 'Export', icon: Download, count: undefined },
    { id: 'templates' as const, label: 'Templates', icon: FileText, count: userTemplates.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 pt-5">
        <div className="max-w-5xl mx-auto glass-strong rounded-2xl px-5 py-3.5 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-surface-100/60 dark:hover:bg-surface-700/60 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-all">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <h1 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">Settings</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar nav */}
          <nav className="w-52 shrink-0 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-500/10 text-brand-700 dark:text-brand-400 shadow-sm'
                      : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100/60 dark:hover:bg-surface-800/60 hover:text-surface-700 dark:hover:text-surface-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-auto text-[11px] font-bold bg-surface-200/60 dark:bg-surface-700/60 text-surface-500 dark:text-surface-400 px-1.5 py-0.5 rounded-md">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 section-card p-6">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">General</h2>
                  <p className="text-[13px] text-surface-400 mt-0.5">Customize the look and feel of your workspace.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="form-label">Theme</label>
                    <div className="segment-group">
                      {([['light', Sun], ['dark', Moon], ['system', Monitor]] as const).map(([mode, Icon]) => (
                        <button key={mode} onClick={() => updateSetting('theme', mode)} className={`segment-item flex items-center gap-2 capitalize ${theme === mode ? 'active' : ''}`}>
                          <Icon className="w-4 h-4" /> {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="divider" />

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={communityEnabled} onChange={(e) => updateSetting('communityEnabled', e.target.checked)} className="input-checkbox" />
                      <div>
                        <span className="text-sm font-semibold text-surface-800 dark:text-surface-200 group-hover:text-surface-900 dark:group-hover:text-surface-100 transition-colors">Community templates</span>
                        <p className="text-[13px] text-surface-400">Fetch templates shared by the open-source community via GitHub</p>
                      </div>
                    </label>
                  </div>

                  <hr className="divider" />

                  <div>
                    <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <RotateCcw className="w-4 h-4" /> Reset All Settings
                    </button>
                    <p className="form-hint mt-1">This will restore all preferences to their default values.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">Editor</h2>
                  <p className="text-[13px] text-surface-400 mt-0.5">Configure editor behavior and defaults.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="form-label">Default Mode</label>
                    <div className="segment-group">
                      {([['nocode', Type], ['code', Code]] as const).map(([mode, Icon]) => (
                        <button key={mode} onClick={() => updateSetting('defaultMode', mode)} className={`segment-item flex items-center gap-2 ${defaultMode === mode ? 'active' : ''}`}>
                          <Icon className="w-4 h-4" /> {mode === 'nocode' ? 'Visual' : 'Code'}
                        </button>
                      ))}
                    </div>
                    <p className="form-hint">The editing mode new documents open in by default.</p>
                  </div>

                  <hr className="divider" />

                  <div>
                    <label className="form-label">Auto-save Interval</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={autoSaveInterval}
                        onChange={(e) => updateSetting('autoSaveInterval', Number(e.target.value))}
                        className="input-field w-32"
                        min={100}
                        max={5000}
                        step={100}
                      />
                      <span className="text-sm text-surface-400">milliseconds</span>
                    </div>
                    <p className="form-hint">How often your work is saved automatically (100 – 5000ms).</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">Export</h2>
                  <p className="text-[13px] text-surface-400 mt-0.5">Set default values for PDF and other exports.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="form-label">Default Page Size</label>
                    <select value={defaultPageSize} onChange={(e) => updateSetting('defaultPageSize', e.target.value as PageSize)} className="input-select w-48">
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                      <option value="Tabloid">Tabloid</option>
                    </select>
                  </div>

                  <hr className="divider" />

                  <div>
                    <label className="form-label">Orientation</label>
                    <div className="segment-group">
                      {['portrait', 'landscape'].map(o => (
                        <button key={o} onClick={() => updateSetting('defaultOrientation', o as 'portrait' | 'landscape')} className={`segment-item capitalize ${defaultOrientation === o ? 'active' : ''}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-100">User Templates</h2>
                  <p className="text-[13px] text-surface-400 mt-0.5">Templates you have created and saved.</p>
                </div>

                {userTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-surface-50/50 dark:bg-surface-900/30 border border-dashed border-surface-200 dark:border-surface-700 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-surface-600 dark:text-surface-300">No user templates yet</p>
                    <p className="text-[13px] text-surface-400 mt-1">Create a document and save it as a template to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3 stagger-children">
                    {userTemplates.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-4 section-card">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{t.name}</h3>
                          {t.description && <p className="text-[13px] text-surface-400 mt-0.5 truncate">{t.description}</p>}
                          <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700/60 text-[10px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t.category}</span>
                        </div>
                        <button onClick={() => deleteTemplate(t.id)} className="ml-4 p-2 rounded-xl text-surface-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
