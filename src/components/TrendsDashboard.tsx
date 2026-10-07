import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { TrendingUp, Layers, DollarSign, Database, Sparkles, Filter, Calendar } from 'lucide-react';
import { AIStudioProject, DailyTrendPoint } from '../types/aiStudio';
import { generate30DayTrendData } from '../utils/anomalyDetector';
import { formatCurrency, formatCompactNumber } from '../utils/pricingCalculator';

interface TrendsDashboardProps {
  projects: AIStudioProject[];
  onSelectProject: (projectId: string) => void;
}

export const TrendsDashboard: React.FC<TrendsDashboardProps> = ({ projects, onSelectProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [metricView, setMetricView] = useState<'spend' | 'tokens' | 'requests'>('spend');

  // Generate 30-day data
  const trendData: DailyTrendPoint[] = React.useMemo(() => {
    return generate30DayTrendData(projects);
  }, [projects]);

  // Aggregate stats over 30 days
  const total30DaySpend = trendData.reduce((acc, p) => acc + p.totalSpend, 0);
  const total30DayTokens = trendData.reduce((acc, p) => acc + p.totalTokens, 0);
  const total30DayCached = trendData.reduce((acc, p) => acc + p.cachedTokens, 0);
  const peakDay = trendData.reduce((max, p) => p.totalSpend > max.totalSpend ? p : max, trendData[0]);

  // Colors for each project in charts
  const projectColors: Record<string, string> = {
    'proj-640868056160': '#2563eb', // Blue (Active Workspace)
    'proj-bharathi-primary': '#0d9488', // Teal (Primary Engine)
    'proj-srihari-vision': '#e11d48', // Rose (Vision & Catalog)
    'proj-bharathi-copilot': '#8b5cf6', // Purple (Reasoning Copilot)
    'proj-srihari-support': '#f59e0b', // Amber (Live Concierge)
  };

  const filteredTrendData = trendData.map(pt => {
    if (selectedProjectId === 'all') return pt;
    const projSpend = pt[selectedProjectId] || 0;
    return {
      ...pt,
      totalSpend: projSpend,
      promptTokens: Math.round(pt.promptTokens * (projSpend / (pt.totalSpend || 1))),
      outputTokens: Math.round(pt.outputTokens * (projSpend / (pt.totalSpend || 1))),
      cachedTokens: Math.round(pt.cachedTokens * (projSpend / (pt.totalSpend || 1))),
      totalTokens: Math.round(pt.totalTokens * (projSpend / (pt.totalSpend || 1)))
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Header */}
      <div className="bg-white border border-neutral-200 rounded p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              30-Day FinOps & Token Consumption Trends
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Visualized with Recharts: Track daily spend velocity, token growth curves, and prompt caching dividends over the last 30 days.
          </p>
        </div>

        {/* Project Selector & Metric Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Project dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="border border-neutral-200 rounded px-2.5 py-1.5 bg-neutral-50 text-neutral-800 font-medium focus:outline-none focus:border-neutral-900"
          >
            <option value="all">All Projects Combined</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Metric View Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded border border-neutral-200">
            <button
              onClick={() => setMetricView('spend')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                metricView === 'spend' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Daily Spend ($)
            </button>
            <button
              onClick={() => setMetricView('tokens')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                metricView === 'tokens' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Token Volumes
            </button>
            <button
              onClick={() => setMetricView('requests')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                metricView === 'requests' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Requests & Errors
            </button>
          </div>
        </div>
      </div>

      {/* 4 Quantitative 30-Day KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded p-4">
          <span className="text-neutral-500 text-[11px] block">30-Day Aggregate Spend</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
            {formatCurrency(total30DaySpend)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Avg Daily Burn: <strong className="font-mono text-neutral-800">${(total30DaySpend / 30).toFixed(2)}/day</strong>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded p-4">
          <span className="text-neutral-500 text-[11px] block">30-Day Token Volume</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
            {formatCompactNumber(total30DayTokens)}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            {formatCompactNumber(total30DayCached)} cached ({Math.round((total30DayCached / total30DayTokens) * 100)}% cache ratio)
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded p-4">
          <span className="text-neutral-500 text-[11px] block">Peak Spend Day</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
            {formatCurrency(peakDay.totalSpend)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Recorded on <span className="font-mono text-neutral-800">{peakDay.fullDate}</span> (Video surge)
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded p-4">
          <span className="text-neutral-500 text-[11px] block">Prompt Caching Savings</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
            +${(total30DayCached * 0.00000085).toFixed(2)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Net reduction via Context Caching API
          </div>
        </div>
      </div>

      {/* Main Chart 1: Daily Spend Growth Chart */}
      {metricView === 'spend' && (
        <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Daily Spend Growth Trajectory ($ USD)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Daily cost incurred across all project endpoints. Notice the surge around Oct 04-05 driven by video ingestion.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              Last 30 Calendar Days
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {selectedProjectId === 'all' ? (
                <AreaChart data={filteredTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    {projects.map((p, idx) => (
                      <linearGradient key={p.id} id={`color-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={projectColors[p.id] || '#2563eb'} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={projectColors[p.id] || '#2563eb'} stopOpacity={0.05}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#737373' }} tickLine={false} />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#737373' }} 
                    tickFormatter={(val) => `$${val}`}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const total = payload.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                        return (
                          <div className="bg-neutral-900 text-white p-3 rounded shadow-xl text-xs font-mono space-y-1">
                            <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1 mb-1">
                              Date: {label} · Total: ${total.toFixed(2)}
                            </div>
                            {payload.map((entry: any) => {
                              const proj = projects.find(p => p.id === entry.dataKey);
                              return (
                                <div key={entry.dataKey} className="flex justify-between gap-4">
                                  <span style={{ color: entry.color }}>{proj?.name || entry.dataKey}:</span>
                                  <span className="font-bold">${Number(entry.value).toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {projects.map((p) => (
                    <Area
                      key={p.id}
                      type="monotone"
                      dataKey={p.id}
                      name={p.name}
                      stackId="1"
                      stroke={projectColors[p.id] || '#2563eb'}
                      fill={`url(#color-${p.id})`}
                    />
                  ))}
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => <span className="text-neutral-700 font-medium">{value}</span>}
                  />
                </AreaChart>
              ) : (
                <AreaChart data={filteredTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="singleColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#737373' }} tickLine={false} />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#737373' }} 
                    tickFormatter={(val) => `$${val}`}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spend']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalSpend"
                    name="Daily Spend"
                    stroke="#2563eb"
                    fill="url(#singleColor)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Chart 2: Token Consumption Patterns */}
      {metricView === 'tokens' && (
        <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Token Consumption Patterns (Prompt vs Output vs Cached)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Stacked token footprint over the last 30 days demonstrating prompt caching effectiveness.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              Input + Output Tokens
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="promptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="cachedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#737373' }} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#737373' }} 
                  tickFormatter={(val) => formatCompactNumber(val)}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [Number(val).toLocaleString(), name]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="promptTokens" 
                  name="Prompt (Input) Tokens" 
                  stroke="#3b82f6" 
                  fill="url(#promptGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="cachedTokens" 
                  name="Cached Tokens (75% Off)" 
                  stroke="#10b981" 
                  fill="url(#cachedGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="outputTokens" 
                  name="Output Candidate Tokens" 
                  stroke="#f59e0b" 
                  fill="url(#outputGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Chart 3: Requests & Error Rates */}
      {metricView === 'requests' && (
        <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Daily Request Throughput & Error Rate Spikes
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Bar volume showing successful queries vs HTTP 429 quota throttle events.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              Throughput & Throttles
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#737373' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#737373' }} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [Number(val).toLocaleString(), name]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="requestsCount" name="Successful Requests (200 OK)" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Bar dataKey="errorCount" name="Throttled Requests (429 Rate Limits)" fill="#e11d48" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cumulative Trajectory Section */}
      <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              30-Day Cumulative Spend Trajectory vs Budget Velocity
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Accumulation curve comparing current run rate against the monthly allocated budget ceiling.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-neutral-800">
            Total Accumulated: {formatCurrency(trendData[trendData.length - 1].cumulativeSpend)}
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#737373' }} tickLine={false} />
              <YAxis 
                tick={{ fontSize: 11, fill: '#737373' }} 
                tickFormatter={(val) => `$${val}`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Cumulative Spend']}
                labelFormatter={(lbl) => `Date: ${lbl}`}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeSpend" 
                name="Cumulative Spend ($)" 
                stroke="#0f172a" 
                strokeWidth={2.5} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
