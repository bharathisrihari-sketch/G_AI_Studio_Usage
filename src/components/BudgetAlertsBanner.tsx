import React from 'react';
import { AlertTriangle, Flame, ShieldAlert, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AIStudioProject } from '../types/aiStudio';

interface BudgetAlertsBannerProps {
  projects: AIStudioProject[];
  onSelectProject: (projectId: string) => void;
  onNavigateToTools: () => void;
}

export const BudgetAlertsBanner: React.FC<BudgetAlertsBannerProps> = ({
  projects,
  onSelectProject,
  onNavigateToTools
}) => {
  const warningProjects = projects.filter(p => p.status === 'warning');
  const throttledProjects = projects.filter(p => p.status === 'throttled');

  if (warningProjects.length === 0 && throttledProjects.length === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200 rounded p-3 mb-6 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All AI Studio projects are operating within safe budget caps and nominal RPM/TPM quota thresholds.</span>
        </div>
        <span className="font-mono text-emerald-700">6 Projects Nominal</span>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-2">
      {/* Throttled Quota alert */}
      {throttledProjects.map(p => (
        <div 
          key={p.id}
          className="bg-rose-50 border border-rose-200 rounded p-3 text-xs text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold text-rose-900">Quota Throttling Detected (429 Rate Limits):</span>{' '}
              <span className="font-medium text-rose-800">{p.name}</span>{' '}
              <span className="text-rose-700">breached TPM quota ({p.peakTpm.toLocaleString()} peak vs {p.quotaTpm.toLocaleString()} ceiling). Uncompressed video frame streaming dropped requests.</span>
            </div>
          </div>
          <button
            onClick={() => onSelectProject(p.id)}
            className="shrink-0 text-rose-700 font-semibold hover:text-rose-900 inline-flex items-center gap-1 hover:underline"
          >
            Inspect End-to-End Trace <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* High Budget Burn / Grounding Alert */}
      {warningProjects.map(p => {
        const topBurnTool = p.topToolsBurn[0];
        const percentBudget = Math.round((p.spendMTD / p.monthlyBudget) * 100);

        return (
          <div 
            key={p.id}
            className="bg-amber-50/80 border border-amber-200 rounded p-3 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5">
              <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-semibold text-amber-900">Budget Warning ({percentBudget}% Spent):</span>{' '}
                <span className="font-medium text-amber-800">{p.name}</span>{' '}
                <span className="text-amber-700">
                  has consumed ${p.spendMTD.toFixed(2)} of ${p.monthlyBudget.toFixed(2)}. 
                  {topBurnTool && ` Tool "${topBurnTool.tool.replace(/_/g, ' ')}" accounts for $${topBurnTool.spend.toFixed(2)} (${topBurnTool.sharePercent}% of total).`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onNavigateToTools}
                className="text-amber-800 font-semibold hover:text-amber-950 inline-flex items-center gap-1 hover:underline"
              >
                Analyze Tool Burn <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
