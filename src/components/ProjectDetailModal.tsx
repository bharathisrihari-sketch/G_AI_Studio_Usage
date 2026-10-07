import React, { useState } from 'react';
import { 
  X, 
  Workflow, 
  Sliders, 
  Key, 
  Flame, 
  Database, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  PauseCircle, 
  CheckCircle2, 
  ChevronRight,
  TrendingDown,
  Layers,
  Search,
  Cpu,
  ExternalLink
} from 'lucide-react';
import { AIStudioProject, RequestTrace } from '../types/aiStudio';
import { formatCurrency, formatCompactNumber } from '../utils/pricingCalculator';

interface ProjectDetailModalProps {
  project: AIStudioProject;
  requestTraces: RequestTrace[];
  onClose: () => void;
  onUpdateProjectBudget: (projectId: string, newBudget: number, threshold: number, autoPause: boolean) => void;
  onToggleProjectPause: (projectId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  requestTraces,
  onClose,
  onUpdateProjectBudget,
  onToggleProjectPause
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'traces' | 'keys' | 'settings'>('overview');
  
  // Settings form state
  const [editBudget, setEditBudget] = useState(project.monthlyBudget);
  const [editThreshold, setEditThreshold] = useState(project.alertThresholdPercent);
  const [editAutoPause, setEditAutoPause] = useState(project.autoPauseOnBudgetBreach);
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  const projectTraces = requestTraces.filter(t => t.projectId === project.id);

  const percentSpent = Math.round((project.spendMTD / project.monthlyBudget) * 100);
  const rpmPercent = Math.round((project.peakRpm / project.quotaRpm) * 100);
  const tpmPercent = Math.round((project.peakTpm / project.quotaTpm) * 100);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectBudget(project.id, editBudget, editThreshold, editAutoPause);
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="bg-white border border-neutral-200 rounded shadow-xl w-full max-w-5xl my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                {project.name}
              </h2>
              {/* Status Indicator */}
              {project.status === 'healthy' && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy
                </span>
              )}
              {project.status === 'warning' && (
                <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> {percentSpent}% Budget
                </span>
              )}
              {project.status === 'throttled' && (
                <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> 429 Throttled
                </span>
              )}
              {project.status === 'paused' && (
                <span className="text-xs text-neutral-500 font-semibold flex items-center gap-1">
                  <PauseCircle className="w-3.5 h-3.5 text-neutral-400" /> Paused
                </span>
              )}
            </div>

            <div className="text-xs font-mono text-neutral-500 flex flex-wrap items-center gap-2 mt-1">
              <span>GCP: {project.gcpProjectId}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{project.environment}</span>
              <span aria-hidden="true">·</span>
              <span>Region: {project.region}</span>
              <span aria-hidden="true">·</span>
              <span>Last Used: <strong className="text-neutral-700">{project.lastUsedStatus || 'Active'}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Deployment: <strong className="text-neutral-700">{project.lastDeployedStatus || 'Deployed'}</strong></span>
            </div>

