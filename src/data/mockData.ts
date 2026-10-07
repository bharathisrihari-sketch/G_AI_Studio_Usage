import { AIStudioProject, ToolBurnMetric, RequestTrace, FinOpsSummary } from '../types/aiStudio';

export const USER_EMAIL = 'bharathi.srihari@gmail.com';
export const BILLING_ACCOUNT_ID = '018F42-99B72C-AA4190';
export const CURRENT_BILLING_CYCLE = 'October 1 - October 31, 2026';

export const TOOL_DEFINITIONS: Record<string, { label: string; unitPriceDesc: string; category: string }> = {
  google_search_grounding: {
    label: 'Google Search Grounding',
    unitPriceDesc: '$35.00 / 1,000 queries',
    category: 'Grounding'
  },
  function_calling_loop: {
    label: 'Agent Tool Calling Loop',
    unitPriceDesc: 'Recursive context compounding (~$0.015 - $0.08 / call)',
    category: 'Agentic Loops'
  },
  code_execution: {
    label: 'Python Sandbox Code Execution',
    unitPriceDesc: '$0.005 / execution + generated token cost',
    category: 'Code Sandbox'
  },
  uncached_context_expansion: {
    label: 'Uncached Long Context (Waste)',
    unitPriceDesc: '$1.25 / 1M prompt tokens (un-discounted)',
    category: 'Context Waste'
  },
  multimodal_video_ingest: {
    label: 'Video Frame Ingestion',
    unitPriceDesc: '258 tokens / video second ($0.038 / min on Pro)',
    category: 'Multimodal'
  },
  multimodal_image_ingest: {
    label: 'High-Res Image Processing',
    unitPriceDesc: '258 - 1,032 tokens / image tile',
    category: 'Multimodal'
  },
  live_audio_bidirectional: {
    label: 'Live Audio WebSocket Stream',
    unitPriceDesc: '$0.70 / 1M audio input, $2.00 / 1M audio output',
    category: 'Audio Streaming'
  },
  imagen_generation: {
    label: 'Imagen 3 Generation',
    unitPriceDesc: '$0.030 / generated image',
    category: 'Multimodal'
  }
};

