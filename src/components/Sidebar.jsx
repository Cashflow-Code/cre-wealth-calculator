import React from 'react';
import { Target, PanelLeftClose } from 'lucide-react';
import SidebarContent from './SidebarContent.jsx';

export default function Sidebar({ onClose, ...contentProps }) {
  return (
    // w-72 + flex-shrink-0: width never changes regardless of content
    <aside className="hidden md:block w-72 flex-shrink-0">
      <div className="sticky top-4" style={{ height: 'calc(100vh - 2rem)' }}>
        <div className="h-full flex flex-col rounded-2xl bg-white dark:bg-[#0c1428] border border-slate-200 dark:border-slate-700/40 shadow-2xl overflow-hidden">

          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700/40 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">Your Numbers</h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Hide panel"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <SidebarContent {...contentProps} />
        </div>
      </div>
    </aside>
  );
}