            {project.liveUrl && (
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 rounded text-blue-600 hover:text-blue-800 text-xs font-mono font-medium hover:bg-neutral-50"
                >
                  <span>{project.liveUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 bg-white border-b border-neutral-200 flex items-center gap-6 text-xs font-medium overflow-x-auto">
          {[
            { id: 'overview', label: 'End-to-End Overview' },
            { id: 'tools', label: 'Tools Budget Burn' },
            { id: 'traces', label: `Request Traces (${projectTraces.length})` },
            { id: 'keys', label: `API Keys (${project.apiKeys.length})` },
            { id: 'settings', label: 'Budget Caps & Limits' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 uppercase tracking-wider text-[11px] whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* 3 Metric Summary Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-neutral-500 text-[11px] block">Spend (Month to Date)</span>
                  <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                    {formatCurrency(project.spendMTD)}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    of {formatCurrency(project.monthlyBudget)} budget ({percentSpent}% consumed)
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percentSpent > 85 ? 'bg-rose-500' : percentSpent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, percentSpent)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-neutral-500 text-[11px] block">Burn Velocity</span>
                  <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                    {formatCurrency(project.dailyBurnRate)}/day
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Projected Month-End: {formatCurrency(project.projectedSpend)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    7-day moving average velocity
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-neutral-500 text-[11px] block">Token Volume & Cache Savings</span>
                  <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                    {formatCompactNumber(project.promptTokens + project.outputTokens)} tok
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    +{formatCurrency(project.cacheSavingsUSD)} saved via prompt caching
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Cached: {formatCompactNumber(project.cachedTokens)} tokens
                  </div>
                </div>
              </div>

              {/* Quota & Rate Limit Matrix */}
              <div className="p-4 bg-white rounded border border-neutral-200">
                <h3 className="font-bold text-neutral-900 mb-2">
                  AI Studio Rate Limit & Quota Headroom
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-600">RPM (Requests Per Minute)</span>
                      <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                        {project.peakRpm} / {project.quotaRpm} RPM ({rpmPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${rpmPercent > 80 ? 'bg-rose-500' : 'bg-neutral-800'}`}
                        style={{ width: `${Math.min(100, rpmPercent)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-600">TPM (Tokens Per Minute)</span>
                      <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                        {formatCompactNumber(project.peakTpm)} / {formatCompactNumber(project.quotaTpm)} TPM ({tpmPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${tpmPercent > 80 ? 'bg-rose-500' : 'bg-neutral-800'}`}
                        style={{ width: `${Math.min(100, tpmPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Models Breakdown Table */}
              <div className="bg-white rounded border border-neutral-200 overflow-hidden">
                <div className="p-3 bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-900">
                  Model Usage & Spend Breakdown
                </div>
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 text-[11px] text-neutral-500 border-b border-neutral-200 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Model</th>
                      <th className="py-2.5 px-3">Calls</th>
                      <th className="py-2.5 px-3">Input Tokens</th>
                      <th className="py-2.5 px-3">Output Tokens</th>
                      <th className="py-2.5 px-3">Cached</th>
                      <th className="py-2.5 px-3">Avg Latency</th>
                      <th className="py-2.5 px-3 text-right">Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {project.modelUsages.map(mu => (
                      <tr key={mu.modelId} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-semibold text-neutral-900">{mu.modelName}</td>
                        <td className="py-2.5 px-3 font-mono">{formatCompactNumber(mu.requestCount)}</td>
                        <td className="py-2.5 px-3 font-mono">{formatCompactNumber(mu.promptTokens)}</td>
                        <td className="py-2.5 px-3 font-mono">{formatCompactNumber(mu.outputTokens)}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">{formatCompactNumber(mu.cachedTokens)}</td>
                        <td className="py-2.5 px-3 font-mono">{mu.avgLatencyMs}ms</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">{formatCurrency(mu.spend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: TOOLS BUDGET BURN */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded p-4">
                <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                  <Flame className="w-4 h-4 text-amber-600" />
                  Budget Burn Attribution for {project.name}
                </div>
                <p className="text-amber-950 text-xs">
                  {project.notes}
                </p>
              </div>

              <div className="space-y-3">
                {project.topToolsBurn.map((tb, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase font-semibold text-neutral-500">
                        Rank 0{idx + 1} Burner
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 mt-0.5 capitalize">
                        {tb.tool.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Consumes {tb.sharePercent}% of this project's total monthly spend.
                      </p>
                    </div>

                    <div className="text-right sm:border-l sm:border-neutral-200 sm:pl-6 shrink-0">
                      <div className="text-xs text-neutral-500">Total Tool Burn</div>
                      <div className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                        {formatCurrency(tb.spend)}
                      </div>
                      <div className="text-[11px] font-mono text-amber-700 font-semibold">
                        {tb.sharePercent}% of project spend
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REQUEST TRACES */}
          {activeTab === 'traces' && (
            <div className="space-y-3">
              <div className="text-neutral-500 text-xs">
                End-to-end request audit logs matching this project in Google AI Studio.
              </div>

              {projectTraces.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 bg-neutral-50 border border-neutral-200 rounded">
                  No recent request traces captured for this project.
                </div>
              ) : (
                <div className="space-y-2">
                  {projectTraces.map(trace => (
                    <div key={trace.id} className="p-3 bg-neutral-50 rounded border border-neutral-200 hover:bg-white transition-colors font-mono text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-200">
                        <div className="flex items-center gap-2">
                          <span className={trace.statusCode === 200 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                            {trace.statusCode} {trace.statusCode === 200 ? 'OK' : 'RESOURCE_EXHAUSTED'}
                          </span>
                          <span className="text-neutral-400">·</span>
                          <span className="text-neutral-800">{trace.endpoint}</span>
                        </div>
                        <div className="text-neutral-500 text-[11px]">
                          {trace.timestamp} · {trace.latencyMs}ms
                        </div>
                      </div>

                      <div className="text-neutral-700 font-sans text-xs mb-2">
                        {trace.promptPreview}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/50">
                        <div className="flex items-center gap-2">
                          <span>In: {trace.inputTokens.toLocaleString()} tok</span>
                          <span aria-hidden="true">·</span>
                          <span>Out: {trace.outputTokens.toLocaleString()} tok</span>
                          {trace.cachedTokens > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-700">Cached: {trace.cachedTokens.toLocaleString()} tok</span>
                            </>
                          )}
                        </div>
                        <div className="font-bold text-neutral-900">
                          Cost: ${trace.totalCost.toFixed(5)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: API KEYS */}
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">
                  API Keys authorized for Google AI Studio gateway requests under this project.
                </span>
                <span className="text-neutral-600 font-mono text-[11px]">
                  Enforce IP Restrictions
                </span>
              </div>

              <div className="space-y-2">
                {project.apiKeys.map(key => (
                  <div key={key.id} className="p-3 bg-white rounded border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="font-bold text-neutral-900">{key.name}</span>
                        <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                        </span>
                      </div>
                      <div className="font-mono text-neutral-500 text-[11px] mt-0.5">
                        Key: {key.keyPrefix} · Created {key.createdDate} · Last active {key.lastUsed}
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-neutral-600 shrink-0">
                      <div>Rate Limit: {key.rateLimitRpm} RPM</div>
                      <div className="text-neutral-400">
                        IP: {key.allowedIps || 'Unrestricted (0.0.0.0/0)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BUDGET CONTROLS & AUTOMATION */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveBudget} className="space-y-4 max-w-xl">
              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Monthly Spend Budget ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">$</span>
                  <input
                    type="number"
                    step="10"
                    min="10"
                    max="10000"
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-neutral-200 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  Current spend: {formatCurrency(project.spendMTD)} ({Math.round((project.spendMTD / editBudget) * 100)}% of new budget)
                </span>
              </div>

              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Alert Trigger Threshold ({editThreshold}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(Number(e.target.value))}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-neutral-400 mt-0.5">
                  <span>50%</span>
                  <span>Trigger email alert to bharathi.srihari@gmail.com at {editThreshold}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAutoPause}
                    onChange={(e) => setEditAutoPause(e.target.checked)}
                    className="mt-0.5 accent-neutral-900 rounded"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block">
                      Auto-Pause Project Traffic on Budget Breach
                    </span>
                    <span className="text-neutral-500 text-[11px]">
                      Temporarily reject new API requests with HTTP 429 once spend exceeds 100% of monthly budget to prevent unexpected runaway billing.
                    </span>
                  </div>
                </label>
              </div>

              {/* Pause / Resume action */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-neutral-900">Traffic Gate Status</div>
                  <div className="text-[11px] text-neutral-500">
                    Currently: {project.status === 'paused' ? 'Paused (Traffic blocked)' : 'Active (Routing requests)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleProjectPause(project.id)}
                  className={`px-3 py-1.5 rounded font-medium text-xs transition-colors ${
                    project.status === 'paused'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {project.status === 'paused' ? 'Resume Traffic' : 'Pause All Traffic'}
                </button>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded font-medium text-xs hover:bg-neutral-800 transition-colors"
                >
                  Save Budget Policy
                </button>
                {savedSettingsMsg && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Budget settings saved to Cloud Billing.
                  </span>
                )}
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <div>
            GCP Project: <span className="font-mono text-neutral-700">{project.gcpProjectId}</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-neutral-200 rounded text-neutral-700 hover:bg-neutral-100 transition-colors font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