export const INITIAL_PROJECTS: AIStudioProject[] = [
  {
    id: 'proj-640868056160',
    name: 'Google AI Studio Active Workspace',
    gcpProjectId: 'ais-asia-southeast1-c2963b3f6b',
    environment: 'production',
    status: 'healthy',
    createdDate: '2026-08-15',
    region: 'asia-southeast1',
    monthlyBudget: 500.00,
    spendMTD: 42.80,
    projectedSpend: 85.60,
    dailyBurnRate: 4.25,
    totalRequests: 14820,
    successRate: 99.8,
    peakRpm: 140,
    quotaRpm: 1000,
    peakTpm: 520000,
    quotaTpm: 4000000,
    promptTokens: 48200000,
    outputTokens: 6400000,
    cachedTokens: 21000000,
    cacheSavingsUSD: 24.50,
    alertThresholdPercent: 80,
    autoPauseOnBudgetBreach: true,
    notes: 'Live runtime workspace for bharathi.srihari@gmail.com with verified Gemini API key and 50 models enabled.',
    topToolsBurn: [
      { tool: 'google_search_grounding', spend: 18.20, sharePercent: 42.5 },
      { tool: 'function_calling_loop', spend: 12.40, sharePercent: 29.0 },
      { tool: 'code_execution', spend: 6.80, sharePercent: 15.9 }
    ],
    modelUsages: [
      {
        modelId: 'gemini-3.8-flash',
        modelName: 'Gemini 3.8 Flash (Active Model)',
        requestCount: 9400,
        promptTokens: 29000000,
        outputTokens: 4100000,
        cachedTokens: 14000000,
        spend: 22.40,
        avgLatencyMs: 240
      },
      {
        modelId: 'gemini-2.5-pro',
        modelName: 'Gemini 2.5 Pro',
        requestCount: 5420,
        promptTokens: 19200000,
        outputTokens: 2300000,
        cachedTokens: 7000000,
        spend: 20.40,
        avgLatencyMs: 820
      }
    ],
    apiKeys: [
      {
        id: 'key-live-primary',
        name: 'aistudio-runtime-key',
        keyPrefix: 'AQ.Ab8RN6...B5wsg',
        createdDate: '2026-08-15',
        lastUsed: 'Just now (Live verified)',
        status: 'active',
        rateLimitRpm: 1000
      }
    ]
  },
  {
    id: 'proj-bharathi-primary',
    name: 'Bharathi Primary AI Studio Engine',
    gcpProjectId: 'genai-bharathi-prod-01',
    environment: 'production',
    status: 'healthy',
    createdDate: '2026-05-10',
    region: 'asia-southeast1',
    monthlyBudget: 450.00,
    spendMTD: 218.60,
    projectedSpend: 291.50,
    dailyBurnRate: 10.40,
    totalRequests: 58900,
    successRate: 99.7,
    peakRpm: 210,
    quotaRpm: 1000,
    peakTpm: 1240000,
    quotaTpm: 4000000,
    promptTokens: 142000000,
    outputTokens: 24800000,
    cachedTokens: 68000000,
    cacheSavingsUSD: 72.40,
    alertThresholdPercent: 85,
    autoPauseOnBudgetBreach: true,
    notes: 'Primary enterprise generative AI engine for bharathi.srihari@gmail.com customer workloads.',
    topToolsBurn: [
      { tool: 'google_search_grounding', spend: 112.00, sharePercent: 51.2 },
      { tool: 'function_calling_loop', spend: 64.50, sharePercent: 29.5 },
      { tool: 'uncached_context_expansion', spend: 28.10, sharePercent: 12.9 }
    ],
    modelUsages: [
      {
        modelId: 'gemini-2.5-flash',
        modelName: 'Gemini 2.5 Flash',
        requestCount: 48200,
        promptTokens: 110000000,
        outputTokens: 19500000,
        cachedTokens: 55000000,
        spend: 148.20,
        avgLatencyMs: 310
      },
      {
        modelId: 'gemini-2.5-pro',
        modelName: 'Gemini 2.5 Pro',
        requestCount: 10700,
        promptTokens: 32000000,
        outputTokens: 5300000,
        cachedTokens: 13000000,
        spend: 70.40,
        avgLatencyMs: 890
      }
    ],
    apiKeys: [
      {
        id: 'key-bharathi-prod-01',
        name: 'bharathi-prod-app-key',
        keyPrefix: 'AIzaSyD7...4vL2',
        createdDate: '2026-05-10',
        lastUsed: '4 mins ago',
        status: 'active',
        rateLimitRpm: 800
      }
    ]
  },
  {
    id: 'proj-srihari-vision',
    name: 'Srihari Multimodal Vision & Catalog Inspector',
    gcpProjectId: 'srihari-vision-prod-98',
    environment: 'production',
    status: 'warning',
    createdDate: '2026-06-22',
    region: 'asia-southeast1',
    monthlyBudget: 350.00,
    spendMTD: 298.40,
    projectedSpend: 397.80,
    dailyBurnRate: 14.20,
    totalRequests: 42100,
    successRate: 98.6,
    peakRpm: 310,
    quotaRpm: 500,
    peakTpm: 2450000,
    quotaTpm: 3000000,
    promptTokens: 210000000,
    outputTokens: 18200000,
    cachedTokens: 22000000,
    cacheSavingsUSD: 24.00,
    alertThresholdPercent: 80,
    autoPauseOnBudgetBreach: true,
    notes: 'Heavy budget burn driven by video frame ingestion and high-res image tiling.',
    topToolsBurn: [
      { tool: 'multimodal_video_ingest', spend: 168.00, sharePercent: 56.3 },
      { tool: 'multimodal_image_ingest', spend: 82.40, sharePercent: 27.6 },
      { tool: 'uncached_context_expansion', spend: 32.00, sharePercent: 10.7 }
    ],
    modelUsages: [
      {
        modelId: 'gemini-2.5-flash',
        modelName: 'Gemini 2.5 Flash',
        requestCount: 42100,
        promptTokens: 210000000,
        outputTokens: 18200000,
        cachedTokens: 22000000,
        spend: 298.40,
        avgLatencyMs: 480
      }
    ],
    apiKeys: [
      {
        id: 'key-srihari-vis-01',
        name: 'vision-edge-ingest-key',
        keyPrefix: 'AIzaSyK1...9mB5',
        createdDate: '2026-06-22',
        lastUsed: 'Just now',
        status: 'active',
        rateLimitRpm: 500
      }
    ]
  },
  {
    id: 'proj-bharathi-copilot',
    name: 'Bharathi Reasoning & Code Copilot',
    gcpProjectId: 'bharathi-copilot-2026',
    environment: 'research',
    status: 'healthy',
    createdDate: '2026-07-04',
    region: 'us-central1',
    monthlyBudget: 250.00,
    spendMTD: 114.20,
    projectedSpend: 152.30,
    dailyBurnRate: 5.40,
    totalRequests: 19800,
    successRate: 99.9,
    peakRpm: 65,
    quotaRpm: 300,
    peakTpm: 680000,
    quotaTpm: 2000000,
    promptTokens: 84000000,
    outputTokens: 21000000,
    cachedTokens: 38000000,
    cacheSavingsUSD: 41.50,
    alertThresholdPercent: 85,
    autoPauseOnBudgetBreach: true,
    notes: 'Developer copilot executing Python code in secure sandbox containers with Gemini 2.0 Flash Thinking.',
    topToolsBurn: [
      { tool: 'code_execution', spend: 52.40, sharePercent: 45.9 },
      { tool: 'function_calling_loop', spend: 38.60, sharePercent: 33.8 },
      { tool: 'uncached_context_expansion', spend: 14.20, sharePercent: 12.4 }
    ],
    modelUsages: [
      {
        modelId: 'gemini-2.0-flash-thinking',
        modelName: 'Gemini 2.0 Flash Thinking',
        requestCount: 12400,
        promptTokens: 52000000,
        outputTokens: 14000000,
        cachedTokens: 26000000,
        spend: 68.20,
        avgLatencyMs: 640
      },
      {
        modelId: 'gemini-2.5-pro',
        modelName: 'Gemini 2.5 Pro',
        requestCount: 7400,
        promptTokens: 32000000,
        outputTokens: 7000000,
        cachedTokens: 12000000,
        spend: 46.00,
        avgLatencyMs: 980
      }
    ],
    apiKeys: [
      {
        id: 'key-bharathi-copilot',
        name: 'vscode-copilot-plugin',
        keyPrefix: 'AIzaSyT3...8zP9',
        createdDate: '2026-07-04',
        lastUsed: '18 mins ago',
        status: 'active',
        rateLimitRpm: 200
      }
    ]
  },
  {
    id: 'proj-srihari-support',
    name: 'Srihari Live Concierge & Voice Assistant',
    gcpProjectId: 'srihari-voice-support-01',
    environment: 'production',
    status: 'healthy',
    createdDate: '2026-08-01',
    region: 'asia-southeast1',
    monthlyBudget: 300.00,
    spendMTD: 182.50,
    projectedSpend: 228.10,
    dailyBurnRate: 8.60,
    totalRequests: 48900,
    successRate: 99.2,
    peakRpm: 120,
    quotaRpm: 600,
    peakTpm: 980000,
    quotaTpm: 3000000,
    promptTokens: 62000000,
    outputTokens: 28000000,
    cachedTokens: 9000000,
    cacheSavingsUSD: 11.20,
    alertThresholdPercent: 80,
    autoPauseOnBudgetBreach: false,
    notes: 'Bidirectional streaming audio WebSocket sessions for real-time voice assistance.',
    topToolsBurn: [
      { tool: 'live_audio_bidirectional', spend: 118.00, sharePercent: 64.7 },
      { tool: 'google_search_grounding', spend: 42.50, sharePercent: 23.3 },
      { tool: 'function_calling_loop', spend: 18.20, sharePercent: 10.0 }
    ],
    modelUsages: [
      {
        modelId: 'gemini-live-audio',
        modelName: 'Gemini Multimodal Live (WebSocket)',
        requestCount: 48900,
        promptTokens: 62000000,
        outputTokens: 28000000,
        cachedTokens: 9000000,
        spend: 182.50,
        avgLatencyMs: 190
      }
    ],
    apiKeys: [
      {
        id: 'key-srihari-voice',
        name: 'voice-gateway-asia-01',
        keyPrefix: 'AIzaSyW8...2qX1',
        createdDate: '2026-08-01',
        lastUsed: 'Just now',
        status: 'active',
        rateLimitRpm: 500
      }
    ]
  }
];

