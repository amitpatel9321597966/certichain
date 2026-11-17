import React from 'react';
import { ShieldCheck, Search, Award, List, RotateCcw } from 'lucide-react';
import { blockchainService } from '../services/blockchain';

export default function Navbar({ activeTab, setActiveTab }) {
  const handleReset = async () => {
    if (confirm('Reset to initial sample records?')) {
      await blockchainService.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand / University Header */}
        <div 
          onClick={() => setActiveTab('verify')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              CertiChain
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
              Blockchain Certificate Verification System
            </p>
          </div>
        </div>

        {/* 3 Simple Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'verify'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Verify
          </button>

          <button
            onClick={() => setActiveTab('issue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'issue'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Issue
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'list'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            All Records
          </button>
        </nav>

        {/* Right side: Network status & Reset */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Blockchain Active</span>
          </div>

          <button
            onClick={handleReset}
            title="Reset to sample certificates"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
