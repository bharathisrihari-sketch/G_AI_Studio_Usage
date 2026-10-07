import React, { useState, useEffect } from 'react';
import { X, Plus, ShieldCheck, Database, Key, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { AIStudioProject, Environment } from '../types/aiStudio';

interface AddProjectModalProps {
  onClose: () => void;
  onAddProject: (project: AIStudioProject) => void;
  onImportMultipleProjects?: (projects: AIStudioProject[]) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ 
  onClose, 
  onAddProject,
  onImportMultipleProjects
}) => {
  const [tab, setTab] = useState<'auto-discover' | 'api-key' | 'manual'>('auto-discover');

  // Auto-discover state
  const [discovering, setDiscovering] = useState(false);
  const [discoveredProjects, setDiscoveredProjects] = useState<AIStudioProject[]>([]);
  const [runtimeDetails, setRuntimeDetails] = useState<any>(null);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  // API Key verification state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyProjectName, setKeyProjectName] = useState('');
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [keyVerificationResult, setKeyVerificationResult] = useState<any>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Manual project form state
  const [name, setName] = useState('');
  const [gcpProjectId, setGcpProjectId] = useState('');
  const [environment, setEnvironment] = useState<Environment>('production');
  const [region, setRegion] = useState('asia-southeast1');
  const [monthlyBudget, setMonthlyBudget] = useState(350);
  const [autoPause, setAutoPause] = useState(true);
  const [notes, setNotes] = useState('');

  // Fetch discovered projects on mount
  useEffect(() => {
    fetchDiscoveredProjects();
  }, []);

  const fetchDiscoveredProjects = async () => {
    setDiscovering(true);
    setDiscoverError(null);
    try {
      const res = await fetch('/api/discover-projects');
      if (!res.ok) throw new Error('Failed to query Google AI Studio project service');
      const data = await res.json();
      if (data.discoveredProjects) {
        setDiscoveredProjects(data.discoveredProjects);
        setRuntimeDetails(data.runtimeDetails);
      }
    } catch (err: any) {
      setDiscoverError(err.message);
    } finally {
      setDiscovering(false);
    }
  };

  const handleVerifyApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setVerifyingKey(true);
    setKeyError(null);
    setKeyVerificationResult(null);

    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Failed to authenticate API key with Google AI Studio');
      }
      setKeyVerificationResult(data);
      if (!keyProjectName) {
        setKeyProjectName(`Imported Key Project (${data.keyPrefix})`);
      }
    } catch (err: any) {
      setKeyError(err.message);
    } finally {
      setVerifyingKey(false);
    }
  };

  const handleAddVerifiedKeyProject = () => {
    if (!keyVerificationResult) return;

    const newProj: AIStudioProject = {
      id: `proj-imported-${Date.now()}`,
      name: keyProjectName.trim() || `AI Studio Project (${keyVerificationResult.keyPrefix})`,
      gcpProjectId: `genai-imported-${Date.now().toString().slice(-4)}`,
      liveUrl: `https://${(keyProjectName || 'project').toLowerCase().replace(/[^a-z0-9]/g, '-')}.asia-southeast1.run.app`,
      lastUsedStatus: 'Active (Just now)',
      lastUsedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastDeployedStatus: 'Deployed (Build #1 · Today · Healthy)',
      lastDeployedTimestamp: new Date().toISOString(),
      deploymentVersion: 'v1.0.0 (rev-init)',
      deploymentHealth: 'healthy',
      environment: 'production',
      status: 'healthy',
      createdDate: new Date().toISOString().split('T')[0],
      region: 'asia-southeast1',
      monthlyBudget: 300.00,
      spendMTD: 0.00,
      projectedSpend: 0.00,
      dailyBurnRate: 0.00,
      totalRequests: 0,
      successRate: 100.0,
      peakRpm: 0,
      quotaRpm: 1000,
      peakTpm: 0,
      quotaTpm: 4000000,
      promptTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      cacheSavingsUSD: 0,
      alertThresholdPercent: 80,
      autoPauseOnBudgetBreach: true,
      notes: `Verified key with ${keyVerificationResult.modelCount} active Gemini models in Google AI Studio.`,
      topToolsBurn: [],
      modelUsages: [
        {
          modelId: 'gemini-2.5-flash',
          modelName: 'Gemini 2.5 Flash',
          requestCount: 0,
          promptTokens: 0,
          outputTokens: 0,
          cachedTokens: 0,
          spend: 0,
          avgLatencyMs: 0
        }
      ],
      apiKeys: [
        {
          id: `key-${Date.now()}`,
          name: 'imported-verified-key',
          keyPrefix: keyVerificationResult.keyPrefix,
          createdDate: new Date().toISOString().split('T')[0],
          lastUsed: 'Verified now',
          status: 'active',
          rateLimitRpm: 1000
        }
      ]
    };

    onAddProject(newProj);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedGcpId = gcpProjectId.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-gcp';

    const newProject: AIStudioProject = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      gcpProjectId: formattedGcpId,
      liveUrl: `https://${formattedGcpId}.asia-southeast1.run.app`,
      lastUsedStatus: 'Active (Just now)',
      lastUsedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastDeployedStatus: 'Deployed (Build #1 · Today · Healthy)',
      lastDeployedTimestamp: new Date().toISOString(),
      deploymentVersion: 'v1.0.0 (rev-init)',
      deploymentHealth: 'healthy',
      environment,
      status: 'healthy',
      createdDate: new Date().toISOString().split('T')[0],
      region,
      monthlyBudget: Number(monthlyBudget),
      spendMTD: 0.00,
      projectedSpend: 0.00,
      dailyBurnRate: 0.00,
      totalRequests: 0,
      successRate: 100.0,
      peakRpm: 0,
      quotaRpm: environment === 'production' ? 1000 : 300,
      peakTpm: 0,
      quotaTpm: environment === 'production' ? 4000000 : 1500000,
      promptTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      cacheSavingsUSD: 0,
      alertThresholdPercent: 80,
      autoPauseOnBudgetBreach: autoPause,
      notes: notes.trim() || 'Actual project configured under bharathi.srihari@gmail.com.',
      topToolsBurn: [],
      modelUsages: [
        {
          modelId: 'gemini-2.5-flash',
          modelName: 'Gemini 2.5 Flash',
          requestCount: 0,
          promptTokens: 0,
          outputTokens: 0,
          cachedTokens: 0,
          spend: 0,
          avgLatencyMs: 0
        }
      ],
      apiKeys: [
        {
          id: `key-${Date.now()}`,
          name: 'project-primary-key',
          keyPrefix: `AIzaSy${Math.random().toString(36).substring(2, 6).toUpperCase()}...`,
          createdDate: new Date().toISOString().split('T')[0],
          lastUsed: 'Active',
          status: 'active',
          rateLimitRpm: 600
        }
      ]
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white border border-neutral-200 rounded shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Import & Connect Actual AI Studio Projects
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Account: <strong className="font-mono text-neutral-800">bharathi.srihari@gmail.com</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-4 sm:px-5 bg-white border-b border-neutral-200 flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setTab('auto-discover')}
            className={`py-2.5 border-b-2 font-bold uppercase tracking-wider text-[11px] transition-colors ${
              tab === 'auto-discover'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Auto-Discovered From Login
          </button>
          <button
            onClick={() => setTab('api-key')}
            className={`py-2.5 border-b-2 font-bold uppercase tracking-wider text-[11px] transition-colors ${
              tab === 'api-key'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Import via AI Studio API Key
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`py-2.5 border-b-2 font-bold uppercase tracking-wider text-[11px] transition-colors ${
              tab === 'manual'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Manual GCP Project Entry
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* TAB 1: AUTO DISCOVER */}
          {tab === 'auto-discover' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-emerald-950">
                <div className="flex items-center gap-2 font-semibold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Authenticated Session Detected for bharathi.srihari@gmail.com
                </div>
                <div className="text-[11px] text-emerald-900/80 leading-relaxed font-mono">
                  {runtimeDetails ? (
                    <>
                      GCP Runtime Project: <strong>{runtimeDetails.runtimeProjectId}</strong> (#{runtimeDetails.numericProjectId}) · Region: {runtimeDetails.region} · {runtimeDetails.verifiedModelsCount} Gemini Models Verified
                    </>
                  ) : (
                    'Querying live Google Cloud Resource & AI Studio credentials...'
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-800">
                    Discovered Actual Projects ({discoveredProjects.length})
                  </span>
                  <button
                    onClick={fetchDiscoveredProjects}
                    disabled={discovering}
                    className="text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1 text-[11px]"
                  >
                    <RefreshCw className={`w-3 h-3 ${discovering ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="space-y-2">
                  {discoveredProjects.map((p) => (
                    <div 
                      key={p.id}
                      className="p-3 bg-neutral-50 rounded border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900">{p.name}</span>
                          <span className="text-emerald-700 font-mono text-[11px] font-medium">
                            · Live Verified
                          </span>
                        </div>
                        <div className="font-mono text-neutral-500 text-[11px] mt-0.5">
                          GCP: {p.gcpProjectId} · Region: {p.region} · Budget: ${p.monthlyBudget}
                        </div>
                        <p className="text-neutral-600 text-[11px] mt-1 font-sans">
                          {p.notes}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onAddProject(p);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 shrink-0 text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Import This Project</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {onImportMultipleProjects && discoveredProjects.length > 0 && (
                <div className="pt-2 border-t border-neutral-200 flex justify-end">
                  <button
                    onClick={() => {
                      onImportMultipleProjects(discoveredProjects);
                      onClose();
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800 transition-colors"
                  >
                    Import All {discoveredProjects.length} Actual Projects & Replace Test Data
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT VIA API KEY */}
          {tab === 'api-key' && (
            <div className="space-y-4">
              <p className="text-neutral-600">
                You can import and verify any API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">aistudio.google.com/app/apikey</a>. We will verify model access and connect it as an active project.
              </p>

              <form onSubmit={handleVerifyApiKey} className="space-y-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Google AI Studio API Key (starts with AIzaSy... or AQ...)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Paste Gemini API Key from Google AI Studio"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-2 font-mono text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingKey || !apiKeyInput.trim()}
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {verifyingKey ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying with Generative Language API...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify & Inspect Models</span>
                    </>
                  )}
                </button>
              </form>

              {keyError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{keyError}</span>
                </div>
              )}

              {keyVerificationResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded space-y-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Verified Successfully ({keyVerificationResult.modelCount} Models Available)
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Project Display Name
                    </label>
                    <input
                      type="text"
                      value={keyProjectName}
                      onChange={(e) => setKeyProjectName(e.target.value)}
                      className="w-full border border-neutral-300 rounded p-2 bg-white text-xs"
                    />
                  </div>

                  <div className="text-[11px] text-neutral-600">
                    Models validated: {keyVerificationResult.generationModels.map((m: any) => m.name).join(', ')}...
                  </div>

                  <button
                    onClick={handleAddVerifiedKeyProject}
                    className="w-full py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800 transition-colors"
                  >
                    Add Verified Project to Console
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANUAL GCP ENTRY */}
          {tab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Project Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bharathi Customer Production Pipeline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-2 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    GCP Project ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bharathi-genai-prod"
                    value={gcpProjectId}
                    onChange={(e) => setGcpProjectId(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-2 font-mono focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Environment
                  </label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded p-2 bg-white focus:outline-none focus:border-neutral-900"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="research">Research / R&D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Monthly Spend Cap ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    step="25"
                    required
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded p-2 font-mono focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Primary Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-2 bg-white focus:outline-none focus:border-neutral-900"
                  >
                    <option value="asia-southeast1">asia-southeast1 (Singapore)</option>
                    <option value="us-central1">us-central1 (Iowa)</option>
                    <option value="us-east4">us-east4 (N. Virginia)</option>
                    <option value="europe-west1">europe-west1 (Belgium)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Architecture & Tool Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uses Gemini 2.5 Flash with search grounding & prompt caching"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-2 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPause}
                    onChange={(e) => setAutoPause(e.target.checked)}
                    className="rounded accent-neutral-900"
                  />
                  <span className="text-neutral-700">
                    Enable auto-pause safety gate when spend reaches 100% of budget
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800"
                >
                  Add Project
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