export const TOOL_BURN_METRICS: ToolBurnMetric[] = [
  {
    id: 'google_search_grounding',
    name: 'Google Search Grounding',
    category: 'Grounding',
    totalCost: 172.70,
    callCount: 4934,
    avgCostPerCall: 0.035,
    percentOfToolSpend: 31.8,
    burnLevel: 'critical',
    description: 'Grounds model answers in Google Search results ($35.00 per 1,000 queries). Frequent runaway cost when enabled unconditionally on every user turn.',
    primaryProjectIds: ['proj-bharathi-primary', 'proj-640868056160', 'proj-srihari-support'],
    recommendation: 'Enable Dynamic Grounding Threshold (set minimum confidence score 0.75) instead of querying Search on every conversational greeting.',
    potentialMonthlySavings: 95.00
  },
  {
    id: 'multimodal_video_ingest',
    name: 'Raw Video Frame Ingestion',
    category: 'Multimodal',
    totalCost: 168.00,
    callCount: 640,
    avgCostPerCall: 0.262,
    percentOfToolSpend: 30.9,
    burnLevel: 'high',
    description: 'Streaming uncompressed 1 FPS video frames to Gemini (258 tokens per second). Rapidly burns both budget and TPM quota limits.',
    primaryProjectIds: ['proj-srihari-vision'],
    recommendation: 'Pre-filter keyframes locally using edge motion detection and reduce sampling rate from 1 FPS to 0.2 FPS (1 frame every 5s).',
    potentialMonthlySavings: 84.00
  },
  {
    id: 'live_audio_bidirectional',
    name: 'Live Audio WebSocket Streaming',
    category: 'Audio Streaming',
    totalCost: 118.00,
    callCount: 2480,
    avgCostPerCall: 0.0475,
    percentOfToolSpend: 21.7,
    burnLevel: 'moderate',
    description: 'Continuous bidirectional 16kHz audio input and 24kHz audio output tokens via the Multimodal Live API.',
    primaryProjectIds: ['proj-srihari-support'],
    recommendation: 'Configure client-side Voice Activity Detection (VAD) to halt audio stream transmission during user silences.',
    potentialMonthlySavings: 42.00
  },
  {
    id: 'function_calling_loop',
    name: 'Agent Multi-Turn Tool Recursion Loop',
    category: 'Agentic Loops',
    totalCost: 115.50,
    callCount: 10200,
    avgCostPerCall: 0.0113,
    percentOfToolSpend: 21.3,
    burnLevel: 'high',
    description: 'Agent calling multiple tools sequentially in an autonomous loop. Full conversation history is re-sent on every turn, exponentially inflating input prompt tokens.',
    primaryProjectIds: ['proj-bharathi-primary', 'proj-bharathi-copilot'],
    recommendation: 'Set max_turns=3 in Agent orchestrator and prune tool payload JSON schemas before re-submitting to the conversation history.',
    potentialMonthlySavings: 55.00
  },
  {
    id: 'multimodal_image_ingest',
    name: 'High-Res Image Processing',
    category: 'Multimodal',
    totalCost: 82.40,
    callCount: 8240,
    avgCostPerCall: 0.010,
    percentOfToolSpend: 15.2,
    burnLevel: 'moderate',
    description: 'High-res image ingestion (258 tokens per 768x768 tile).',
    primaryProjectIds: ['proj-srihari-vision'],
    recommendation: 'Downscale images to 768px maximum dimension prior to upload unless OCR requires sub-pixel resolution.',
    potentialMonthlySavings: 38.00
  },
  {
    id: 'uncached_context_expansion',
    name: 'Uncached Long Context Repetition',
    category: 'Context Waste',
    totalCost: 74.30,
    callCount: 594,
    avgCostPerCall: 0.125,
    percentOfToolSpend: 13.7,
    burnLevel: 'moderate',
    description: 'Re-transmitting static system instructions, legal manuals, and schemas (>100k tokens) on each call without creating a prompt cache.',
    primaryProjectIds: ['proj-bharathi-primary', 'proj-srihari-vision'],
    recommendation: 'Create an explicit CachedContent object via AI Studio caching API. Cuts input token fee from $1.25/1M to $0.01875/1M storage fee.',
    potentialMonthlySavings: 48.00
  },
  {
    id: 'code_execution',
    name: 'Python Sandbox Code Execution',
    category: 'Code Sandbox',
    totalCost: 59.20,
    callCount: 7680,
    avgCostPerCall: 0.0077,
    percentOfToolSpend: 10.9,
    burnLevel: 'low',
    description: 'Runs code snippets in a secure container sandbox. Incurs output token costs for the generated Python script plus stdout return tokens.',
    primaryProjectIds: ['proj-bharathi-copilot', 'proj-640868056160'],
    recommendation: 'Cache unit test execution results across idempotent runs.',
    potentialMonthlySavings: 20.00
  }
];

