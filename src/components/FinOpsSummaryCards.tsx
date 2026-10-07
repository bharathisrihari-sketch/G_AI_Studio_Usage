import React from 'react';
import { DollarSign, Flame, Layers, TrendingUp, Zap, Clock, ShieldCheck } from 'lucide-react';
import { FinOpsSummary } from '../types/aiStudio';
import { formatCurrency, formatCompactNumber } from '../utils/pricingCalculator';

interface FinOpsSummaryCardsProps {
  summary: FinOpsSummary;
}

export const FinOpsSummaryCards: React.FC<FinOpsSummaryCardsProps> = ({ summary }) => {
  const budgetUtilization = summary.totalBudget > 0 
    ? Math.round((summary.totalSpendMTD / summary.totalBudget) * 100) 
    : 0;

  const toolSpendFraction = summary.totalSpendMTD > 0
    ? Math.round((summary.toolSpendMTD / summary.totalSpendMTD) * 100)
    : 0;

  const totalTokens = summary.totalPromptTokens + summary.totalOutputTokens;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Total Spend MTD */}
      <div className="bg-white border border-neutral-200 rounded p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span className="font-medium text-neutral-700">Total Spend (MTD)</span>
          <span className="font-mono tabular-nums text-neutral-500">Oct 2026</span>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
            {formatCurrency(summary.totalSpendMTD)}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
            <span>of {formatCurrency(summary.totalBudget)} limit</span>
            <span aria-hidden="true">·</span>
            <span className={`font-mono tabular-nums font-semibold ${budgetUtilization > 85 ? 'text-rose-600' : budgetUtilization > 70 ? 'text-amber-600' : 'text-emerald-700'}`}>
              {budgetUtilization}% consumed
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Projected EOM</span>
          <span className="font-mono tabular-nums text-neutral-900 font-semibold">
            {formatCurrency(summary.projectedSpendEOM)}
          </span>
        </div>
      </div>

      {/* Card 2: What Tools Burn Budget */}
      <div className="bg-white border border-neutral-200 rounded p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span className="font-medium text-neutral-700">Tool Budget Burn</span>
          <span className="font-mono tabular-nums text-amber-700 font-medium">
            {toolSpendFraction}% of Spend
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
            {formatCurrency(summary.toolSpendMTD)}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
            <span>Base Models: {formatCurrency(summary.baseModelSpendMTD)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-medium">Grounding & Loops</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Daily Run Rate</span>
          <span className="font-mono tabular-nums text-neutral-900 font-semibold">
            {formatCurrency(summary.dailyBurnRate)}/day
          </span>
        </div>
      </div>

      {/* Card 3: Token Footprint & Caching */}
      <div className="bg-white border border-neutral-200 rounded p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span className="font-medium text-neutral-700">Token Volume & Cache</span>
          <span className="font-mono tabular-nums text-emerald-700 font-medium">
            Prompt Caching
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
            {formatCompactNumber(totalTokens)}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
            <span>In: {formatCompactNumber(summary.totalPromptTokens)}</span>
            <span aria-hidden="true">·</span>
            <span>Out: {formatCompactNumber(summary.totalOutputTokens)}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Cache Savings</span>
          <span className="font-mono tabular-nums text-emerald-700 font-semibold">
            +{formatCurrency(summary.totalCacheSavingsUSD)} saved
          </span>
        </div>
      </div>

      {/* Card 4: Projects Status & Quotas */}
      <div className="bg-white border border-neutral-200 rounded p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span className="font-medium text-neutral-700">Project Status</span>
          <span className="font-mono tabular-nums text-neutral-500">
            {summary.activeProjectsCount} Total
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight flex items-center gap-2">
            <span>{summary.activeProjectsCount} Active</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-700 font-medium">
              {summary.activeProjectsCount - summary.warningProjectsCount - summary.throttledProjectsCount} Healthy
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-medium">
              {summary.warningProjectsCount} Budget Warning
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-700 font-medium">
              {summary.throttledProjectsCount} Throttled
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Total API Requests</span>
          <span className="font-mono tabular-nums text-neutral-900 font-semibold">
            {formatCompactNumber(summary.totalRequests)} calls
          </span>
        </div>
      </div>

    </div>
  );
};
