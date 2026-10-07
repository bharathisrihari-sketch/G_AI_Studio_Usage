import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  ArrowUpRight, 
  Zap, 
  Sliders,
  Filter
} from 'lucide-react';
import { AnomalyEvent, AIStudioProject } from '../types/aiStudio';
import { formatCurrency } from '../utils/pricingCalculator';

interface AnomalyDetectionPanelProps {
  anomalies: AnomalyEvent[];
  projects: AIStudioProject[];
  onSelectProject: (projectId: string) => void;
  onResolveAnomaly: (anomalyId: string) => void;
}

export const AnomalyDetectionPanel: React.FC<AnomalyDetectionPanelProps> = ({
  anomalies,
  projects,
  onSelectProject,
  onResolveAnomaly
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'moderate'>('all');
  const [mitigationFeedback, setMitigationFeedback] = useState<string | null>(null);

  const filteredAnomalies = anomalies.filter(a => {
    return selectedSeverity === 'all' || a.severity === selectedSeverity;
  });

  const handleApplyMitigation = (anomaly: AnomalyEvent) => {
    onResolveAnomaly(anomaly.id);
    setMitigationFeedback(`Mitigation applied for "${anomaly.projectName}". Quota guardrails and backoff rules engaged.`);
    setTimeout(() => setMitigationFeedback(null), 4000);
  };

  const activeCount = anomalies.filter(a => !a.isResolved).length;

  return (
    <div className="bg-white border border-neutral-200 rounded p-4 sm:p-5 mb-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-50 text-rose-700">
              <Activity className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Real-Time AI Studio Anomaly Detection
            </h3>
            {activeCount > 0 && (
              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {activeCount} Active Spikes
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time heuristic & statistical monitor scanning incoming request traces for uncharacteristic spend spikes, runaway tool loops, and 429 error clusters.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-neutral-500 text-[11px] font-medium mr-1">Severity:</span>
          {(['all', 'critical', 'high', 'moderate'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded capitalize font-medium text-xs transition-colors ${
                selectedSeverity === sev
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {mitigationFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{mitigationFeedback}</span>
          </div>
        </div>
      )}

      {/* List of Anomalies */}
      {filteredAnomalies.length === 0 ? (
        <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded border border-neutral-100 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>No uncharacteristic spend or error rate spikes detected in recent request telemetry.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnomalies.map((anom) => {
            return (
              <div
                key={anom.id}
                className={`p-4 rounded border transition-all text-xs ${
                  anom.severity === 'critical'
                    ? 'border-rose-300 bg-rose-50/40'
                    : anom.severity === 'high'
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-neutral-200 bg-neutral-50/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2">
                  <div className="flex items-start sm:items-center gap-2.5">
                    {anom.type === 'spend_spike' && (
                      <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                    )}
                    {anom.type === 'error_rate_surge' && (
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    )}
                    {anom.type === 'tool_runaway' && (
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm">
                          {anom.headline}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500">
                          on <strong>{anom.projectName}</strong>
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Detected: {anom.detectedAt} · Deviation: <strong className="font-mono text-rose-700">+{anom.deviationPercent}%</strong> vs 7-day baseline
                      </div>
                    </div>
                  </div>

                  {/* Quantitative Metric Strip */}
                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded border border-neutral-200 font-mono text-[11px] shrink-0 self-start lg:self-auto">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">CURRENT</span>
                      <span className="font-bold text-rose-700">{anom.metricCurrent}</span>
                    </div>
                    <div className="h-6 w-px bg-neutral-200"></div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">BASELINE</span>
                      <span className="text-neutral-600">{anom.metricBaseline}</span>
                    </div>
                  </div>
                </div>

                <p className="text-neutral-700 text-xs mb-3 leading-relaxed">
                  {anom.description}
                </p>

                {/* Suggested Action & Buttons */}
                <div className="pt-2.5 border-t border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] text-neutral-600 flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-800">Recommended Mitigation:</span>
                    <span>{anom.suggestedAction}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectProject(anom.projectId)}
                      className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50 transition-colors flex items-center gap-1"
                    >
                      <span>Investigate Project</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleApplyMitigation(anom)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Apply Mitigation</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