export const RECENT_REQUEST_TRACES: RequestTrace[] = [
  {
    id: 'req-90101',
    timestamp: '2026-10-07 19:25:12',
    projectId: 'proj-640868056160',
    projectName: 'Google AI Studio Active Workspace',
    model: 'gemini-3.8-flash',
    statusCode: 200,
    latencyMs: 242,
    inputTokens: 1420,
    outputTokens: 380,
    cachedTokens: 1000,
    toolsUsed: ['google_search_grounding'],
    toolCost: 0.035,
    modelCost: 0.0003,
    totalCost: 0.0353,
    cacheHit: true,
    endpoint: 'v1beta.models.generateContent',
    promptPreview: 'Active workspace query: Verify real-time status of GCP Project ais-asia-southeast1-c2963b3f6b...'
  },
  {
    id: 'req-90102',
    timestamp: '2026-10-07 19:23:40',
    projectId: 'proj-srihari-vision',
    projectName: 'Srihari Multimodal Vision & Catalog Inspector',
    model: 'gemini-2.5-flash',
    statusCode: 200,
    latencyMs: 510,
    inputTokens: 32400,
    outputTokens: 420,
    cachedTokens: 0,
    toolsUsed: ['multimodal_video_ingest'],
    toolCost: 0.038,
    modelCost: 0.0026,
    totalCost: 0.0406,
    cacheHit: false,
    endpoint: 'v1beta.models.generateContent',
    promptPreview: 'Multimodal defect detection on retail conveyor belt keyframe sequence (batch #912)...'
  },
  {
    id: 'req-90103',
    timestamp: '2026-10-07 19:21:05',
    projectId: 'proj-bharathi-primary',
    projectName: 'Bharathi Primary AI Studio Engine',
    model: 'gemini-2.5-pro',
    statusCode: 200,
    latencyMs: 890,
    inputTokens: 82000,
    outputTokens: 1450,
    cachedTokens: 75000,
    toolsUsed: ['function_calling_loop'],
    toolCost: 0.012,
    modelCost: 0.0142,
    totalCost: 0.0262,
    cacheHit: true,
    endpoint: 'v1beta.models.generateContent',
    promptPreview: 'Extract regulatory commitments and structured audit table for enterprise client SLA...'
  },
  {
    id: 'req-90104',
    timestamp: '2026-10-07 19:19:18',
    projectId: 'proj-bharathi-copilot',
    projectName: 'Bharathi Reasoning & Code Copilot',
    model: 'gemini-2.0-flash-thinking',
    statusCode: 200,
    latencyMs: 640,
    inputTokens: 18400,
    outputTokens: 2100,
    cachedTokens: 12000,
    toolsUsed: ['code_execution'],
    toolCost: 0.005,
    modelCost: 0.0028,
    totalCost: 0.0078,
    cacheHit: true,
    endpoint: 'v1beta.models.generateContent',
    promptPreview: 'Run Python sandbox unit tests on recursive Fibonacci memoization with concurrency checks...'
  },
  {
    id: 'req-90105',
    timestamp: '2026-10-07 19:16:50',
    projectId: 'proj-srihari-support',
    projectName: 'Srihari Live Concierge & Voice Assistant',
    model: 'gemini-live-audio',
    statusCode: 200,
    latencyMs: 192,
    inputTokens: 3800,
    outputTokens: 1900,
    cachedTokens: 0,
    toolsUsed: ['live_audio_bidirectional'],
    toolCost: 0.021,
    modelCost: 0.0065,
    totalCost: 0.0275,
    cacheHit: false,
    endpoint: 'v1alpha.models.bidiGenerateContent (WebSocket)',
    promptPreview: '[PCM 16kHz Audio Stream] User speaking: "Help me check delivery tracking on order #SG-8891"...'
  }
];

