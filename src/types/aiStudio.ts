export type ProjectStatus = 'healthy' | 'warning' | 'throttled' | 'paused';
export type Environment = 'production' | 'staging' | 'research';
export type ModelId = 
  | 'gemini-3.8-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-thinking'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'imagen-3'
  | 'gemini-live-audio';

export type ToolType = 
  | 'google_search_grounding'
  | 'function_calling_loop'
  | 'code_execution'
  | 'uncached_context_expansion'
  | 'multimodal_video_ingest'
  | 'multimodal_image_ingest'
  | 'live_audio_bidirectional'
  | 'imagen_generation';

export interface ToolBurnMetric {
  id: ToolType;
  name: string;
  category: 'Grounding' | 'Agentic Loops' | 'Code Sandbox' | 'Context Waste' | 'Multimodal' | 'Audio Streaming';
  totalCost: number;
  callCount: number;
  avgCostPerCall: number;
  percentOfToolSpend: number;
  burnLevel: 'critical' | 'high' | 'moderate' | 'low';
  description: string;
  primaryProjectIds: string[];
  recommendation: string;
  potentialMonthlySavings: number;
}

export interface ModelUsage {
  modelId: ModelId;
  modelName: string;
  requestCount: number;
  promptTokens: number;
  outputTokens: number;
  cachedTokens: number;
  spend: number;
  avgLatencyMs: number;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdDate: string;
  lastUsed: string;
  status: 'active' | 'revoked' | 'expiring_soon';
  allowedIps?: string;
  rateLimitRpm: number;
}

export interface RequestTrace {
  id: string;
  timestamp: string;
  projectId: string;
  projectName: string;
  model: ModelId;
  statusCode: 200 | 429 | 400 | 500;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  toolsUsed: ToolType[];
  toolCost: number;
  modelCost: number;
  totalCost: number;
  cacheHit: boolean;
  endpoint: string;
  promptPreview: string;
}

export interface AIStudioProject {
  id: string;
  name: string;
  gcpProjectId: string;
  environment: Environment;
  status: ProjectStatus;
  createdDate: string;
  region: string;
  monthlyBudget: number;
  spendMTD: number;
  projectedSpend: number;
  dailyBurnRate: number;
  totalRequests: number;
  successRate: number; // percentage
  peakRpm: number;
  quotaRpm: number;
  peakTpm: number;
  quotaTpm: number;
  promptTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cacheSavingsUSD: number;
  topToolsBurn: {
    tool: ToolType;
    spend: number;
    sharePercent: number;
  }[];
  modelUsages: ModelUsage[];
  apiKeys: ApiKeyItem[];
  alertThresholdPercent: number; // e.g. 80
  autoPauseOnBudgetBreach: boolean;
  notes: string;
}

export interface FinOpsSummary {
  totalSpendMTD: number;
  totalBudget: number;
  projectedSpendEOM: number;
  dailyBurnRate: number;
  totalRequests: number;
  totalPromptTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  totalCacheSavingsUSD: number;
  toolSpendMTD: number;
  baseModelSpendMTD: number;
  activeProjectsCount: number;
  warningProjectsCount: number;
  throttledProjectsCount: number;
}
