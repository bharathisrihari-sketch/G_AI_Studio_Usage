import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, CheckCircle2, ChevronRight, Clock, DollarSign, Layers } from 'lucide-react';
import { RequestTrace, AIStudioProject } from '../types/aiStudio';
import { formatCurrency } from '../utils/pricingCalculator';

interface AuditLogsViewProps {
  traces: RequestTrace[];
  projects: AIStudioProject[];
  onSelectProject: (projectId: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  traces,
  projects,
  onSelectProject
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | '200' | '429'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedTrace, setSelectedTrace] = useState<RequestTrace | null>(traces[0] || null);

  const filteredTraces = traces.filter(t => {
    const matchesStatus = statusFilter === 'all' || String(t.statusCode) === statusFilter;
    const matchesProject = projectFilter === 'all' || t.projectId === projectFilter;
    return matchesStatus && matchesProject;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-white border border-neutral-200 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            End-to-End Request Traces & Audit Ledger
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time telemetry showing each API request, latency, token consumption, tools invoked, and exact dollar cost.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-neutral-200 rounded px-2.5 py-1.5 bg-white text-neutral-700"
          >
            <option value="all">All Status Codes</option>
            <option value="200">200 OK (Success)</option>
            <option value="429">429 Throttled (Quota)</option>
          </select>

          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border border-neutral-200 rounded px-2.5 py-1.5 bg-white text-neutral-700"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-column Layout: Trace list on left, Trace detail drawer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left column: List of Traces */}
        <div className="lg:col-span-7 space-y-2">
          {filteredTraces.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 bg-white border border-neutral-200 rounded text-xs">
              No request traces found matching filter.
            </div>
          ) : (
            filteredTraces.map((trace) => {
              const isSelected = selectedTrace?.id === trace.id;

              return (
                <div
                  key={trace.id}
                  onClick={() => setSelectedTrace(trace)}
                  className={`p-3.5 rounded border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white border-neutral-200 hover:border-neutral-400 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-[11px] ${
                        trace.statusCode === 200 
                          ? isSelected ? 'text-emerald-300' : 'text-emerald-700'
                          : isSelected ? 'text-rose-300' : 'text-rose-600'
                      }`}>
                        {trace.statusCode}
                      </span>
                      <span className={`font-semibold ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                        {trace.projectName}
                      </span>
                    </div>

                    <div className={`font-mono text-[11px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {trace.latencyMs}ms · {trace.timestamp.split(' ')[1]}
                    </div>
                  </div>

                  <p className={`line-clamp-1 mb-2 font-mono text-[11px] ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    {trace.promptPreview}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-neutral-200/40">
                    <div className="flex items-center gap-2">
                      <span className={isSelected ? 'text-neutral-300' : 'text-neutral-500'}>
                        {trace.model}
                      </span>
                      {trace.cacheHit && (
                        <span className={`font-semibold ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          Cache Hit
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-bold">
                      <span className={isSelected ? 'text-emerald-300' : 'text-neutral-900'}>
                        ${trace.totalCost.toFixed(5)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Trace Detail Inspector */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded p-4 text-xs h-fit sticky top-20">
          {selectedTrace ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] text-neutral-400 block">{selectedTrace.id}</span>
                  <h3 className="font-bold text-neutral-900 text-sm mt-0.5">
                    Request Anatomy & Cost Ledger
                  </h3>
                </div>
                <button
                  onClick={() => onSelectProject(selectedTrace.projectId)}
                  className="text-[11px] text-neutral-700 hover:text-neutral-900 underline font-medium"
                >
                  View Project
                </button>
              </div>

              {/* Status & Timing */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 p-3 rounded border border-neutral-100 font-mono">
                <div>
                  <span className="text-neutral-500 text-[10px] block">HTTP Status</span>
                  <span className={`font-bold ${selectedTrace.statusCode === 200 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {selectedTrace.statusCode} {selectedTrace.statusCode === 200 ? 'OK' : 'RESOURCE_EXHAUSTED'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">End-to-End Latency</span>
                  <span className="font-bold text-neutral-800">{selectedTrace.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Timestamp</span>
                  <span className="text-neutral-800">{selectedTrace.timestamp}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Endpoint</span>
                  <span className="text-neutral-800 truncate block">{selectedTrace.endpoint}</span>
                </div>
              </div>

              {/* Token Ledger */}
              <div>
                <span className="font-semibold text-neutral-800 block mb-1">
                  Token Accounting
                </span>
                <div className="space-y-1.5 bg-neutral-50 p-3 rounded border border-neutral-100 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Prompt Tokens</span>
                    <span className="font-bold text-neutral-900">{selectedTrace.inputTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Output Tokens</span>
                    <span className="font-bold text-neutral-900">{selectedTrace.outputTokens.toLocaleString()}</span>
                  </div>
                  {selectedTrace.cachedTokens > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Cached Input Tokens</span>
                      <span>{selectedTrace.cachedTokens.toLocaleString()} (75% off)</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-neutral-200 flex justify-between font-bold text-neutral-900">
                    <span>Total Effective Tokens</span>
                    <span>{(selectedTrace.inputTokens + selectedTrace.outputTokens).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Tools Invoked */}
              <div>
                <span className="font-semibold text-neutral-800 block mb-1">
                  Tools & Grounding Executed
                </span>
                <div className="space-y-1">
                  {selectedTrace.toolsUsed.length === 0 ? (
                    <div className="text-neutral-500 text-[11px]">No tools invoked. Raw model inference.</div>
                  ) : (
                    selectedTrace.toolsUsed.map((tool, idx) => (
                      <div key={idx} className="p-2 rounded bg-amber-50/70 border border-amber-200 text-amber-950 flex items-center justify-between text-[11px]">
                        <span className="font-medium capitalize">{tool.replace(/_/g, ' ')}</span>
                        <span className="font-mono text-amber-900 font-bold">
                          {tool === 'google_search_grounding' ? '+$0.035 fee' : '+$0.005 fee'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Prompt Excerpt */}
              <div>
                <span className="font-semibold text-neutral-800 block mb-1">
                  Prompt Payload Excerpt
                </span>
                <div className="bg-neutral-900 text-neutral-200 p-3 rounded font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto">
                  {selectedTrace.promptPreview}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-neutral-400">
              Select a trace from the left to inspect payload.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
