import React from 'react';
import { Target, X } from 'lucide-react';
import SidebarContent from './SidebarContent.jsx';

export default function MobileSidebar({ open, onClose, ...contentProps }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-[85vw] max-w-xs sm:w-72 md:hidden flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Your Numbers"
      >
        <div className="h-full flex flex-col bg-white dark:bg-[#0c1428] border-r border-slate-200 dark:border-slate-700/40 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700/40 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">Your Numbers</h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <SidebarContent {...contentProps} />
        </div>
      </div>
    </>
  );
}
