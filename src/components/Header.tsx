import React from 'react';
import { Plus, Download, Radio, ShieldCheck, RefreshCw, Activity, TrendingUp } from 'lucide-react';

export type TabType = 'overview' | 'trends' | 'anomalies' | 'tool-burn' | 'end-to-end' | 'audit-logs';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userEmail: string;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onOpenAddProject: () => void;
  onExportReport: () => void;
  activeAnomaliesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userEmail,
  isSimulating,
  setIsSimulating,
  onOpenAddProject,
  onExportReport,
  activeAnomaliesCount = 3
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      {/* Top Bar: Exactly 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
            className="text-base font-bold tracking-tight text-neutral-900 flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            Google AI Studio Console
          </a>
          <span className="hidden md:inline text-xs text-neutral-400">/</span>
          <span className="hidden md:inline text-xs font-medium text-neutral-500">
            FinOps & Project Tracker
          </span>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors pb-1 border-b-2 text-xs uppercase tracking-wider ${
              activeTab === 'overview'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Projects & Spend
          </button>
          
          {/* New Trends Tab */}
          <button
            onClick={() => setActiveTab('trends')}
            className={`transition-colors pb-1 border-b-2 text-xs uppercase tracking-wider flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>30D Trends</span>
          </button>

          {/* New Anomalies Tab */}
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`transition-colors pb-1 border-b-2 text-xs uppercase tracking-wider flex items-center gap-1.5 ${
              activeTab === 'anomalies'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-600" />
            <span>Anomalies</span>
            {activeAnomaliesCount > 0 && (
              <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200">
                {activeAnomaliesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tool-burn')}
            className={`transition-colors pb-1 border-b-2 text-xs uppercase tracking-wider flex items-center gap-1.5 ${
              activeTab === 'tool-burn'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Tool Burn</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="High burn detected"></span>
          </button>

          <button
            onClick={() => setActiveTab('end-to-end')}
            className={`transition-colors pb-1 border-b-2 text-xs uppercase tracking-wider ${
              activeTab === 'end-to-end'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            End-to-End
          </button>

          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`transition-colors pb-1 border-b-2 text-xs uppercase tracking-wider ${
              activeTab === 'audit-logs'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Audit Logs
          </button>
        </nav>

        {/* Zone 3: Account info and Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Live Traffic simulation toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 ${
              isSimulating
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
            title="Simulate live API request traffic and anomaly detection"
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-600 animate-pulse' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">{isSimulating ? 'Feed: On' : 'Feed: Paused'}</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onExportReport}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
            title="Export FinOps & Billing CSV Reconciliation"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Add Project Primary CTA */}
          <button
            onClick={onOpenAddProject}
            className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>

          {/* User Account Avatar / Email */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-neutral-200 text-xs text-neutral-600">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
              B
            </span>
            <span className="font-mono text-neutral-700 truncate max-w-[140px]" title={userEmail}>
              {userEmail}
            </span>
          </div>

        </div>

      </div>

      {/* Mobile Nav strip */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 bg-neutral-50 border-t border-neutral-200 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${activeTab === 'overview' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
        >
          Projects & Spend
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${activeTab === 'trends' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
        >
          30D Trends
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${activeTab === 'anomalies' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
        >
          Anomalies ({activeAnomaliesCount})
        </button>
        <button
          onClick={() => setActiveTab('tool-burn')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${activeTab === 'tool-burn' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
        >
          Tool Burn
        </button>
        <button
          onClick={() => setActiveTab('end-to-end')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${activeTab === 'end-to-end' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
        >
          End-to-End
        </button>
        <button
          onClick={() => setActiveTab('audit-logs')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${activeTab === 'audit-logs' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
        >
          Audit Logs
        </button>
      </div>
    </header>
  );
};