export function computeFinOpsSummary(projects: AIStudioProject[]): FinOpsSummary {
  const totalSpendMTD = projects.reduce((acc, p) => acc + p.spendMTD, 0);
  const totalBudget = projects.reduce((acc, p) => acc + p.monthlyBudget, 0);
  const projectedSpendEOM = projects.reduce((acc, p) => acc + p.projectedSpend, 0);
  const dailyBurnRate = projects.reduce((acc, p) => acc + p.dailyBurnRate, 0);
  const totalRequests = projects.reduce((acc, p) => acc + p.totalRequests, 0);
  const totalPromptTokens = projects.reduce((acc, p) => acc + p.promptTokens, 0);
  const totalOutputTokens = projects.reduce((acc, p) => acc + p.outputTokens, 0);
  const totalCachedTokens = projects.reduce((acc, p) => acc + p.cachedTokens, 0);
  const totalCacheSavingsUSD = projects.reduce((acc, p) => acc + p.cacheSavingsUSD, 0);

  let toolSpendMTD = 0;
  projects.forEach(p => {
    p.topToolsBurn.forEach(t => {
      toolSpendMTD += t.spend;
    });
  });

  const baseModelSpendMTD = Math.max(0, totalSpendMTD - toolSpendMTD);

  const activeProjectsCount = projects.filter(p => p.status === 'healthy' || p.status === 'warning').length;
  const warningProjectsCount = projects.filter(p => p.status === 'warning').length;
  const throttledProjectsCount = projects.filter(p => p.status === 'throttled').length;

  return {
    totalSpendMTD,
    totalBudget,
    projectedSpendEOM,
    dailyBurnRate,
    totalRequests,
    totalPromptTokens,
    totalOutputTokens,
    totalCachedTokens,
    totalCacheSavingsUSD,
    toolSpendMTD,
    baseModelSpendMTD,
    activeProjectsCount,
    warningProjectsCount,
    throttledProjectsCount
  };
}
