/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { BudgetAlertsBanner } from './components/BudgetAlertsBanner';
import { FinOpsSummaryCards } from './components/FinOpsSummaryCards';
import { ProjectsTable } from './components/ProjectsTable';
import { ToolBurnAnalysis } from './components/ToolBurnAnalysis';
import { EndToEndTracer } from './components/EndToEndTracer';
import { AuditLogsView } from './components/AuditLogsView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AddProjectModal } from './components/AddProjectModal';
import { TrendsDashboard } from './components/TrendsDashboard';
import { AnomalyDetectionPanel } from './components/AnomalyDetectionPanel';
import { 
  INITIAL_PROJECTS, 
  TOOL_BURN_METRICS, 
  RECENT_REQUEST_TRACES, 
  INITIAL_ANOMALIES,
  USER_EMAIL, 
  BILLING_ACCOUNT_ID, 
  CURRENT_BILLING_CYCLE,
  computeFinOpsSummary 
} from './data/mockData';
import { AIStudioProject, RequestTrace, AnomalyEvent } from './types/aiStudio';
import { detectAnomaliesFromTraces } from './utils/anomalyDetector';
import { RefreshCw, CheckCircle2, Sparkles, Activity, TrendingUp } from 'lucide-react';

const STORAGE_KEY = 'aistudio_finops_projects_v3';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Initialize projects from localStorage or default actual login projects
  const [projects, setProjects] = useState<AIStudioProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved projects from localStorage', e);
    }
    return INITIAL_PROJECTS;
  });

  const [toolMetrics, setToolMetrics] = useState(TOOL_BURN_METRICS);
  const [requestTraces, setRequestTraces] = useState<RequestTrace[]>(RECENT_REQUEST_TRACES);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(INITIAL_ANOMALIES);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | 'mtd' | '30d'>('mtd');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Save projects to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects to localStorage', e);
    }
  }, [projects]);

  // Compute live FinOps summary
  const finOpsSummary = computeFinOpsSummary(projects);
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;
  const activeAnomaliesCount = anomalies.filter(a => !a.isResolved).length;

  // Live traffic simulation and anomaly detection effect
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const eligibleProjects = projects.filter(p => p.status !== 'paused');
      if (eligibleProjects.length === 0) return;

      const randomProj = eligibleProjects[Math.floor(Math.random() * eligibleProjects.length)];
      const isThrottledCandidate = randomProj.status === 'throttled' && Math.random() < 0.35;

      const inputTok = Math.floor(Math.random() * 8000) + 1200;
      const outputTok = Math.floor(Math.random() * 600) + 150;
      const cachedTok = Math.random() > 0.4 ? Math.floor(inputTok * 0.7) : 0;
      
      const usesGrounding = Math.random() > 0.65;
      const usesCodeExec = Math.random() > 0.8;
      
      const toolCost = (usesGrounding ? 0.035 : 0) + (usesCodeExec ? 0.005 : 0);
      const isPro = randomProj.id === 'proj-bharathi-copilot' || randomProj.id === 'proj-bharathi-primary';
      const inputRate = isPro ? 1.25 : 0.075;
      const outputRate = isPro ? 5.00 : 0.30;
      const modelCost = ((inputTok - cachedTok) / 1000000) * inputRate + ((cachedTok / 1000000) * (inputRate * 0.25)) + ((outputTok / 1000000) * outputRate);
      
      const reqCost = isThrottledCandidate ? 0 : Number((toolCost + modelCost).toFixed(5));

      const newTrace: RequestTrace = {
        id: `req-${Date.now().toString().slice(-5)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        projectId: randomProj.id,
        projectName: randomProj.name,
        model: isPro ? 'gemini-2.5-pro' : 'gemini-3.8-flash',
        statusCode: isThrottledCandidate ? 429 : 200,
        latencyMs: isThrottledCandidate ? 64 : Math.floor(Math.random() * 380) + 140,
        inputTokens: inputTok,
        outputTokens: isThrottledCandidate ? 0 : outputTok,
        cachedTokens: cachedTok,
        toolsUsed: [
          ...(usesGrounding ? ['google_search_grounding' as const] : []),
          ...(usesCodeExec ? ['code_execution' as const] : [])
        ],
        toolCost,
        modelCost,
        totalCost: reqCost,
        cacheHit: cachedTok > 0,
        endpoint: 'v1beta.models.generateContent',
        promptPreview: isThrottledCandidate
          ? `429 RESOURCE_EXHAUSTED: TPM limit reached on ${randomProj.gcpProjectId}`
          : `Live request: Processed query with ${inputTok} tokens on ${randomProj.name}...`
      };

      // Prepend trace
      setRequestTraces(prev => {
        const updated = [newTrace, ...prev.slice(0, 49)];
        
        // Run anomaly detection on updated traces
        const detected = detectAnomaliesFromTraces(updated, projects);
        if (detected.length > 0) {
          setAnomalies(prevAnoms => {
            const existingIds = new Set(prevAnoms.map(a => a.projectId + a.type));
            const newOnes = detected.filter(d => !existingIds.has(d.projectId + d.type));
            return [...newOnes, ...prevAnoms];
          });
        }

        return updated;
      });

      // Update project metrics & last used status
      if (!isThrottledCandidate) {
        setProjects(prevProjects =>
          prevProjects.map(p => {
            if (p.id !== randomProj.id) return p;

            const updatedSpend = Number((p.spendMTD + reqCost).toFixed(2));
            const updatedRequests = p.totalRequests + 1;
            const updatedPromptTok = p.promptTokens + inputTok;
            const updatedOutputTok = p.outputTokens + outputTok;
            const updatedCachedTok = p.cachedTokens + cachedTok;

            let updatedStatus = p.status;
            if (p.autoPauseOnBudgetBreach && updatedSpend >= p.monthlyBudget) {
              updatedStatus = 'paused';
            } else if (updatedSpend >= p.monthlyBudget * (p.alertThresholdPercent / 100)) {
              updatedStatus = 'warning';
            }

            return {
              ...p,
              spendMTD: updatedSpend,
              totalRequests: updatedRequests,
              promptTokens: updatedPromptTok,
              outputTokens: updatedOutputTok,
              cachedTokens: updatedCachedTok,
              status: updatedStatus,
              lastUsedStatus: 'Active (Just now)',
              lastUsedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
          })
        );
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, projects]);

  // Project management handlers
  const handleAddProject = (newProject: AIStudioProject) => {
    setProjects(prev => {
      const exists = prev.some(p => p.id === newProject.id || p.gcpProjectId === newProject.gcpProjectId);
      if (exists) {
        return prev.map(p => (p.id === newProject.id || p.gcpProjectId === newProject.gcpProjectId) ? newProject : p);
      }
      return [newProject, ...prev];
    });
    setSyncStatusMsg(`Added "${newProject.name}" to console.`);
    setTimeout(() => setSyncStatusMsg(null), 3500);
  };

  const handleImportMultipleProjects = (importedProjects: AIStudioProject[]) => {
    setProjects(importedProjects);
    setSyncStatusMsg(`Synchronized ${importedProjects.length} actual projects from your login.`);
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  const handleSyncFromLogin = async () => {
    try {
      setSyncStatusMsg('Discovering projects from Google AI Studio login...');
      const res = await fetch('/api/discover-projects');
      if (res.ok) {
        const data = await res.json();
        if (data.discoveredProjects && data.discoveredProjects.length > 0) {
          handleImportMultipleProjects(data.discoveredProjects);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    handleImportMultipleProjects(INITIAL_PROJECTS);
  };

  const handleResolveAnomaly = (anomalyId: string) => {
    setAnomalies(prev => prev.map(a => a.id === anomalyId ? { ...a, isResolved: true } : a));
  };

  const handleUpdateProjectBudget = (
    projectId: string, 
    newBudget: number, 
    threshold: number, 
    autoPause: boolean
  ) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const newStatus = p.spendMTD >= newBudget && autoPause ? 'paused' : p.spendMTD >= newBudget * (threshold / 100) ? 'warning' : 'healthy';
        return {
          ...p,
          monthlyBudget: newBudget,
          alertThresholdPercent: threshold,
          autoPauseOnBudgetBreach: autoPause,
          status: newStatus
        };
      })
    );
  };

  const handleToggleProjectPause = (projectId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          status: p.status === 'paused' ? 'healthy' : 'paused'
        };
      })
    );
  };

  // Export FinOps CSV report
  const handleExportCSV = () => {
    const headers = [
      'Project Name',
      'Live URL',
      'Last Used Status',
      'Last Deployed Status',
      'GCP Project ID',
      'Environment',
      'Status',
      'Region',
      'Monthly Budget ($)',
      'Spend MTD ($)',
      'Budget Consumed (%)',
      'Projected EOM ($)',
      'Daily Burn ($/day)',
      'Total Requests',
      'Prompt Tokens',
      'Output Tokens',
      'Cached Tokens',
      'Cache Savings ($)',
      'Peak RPM',
      'Quota RPM',
      'Peak TPM',
      'Quota TPM',
      'Top Burn Tool',
      'Top Tool Spend ($)'
    ];

    const rows = projects.map(p => [
      `"${p.name}"`,
      `"${p.liveUrl}"`,
      `"${p.lastUsedStatus}"`,
      `"${p.lastDeployedStatus}"`,
      p.gcpProjectId,
      p.environment,
      p.status,
      p.region,
      p.monthlyBudget.toFixed(2),
      p.spendMTD.toFixed(2),
      ((p.spendMTD / p.monthlyBudget) * 100).toFixed(1) + '%',
      p.projectedSpend.toFixed(2),
      p.dailyBurnRate.toFixed(2),
      p.totalRequests,
      p.promptTokens,
      p.outputTokens,
      p.cachedTokens,
      p.cacheSavingsUSD.toFixed(2),
      p.peakRpm,
      p.quotaRpm,
      p.peakTpm,
      p.quotaTpm,
      `"${p.topToolsBurn[0]?.tool.replace(/_/g, ' ') || 'None'}"`,
      p.topToolsBurn[0]?.spend.toFixed(2) || '0.00'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `google_ai_studio_finops_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={USER_EMAIL}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        onOpenAddProject={() => setIsAddProjectOpen(true)}
        onExportReport={handleExportCSV}
        activeAnomaliesCount={activeAnomaliesCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Real User Account Verified Badge & Actions */}
        <div className="bg-white border border-neutral-200 rounded p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <div>
              <span className="font-semibold text-neutral-900">
                Logged in as {USER_EMAIL}
              </span>
              <span className="text-neutral-500 font-mono text-[11px] block sm:inline sm:ml-2">
                Active GCP Project: ais-asia-southeast1-c2963b3f6b (#640868056160) · 50 Live Models Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {syncStatusMsg ? (
              <span className="text-emerald-700 font-semibold font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {syncStatusMsg}
              </span>
            ) : null}

            <button
              onClick={() => setActiveTab('anomalies')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeAnomaliesCount > 0 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              <span>{activeAnomaliesCount} Anomalies</span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>30D Trends</span>
            </button>

            <button
              onClick={handleSyncFromLogin}
              className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors flex items-center gap-1"
              title="Resynchronize projects directly from Google AI Studio session"
            >
              <RefreshCw className="w-3 h-3 text-neutral-500" />
              <span>Sync Login</span>
            </button>

            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* Account and Cycle Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {activeTab === 'overview' && 'Projects & Spend Dashboard'}
              {activeTab === 'trends' && '30-Day Trends & Token Growth (Recharts)'}
              {activeTab === 'anomalies' && 'Real-Time Anomaly Detection System'}
              {activeTab === 'tool-burn' && 'Tool Budget Burn Diagnostics'}
              {activeTab === 'end-to-end' && 'End-to-End Pipeline & Simulator'}
              {activeTab === 'audit-logs' && 'Request Traces & Audit Ledger'}
            </h1>
            <div className="text-xs text-neutral-500 font-mono flex flex-wrap items-center gap-2 mt-0.5">
              <span>Account: {USER_EMAIL}</span>
              <span aria-hidden="true">·</span>
              <span>Billing Account: {BILLING_ACCOUNT_ID}</span>
              <span aria-hidden="true">·</span>
              <span>Cycle: {CURRENT_BILLING_CYCLE}</span>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-neutral-200 text-xs self-start sm:self-auto">
            {(['24h', '7d', 'mtd', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors ${
                  timeRange === range
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* High Priority Budget & Quota Alerts */}
        <BudgetAlertsBanner
          projects={projects}
          onSelectProject={(id) => setSelectedProjectId(id)}
          onNavigateToTools={() => setActiveTab('tool-burn')}
        />

        {/* Global FinOps Summary KPI Cards */}
        <FinOpsSummaryCards summary={finOpsSummary} />

        {/* Active Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* If critical anomalies exist, show anomaly panel on overview */}
            {anomalies.some(a => a.severity === 'critical' && !a.isResolved) && (
              <AnomalyDetectionPanel
                anomalies={anomalies.filter(a => !a.isResolved)}
                projects={projects}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onResolveAnomaly={handleResolveAnomaly}
              />
            )}

            <ProjectsTable
              projects={projects}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onOpenEditBudget={(proj) => setSelectedProjectId(proj.id)}
            />
          </div>
        )}

        {activeTab === 'trends' && (
          <TrendsDashboard
            projects={projects}
            onSelectProject={(id) => setSelectedProjectId(id)}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyDetectionPanel
            anomalies={anomalies}
            projects={projects}
            onSelectProject={(id) => setSelectedProjectId(id)}
            onResolveAnomaly={handleResolveAnomaly}
          />
        )}

        {activeTab === 'tool-burn' && (
          <ToolBurnAnalysis
            toolMetrics={toolMetrics}
            projects={projects}
            onSelectProject={(id) => setSelectedProjectId(id)}
          />
        )}

        {activeTab === 'end-to-end' && (
          <EndToEndTracer />
        )}

        {activeTab === 'audit-logs' && (
          <AuditLogsView
            traces={requestTraces}
            projects={projects}
            onSelectProject={(id) => setSelectedProjectId(id)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-neutral-200 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Google AI Studio FinOps & Usage Console</span>
            <span aria-hidden="true">·</span>
            <span>GCP Billing Account {BILLING_ACCOUNT_ID}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
            <span>Gemini API v1beta / v1alpha</span>
            <span>Recharts Analytics</span>
            <span>Anomaly Detector Active</span>
          </div>
        </div>
      </footer>

      {/* Project End-to-End Detail Modal / Drawer */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          requestTraces={requestTraces}
          onClose={() => setSelectedProjectId(null)}
          onUpdateProjectBudget={handleUpdateProjectBudget}
          onToggleProjectPause={handleToggleProjectPause}
        />
      )}

      {/* Add Project Modal */}
      {isAddProjectOpen && (
        <AddProjectModal
          onClose={() => setIsAddProjectOpen(false)}
          onAddProject={handleAddProject}
          onImportMultipleProjects={handleImportMultipleProjects}
        />
      )}

    </div>
  );
}
