import { useState } from 'react';
import { useEditorStore } from '../../stores';
import { RefreshCw, AlertCircle } from 'lucide-react';

type Tab = 'html' | 'css' | 'head';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'html', label: 'HTML', icon: '<>' },
  { id: 'css', label: 'CSS', icon: '#' },
  { id: 'head', label: 'Head', icon: '/' },
];

export function CodeEditor() {
  const { htmlSource, cssSource, headSource, setHtmlSource, setCssSource, setHeadSource, syncCodeToBlocks, codeSynced } = useEditorStore();
  const [activeTab, setActiveTab] = useState<Tab>('html');
  const [showSyncWarning, setShowSyncWarning] = useState(false);

  const getValue = () => {
    switch (activeTab) {
      case 'html': return htmlSource;
      case 'css': return cssSource;
      case 'head': return headSource;
    }
  };

  const handleChange = (value: string) => {
    switch (activeTab) {
      case 'html': setHtmlSource(value); break;
      case 'css': setCssSource(value); break;
      case 'head': setHeadSource(value); break;
    }
  };

  const handleSyncToVisual = () => {
    if (!codeSynced) {
      setShowSyncWarning(true);
    } else {
      syncCodeToBlocks();
    }
  };

  const confirmSync = () => {
    setShowSyncWarning(false);
    syncCodeToBlocks();
  };

  const value = getValue();
  const lineCount = value ? value.split('\n').length : 1;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-surface-700/50 bg-surface-800/80 px-2">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-white border-brand-500 bg-surface-900/60'
                  : 'text-surface-400 border-transparent hover:text-surface-200 hover:bg-surface-700/30'
              }`}
            >
              <span className="font-mono text-[11px] opacity-60">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={handleSyncToVisual}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-all"
            title="Sync code changes back to Visual mode blocks"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync to Visual
          </button>
        </div>
      </div>

      {/* Sync warning modal */}
      {showSyncWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-800 border border-surface-600 rounded-xl p-5 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Sync to Visual Mode</h3>
            </div>
            <p className="text-xs text-surface-300 mb-4">
              This will parse your HTML and replace all current visual blocks. Unsaved block-level changes will be lost. Continue?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSyncWarning(false)}
                className="px-3 py-1.5 text-xs font-semibold text-surface-300 hover:text-white rounded-lg hover:bg-surface-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSync}
                className="px-3 py-1.5 text-xs font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all"
              >
                Sync Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor area with line numbers */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* Line number gutter */}
        <div className="w-12 shrink-0 bg-surface-900/80 border-r border-surface-700/30 overflow-hidden select-none">
          <div className="pt-5 pr-2 text-right font-mono text-[11px] leading-relaxed text-surface-600">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="h-[1.625rem]">{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          key={activeTab}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 h-full p-5 pl-3 font-mono text-sm bg-surface-900 text-surface-100 outline-none resize-none leading-relaxed placeholder-surface-600"
          placeholder={
            activeTab === 'html'
              ? '<!-- Write your HTML content here -->'
              : activeTab === 'css'
              ? '/* Write your CSS styles here */'
              : '<!-- Add meta tags, fonts, scripts here -->'
          }
          spellCheck={false}
        />
      </div>
    </div>
  );
}
