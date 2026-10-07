import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Sliders, ExternalLink, ShieldCheck, AlertTriangle, ShieldAlert, PauseCircle } from 'lucide-react';
import { AIStudioProject, Environment, ProjectStatus } from '../types/aiStudio';
import { formatCurrency, formatCompactNumber } from '../utils/pricingCalculator';

interface ProjectsTableProps {
  projects: AIStudioProject[];
  onSelectProject: (projectId: string) => void;
  onOpenEditBudget: (project: AIStudioProject) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onSelectProject,
  onOpenEditBudget
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<'all' | Environment>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | ProjectStatus>('all');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.gcpProjectId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEnv = selectedEnv === 'all' || p.environment === selectedEnv;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesEnv && matchesStatus;
  });

  return (
    <div className="bg-white border border-neutral-200 rounded">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Google AI Studio Projects Directory
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Active projects, monthly spend trajectory, quota headroom, and top budget-burning tools.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search project or GCP ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900 w-48 sm:w-60"
            />
          </div>

          {/* Environment segmented filter */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded border border-neutral-200 text-xs">
            {(['all', 'production', 'staging', 'research'] as const).map(env => (
              <button
                key={env}
                onClick={() => setSelectedEnv(env)}
                className={`px-2.5 py-1 rounded text-xs capitalize transition-colors font-medium ${
                  selectedEnv === env
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {env}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded bg-white text-neutral-700 focus:outline-none focus:border-neutral-900"
          >
            <option value="all">All Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Budget Warning</option>
            <option value="throttled">Quota Throttled (429)</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Project & Environment</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Spend MTD / Budget</th>
              <th className="py-3 px-4">Daily Burn & EOM</th>
              <th className="py-3 px-4">Usage & Tokens</th>
              <th className="py-3 px-4">Quota Peak</th>
              <th className="py-3 px-4">Top Budget Burning Tools</th>
              <th className="py-3 px-4 text-right">End-to-End View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-xs text-neutral-500">
                  No Google AI Studio projects found matching filters.
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => {
                const percentSpent = Math.round((p.spendMTD / p.monthlyBudget) * 100);
                const rpmPercent = Math.round((p.peakRpm / p.quotaRpm) * 100);
                const tpmPercent = Math.round((p.peakTpm / p.quotaTpm) * 100);

                return (
                  <tr 
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Project & Environment */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </div>
                      <div className="font-mono text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <span>{p.gcpProjectId}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{p.environment}</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.region}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {p.status === 'healthy' && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Healthy
                        </span>
                      )}
                      {p.status === 'warning' && (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {percentSpent}% Budget
                        </span>
                      )}
                      {p.status === 'throttled' && (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          429 Throttled
                        </span>
                      )}
                      {p.status === 'paused' && (
                        <span className="inline-flex items-center gap-1.5 text-neutral-500 font-medium">
                          <PauseCircle className="w-3.5 h-3.5 text-neutral-400" />
                          Paused
                        </span>
                      )}
                    </td>

                    {/* Spend MTD / Budget */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-1">
                        <span className="font-bold text-neutral-900">{formatCurrency(p.spendMTD)}</span>
                        <span className="text-neutral-500">/ {formatCurrency(p.monthlyBudget)}</span>
                      </div>
                      {/* Budget progress bar */}
                      <div className="w-32 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            percentSpent > 85 ? 'bg-rose-500' : percentSpent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percentSpent)}%` }}
                        />
                      </div>
                    </td>

                    {/* Daily Burn & EOM */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono tabular-nums font-semibold text-neutral-900">
                        {formatCurrency(p.dailyBurnRate)}/day
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                        Proj: {formatCurrency(p.projectedSpend)}
                      </div>
                    </td>

                    {/* Usage & Tokens */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono tabular-nums text-neutral-900">
                        {formatCompactNumber(p.totalRequests)} calls
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                        {formatCompactNumber(p.promptTokens + p.outputTokens)} tok
                        {p.cacheSavingsUSD > 0 && (
                          <span className="text-emerald-700 ml-1 font-medium">
                            (-{formatCurrency(p.cacheSavingsUSD)})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quota Peak */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums">
                      <div className="text-neutral-800">
                        RPM: <span className={rpmPercent > 80 ? 'text-rose-600 font-bold' : ''}>{p.peakRpm}</span>
                        <span className="text-neutral-400">/{p.quotaRpm}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        TPM: <span className={tpmPercent > 80 ? 'text-rose-600 font-bold' : ''}>{formatCompactNumber(p.peakTpm)}</span>
                        <span className="text-neutral-400">/{formatCompactNumber(p.quotaTpm)}</span>
                      </div>
                    </td>

                    {/* Top Budget Burning Tools */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-[200px]">
                        {p.topToolsBurn.slice(0, 2).map((tb, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="truncate text-neutral-600 font-medium mr-1.5" title={tb.tool.replace(/_/g, ' ')}>
                              {tb.tool === 'google_search_grounding' && 'Search Grounding'}
                              {tb.tool === 'function_calling_loop' && 'Agent Tool Loop'}
                              {tb.tool === 'code_execution' && 'Python Sandbox'}
                              {tb.tool === 'multimodal_video_ingest' && 'Video Frame Ingest'}
                              {tb.tool === 'uncached_context_expansion' && 'Uncached Context'}
                              {tb.tool === 'live_audio_bidirectional' && 'Live Audio Stream'}
                              {tb.tool === 'imagen_generation' && 'Imagen 3'}
                              {tb.tool === 'multimodal_image_ingest' && 'Image Ingest'}
                            </span>
                            <span className="font-mono tabular-nums font-semibold text-neutral-800 shrink-0">
                              {formatCurrency(tb.spend)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenEditBudget(p)}
                          className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
                          title="Configure Budget & Caps"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectProject(p.id)}
                          className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded transition-colors flex items-center gap-1"
                        >
                          <span>End-to-End</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer Summary */}
      <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Showing {filteredProjects.length} of {projects.length} AI Studio projects</span>
          <span aria-hidden="true">·</span>
          <span>Linked to GCP Billing Account: 018F42-99B72C-AA4190</span>
        </div>
        <div className="text-neutral-400 text-[11px]">
          Click any project row to view full End-to-End Traces, Model Breakdown, and API Keys
        </div>
      </div>
    </div>
  );
};
