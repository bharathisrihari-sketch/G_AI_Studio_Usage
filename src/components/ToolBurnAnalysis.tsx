import React, { useState } from 'react';
import { Flame, Sparkles, HelpCircle, ArrowUpRight, CheckCircle2, ChevronRight, DollarSign, Zap, TrendingDown } from 'lucide-react';
import { ToolBurnMetric, AIStudioProject } from '../types/aiStudio';
import { formatCurrency, formatCompactNumber } from '../utils/pricingCalculator';

interface ToolBurnAnalysisProps {
  toolMetrics: ToolBurnMetric[];
  projects: AIStudioProject[];
  onSelectProject: (projectId: string) => void;
}

export const ToolBurnAnalysis: React.FC<ToolBurnAnalysisProps> = ({
  toolMetrics,
  projects,
  onSelectProject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [simulatedOptimizations, setSimulatedOptimizations] = useState<Record<string, boolean>>({
    google_search_grounding: true,
    uncached_context_expansion: true
  });

  const categories = ['all', 'Grounding', 'Agentic Loops', 'Multimodal', 'Context Waste', 'Code Sandbox', 'Audio Streaming'];

  const filteredMetrics = toolMetrics.filter(m => {
    return selectedCategory === 'all' || m.category === selectedCategory;
  });

  const totalToolSpend = toolMetrics.reduce((acc, m) => acc + m.totalCost, 0);

  // Calculate simulated monthly savings
  const totalPotentialSavings = toolMetrics.reduce((acc, m) => {
    return simulatedOptimizations[m.id] ? acc + m.potentialMonthlySavings : acc;
  }, 0);

  const toggleOptimization = (toolId: string) => {
    setSimulatedOptimizations(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner for Tool Budget Burn */}
      <div className="bg-white border border-neutral-200 rounded p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-50 text-amber-700">
                <Flame className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Tool Budget Burn & Hidden Cost Diagnostics
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              In Google AI Studio, over 67% of total budget burn is driven by tools, grounding queries, recursive agent loops, and uncached tokens rather than raw model generation.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-neutral-50 p-3 rounded border border-neutral-200 text-xs shrink-0">
            <div>
              <div className="text-neutral-500 text-[11px]">Total Tool Spend (MTD)</div>
              <div className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                {formatCurrency(totalToolSpend)}
              </div>
            </div>
            <div className="h-8 w-px bg-neutral-200"></div>
            <div>
              <div className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Simulated Savings
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                -{formatCurrency(totalPotentialSavings)}/mo
              </div>
            </div>
          </div>
        </div>

        {/* Visual Tool Burn Share Bar */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-neutral-700">Spend Distribution Across Tools</span>
            <span className="text-neutral-500 font-mono text-[11px]">Sorted by highest burn rate</span>
          </div>

          <div className="h-4 w-full bg-neutral-100 rounded flex overflow-hidden">
            {toolMetrics.map((m, idx) => {
              const share = (m.totalCost / totalToolSpend) * 100;
              const colors = [
                'bg-amber-600',
                'bg-blue-600',
                'bg-rose-500',
                'bg-indigo-600',
                'bg-purple-600',
                'bg-emerald-600',
                'bg-teal-600',
                'bg-neutral-500'
              ];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={m.id}
                  style={{ width: `${share}%` }}
                  className={`${color} hover:opacity-85 transition-opacity relative group`}
                  title={`${m.name}: ${formatCurrency(m.totalCost)} (${share.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-neutral-600">
            {toolMetrics.slice(0, 5).map((m, idx) => {
              const colors = ['bg-amber-600', 'bg-blue-600', 'bg-rose-500', 'bg-indigo-600', 'bg-purple-600'];
              return (
                <div key={m.id} className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-xs ${colors[idx]}`} />
                  <span className="font-medium text-neutral-800">{m.name}</span>
                  <span className="font-mono text-neutral-500">({m.percentOfToolSpend}%)</span>
                </div>
              );
            })}
            <span className="text-[11px] text-neutral-400">+ 3 others</span>
          </div>
        </div>
      </div>

      {/* Filter bar for Tool Categories */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs capitalize transition-colors font-medium whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-500 hidden sm:block">
          Interactive FinOps Levers: Toggle optimizations below to model cost reduction
        </div>
      </div>

      {/* Grid of Tools Burning Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMetrics.map((tool) => {
          const isOptimized = !!simulatedOptimizations[tool.id];

          return (
            <div 
              key={tool.id} 
              className={`bg-white border rounded p-4.5 transition-all flex flex-col justify-between ${
                tool.burnLevel === 'critical' 
                  ? 'border-amber-300 shadow-xs' 
                  : 'border-neutral-200'
              }`}
            >
              <div>
                {/* Header: Title and Burn badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {tool.category}
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 mt-0.5">
                      {tool.name}
                    </h3>
                  </div>

                  {/* Clean unboxed burn level text */}
                  <div className="text-right">
                    {tool.burnLevel === 'critical' && (
                      <span className="font-mono text-xs font-bold text-rose-600 flex items-center gap-1 justify-end">
                        <Flame className="w-3.5 h-3.5" /> Severe Burn
                      </span>
                    )}
                    {tool.burnLevel === 'high' && (
                      <span className="font-mono text-xs font-semibold text-amber-700">
                        High Burn
                      </span>
                    )}
                    {tool.burnLevel === 'moderate' && (
                      <span className="font-mono text-xs text-neutral-600">
                        Moderate Burn
                      </span>
                    )}
                    {tool.burnLevel === 'low' && (
                      <span className="font-mono text-xs text-neutral-500">
                        Low Burn
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-neutral-400 block">
                      {tool.percentOfToolSpend}% of tool spend
                    </span>
                  </div>
                </div>

                {/* Quantitative Metric Strip */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-neutral-50 rounded border border-neutral-100 my-2.5 text-xs">
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Month to Date</span>
                    <span className="font-bold font-mono tabular-nums text-neutral-900">
                      {formatCurrency(tool.totalCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Calls / Events</span>
                    <span className="font-semibold font-mono tabular-nums text-neutral-800">
                      {formatCompactNumber(tool.callCount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Avg / Invocation</span>
                    <span className="font-semibold font-mono tabular-nums text-neutral-800">
                      ${tool.avgCostPerCall.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                  {tool.description}
                </p>

                {/* Primary Culprit Projects */}
                <div className="mb-3">
                  <span className="text-[11px] font-medium text-neutral-500 block mb-1">
                    Projects driving this spend:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tool.primaryProjectIds.map(projId => {
                      const proj = projects.find(p => p.id === projId);
                      if (!proj) return null;
                      return (
                        <button
                          key={projId}
                          onClick={() => onSelectProject(projId)}
                          className="text-[11px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <span>{proj.name}</span>
                          <ChevronRight className="w-3 h-3 text-neutral-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Optimization Recommendation and Savings Toggle */}
              <div className="pt-3 border-t border-neutral-100">
                <div className="text-xs bg-emerald-50/70 border border-emerald-200/80 rounded p-2.5 mb-2.5">
                  <div className="flex items-center justify-between font-semibold text-emerald-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Cost Optimization Action
                    </span>
                    <span className="font-mono tabular-nums text-emerald-700">
                      +{formatCurrency(tool.potentialMonthlySavings)}/mo savings
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-950/80 leading-normal">
                    {tool.recommendation}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleOptimization(tool.id)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isOptimized
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isOptimized ? 'Simulating Optimization' : 'Model This Optimization'}</span>
                  </button>

                  <span className="text-[11px] text-neutral-400 font-mono">
                    AI Studio FinOps Rule
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
