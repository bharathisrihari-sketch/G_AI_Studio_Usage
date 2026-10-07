import React, { useState } from 'react';
import { 
  Workflow, 
  Key, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Search, 
  Terminal, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ModelId, ToolType } from '../types/aiStudio';
import { calculateRequestCost, formatCurrency, CostSimulationInput } from '../utils/pricingCalculator';

export const EndToEndTracer: React.FC = () => {
  const [activePipelineStep, setActivePipelineStep] = useState<number>(5);

  // Simulation parameters
  const [simParams, setSimParams] = useState<CostSimulationInput>({
    model: 'gemini-2.5-flash',
    promptTokens: 25000,
    outputTokens: 800,
    cachedTokensPercent: 60,
    searchGroundingCount: 1,
    codeExecutionCount: 0,
    agentToolTurns: 2,
    videoDurationSeconds: 0,
    imageCount: 0,
    dailyRequests: 2500
  });

  const costResult = calculateRequestCost(simParams);

  const pipelineSteps = [
    {
      step: 1,
      title: 'Client SDK & API Key Auth',
      category: 'Authentication',
      icon: Key,
      latency: '15ms',
      cost: '$0.00',
      description: 'Request authenticated using user API Key with project-level restriction (IP / HTTP referrer) and environment routing.',
      details: 'Evaluates project authorization, active key status, and maps request to user GCP Billing Account: 018F42-99B72C-AA4190.'
    },
    {
      step: 2,
      title: 'AI Studio Quota Manager',
      category: 'Rate Limiting',
      icon: ShieldCheck,
      latency: '8ms',
      cost: '$0.00',
      description: 'Enforces RPM and TPM limits against the project allocation tier. Leaky bucket algorithm prevents upstream saturation.',
      details: 'If TPM ceiling exceeded (e.g. >2.5M TPM on Flash), immediately returns HTTP 429 RESOURCE_EXHAUSTED with retry-after header.'
    },
    {
      step: 3,
      title: 'Context Caching Engine',
      category: 'Token Optimization',
      icon: Database,
      latency: '25ms',
      cost: '75% discount',
      description: 'Checks cache lookup table for matching CachedContent hash (system prompts, large legal manuals, schemas).',
      details: 'Cached tokens billed at $0.01875/1M (Flash) instead of $0.075/1M base rate, yielding significant monthly cost reduction.'
    },
    {
      step: 4,
      title: 'Safety & Moderation Layer',
      category: 'Compliance',
      icon: Layers,
      latency: '30ms',
      cost: '$0.00',
      description: 'Pre-flight safety inspection for Hate Speech, Harassment, Sexual Content, and Dangerous Content thresholds.',
      details: 'Blocks non-compliant prompts before heavy model compute cycles are dispatched.'
    },
    {
      step: 5,
      title: 'Model Inference (Step 1)',
      category: 'Generative Core',
      icon: Cpu,
      latency: '220ms',
      cost: 'Tokens in/out',
      description: 'Gemini model analyzes input prompt, reasoning chain, and decides whether external tools or grounding are needed.',
      details: 'If model emits functionCall or grounding search queries, inference suspends to trigger tool executor.'
    },
    {
      step: 6,
      title: 'Tool & Grounding Execution',
      category: 'Tool Burner',
      icon: Search,
      latency: '180ms',
      cost: '$0.035 / query',
      description: 'Dispatches Google Search Grounding queries, Python sandbox execution, or custom client-side function callbacks.',
      details: 'Google Search Grounding incurs $35.00 per 1,000 queries. Multiple agent loops compound this step and inflate downstream prompt context!'
    },
    {
      step: 7,
      title: 'Recursive Context Re-injection',
      category: 'Agentic Loop',
      icon: Sparkles,
      latency: '240ms',
      cost: 'Compounded input',
      description: 'Tool output results are appended to the conversation history, triggering the final response synthesis turn.',
      details: 'Each recursive turn re-transmits the initial prompt plus tool response data, multiplying effective input tokens.'
    },
    {
      step: 8,
      title: 'FinOps Ledger & Cloud Billing',
      category: 'Accounting',
      icon: DollarSign,
      latency: '5ms',
      cost: 'Sub-cent precision',
      description: 'AI Studio records exact prompt tokens, cached tokens, candidate tokens, and tool invocation surcharges to the billing ledger.',
      details: 'Real-time telemetry emitted to Cloud Monitoring and StudioOps project budget cap monitor.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Section: End-to-End Pipeline Visualization */}
      <div className="bg-white border border-neutral-200 rounded p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-50 text-blue-700">
                <Workflow className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                End-to-End AI Studio Request Execution Pipeline
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Trace the exact lifecycle of an API request: from authentication and rate limits to prompt caching, tool execution loops, and financial accounting.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            Click any stage to inspect execution details
          </span>
        </div>

        {/* Pipeline Nodes Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 py-5">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            const isSelected = activePipelineStep === step.step;

            return (
              <button
                key={step.step}
                onClick={() => setActivePipelineStep(step.step)}
                className={`p-3 rounded border text-left transition-all relative flex flex-col justify-between ${
                  isSelected 
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs' 
                    : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      0{step.step}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-300' : 'text-neutral-600'}`} />
                  </div>
                  <div className="text-xs font-semibold leading-tight line-clamp-2">
                    {step.title}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200/40 text-[10px] font-mono flex items-center justify-between">
                  <span className={isSelected ? 'text-neutral-300' : 'text-neutral-500'}>{step.latency}</span>
                  <span className={`font-semibold ${isSelected ? 'text-emerald-300' : 'text-neutral-700'}`}>{step.cost}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Deep Dive Inspector */}
        {(() => {
          const stepData = pipelineSteps.find(s => s.step === activePipelineStep) || pipelineSteps[4];
          return (
            <div className="bg-neutral-50 border border-neutral-200 rounded p-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-900">Stage 0{stepData.step}:</span>
                  <span className="font-bold text-neutral-900">{stepData.title}</span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-600 font-medium">{stepData.category}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-600">
                  <span>Latency Budget: <strong className="text-neutral-900">{stepData.latency}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Cost Impact: <strong className="text-neutral-900">{stepData.cost}</strong></span>
                </div>
              </div>
              <p className="text-neutral-700 mb-2 leading-relaxed">
                {stepData.description}
              </p>
              <div className="text-neutral-600 bg-white p-2.5 rounded border border-neutral-200 font-mono text-[11px]">
                {stepData.details}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Interactive End-to-End Cost & Tool Burn Simulator */}
      <div className="bg-white border border-neutral-200 rounded p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-50 text-emerald-700">
                <Sliders className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Interactive End-to-End Cost & Tool Burn Simulator
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Simulate prompt payload parameters to predict single-request costs, tool vs model burn ratios, and monthly budget impact before deploying.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Real-time Gemini Pricing Engine
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
          
          {/* Controls Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 text-xs">
            
            {/* Model Selection */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1.5">
                Target Gemini Model Architecture
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tag: 'Fast / Low Cost' },
                  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', tag: 'Complex Reasoning' },
                  { id: 'gemini-2.0-flash-thinking', label: 'Flash Thinking', tag: 'Autonomous Logic' },
                  { id: 'gemini-live-audio', label: 'Live Audio Stream', tag: 'Bidirectional Audio' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSimParams({ ...simParams, model: m.id as ModelId })}
                    className={`p-2.5 rounded border text-left transition-colors ${
                      simParams.model === m.id
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="font-semibold">{m.label}</div>
                    <div className={`text-[10px] mt-0.5 ${simParams.model === m.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                      {m.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Token Inputs Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-neutral-700">Prompt / Input Tokens</label>
                  <span className="font-mono tabular-nums font-semibold text-neutral-900">
                    {simParams.promptTokens.toLocaleString()} tokens
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="200000"
                  step="2500"
                  value={simParams.promptTokens}
                  onChange={(e) => setSimParams({ ...simParams, promptTokens: Number(e.target.value) })}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                  <span>500 (Short)</span>
                  <span>100k (Document)</span>
                  <span>200k (Codebase)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-neutral-700">Output Candidate Tokens</label>
                  <span className="font-mono tabular-nums font-semibold text-neutral-900">
                    {simParams.outputTokens.toLocaleString()} tokens
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="8000"
                  step="100"
                  value={simParams.outputTokens}
                  onChange={(e) => setSimParams({ ...simParams, outputTokens: Number(e.target.value) })}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                  <span>100 (Concise)</span>
                  <span>2,000</span>
                  <span>8,000 (Detailed)</span>
                </div>
              </div>
            </div>

            {/* Prompt Caching Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-neutral-700 flex items-center gap-1.5">
                  <span>Context Caching Coverage</span>
                  <span className="text-[10px] font-normal text-emerald-700 font-mono">(75% discount on cached tokens)</span>
                </label>
                <span className="font-mono tabular-nums font-semibold text-emerald-700">
                  {simParams.cachedTokensPercent}% Cached
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={simParams.cachedTokensPercent}
                onChange={(e) => setSimParams({ ...simParams, cachedTokensPercent: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Tool Burn Levers: Grounding & Agent Turns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  Google Search Grounding
                </label>
                <select
                  value={simParams.searchGroundingCount}
                  onChange={(e) => setSimParams({ ...simParams, searchGroundingCount: Number(e.target.value) })}
                  className="w-full border border-neutral-200 rounded p-1.5 bg-neutral-50 text-neutral-800"
                >
                  <option value={0}>Disabled ($0.00)</option>
                  <option value={1}>1 Search Query ($0.035)</option>
                  <option value={2}>2 Search Queries ($0.070)</option>
                  <option value={4}>4 Search Queries ($0.140)</option>
                </select>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">$35.00 / 1k queries</span>
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  Agent Multi-Turn Loops
                </label>
                <select
                  value={simParams.agentToolTurns}
                  onChange={(e) => setSimParams({ ...simParams, agentToolTurns: Number(e.target.value) })}
                  className="w-full border border-neutral-200 rounded p-1.5 bg-neutral-50 text-neutral-800"
                >
                  <option value={1}>1 Turn (Direct)</option>
                  <option value={2}>2 Turns (Tool + Reply)</option>
                  <option value={3}>3 Turns (Deep Agent)</option>
                  <option value={5}>5 Turns (Heavy Loop)</option>
                </select>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">Re-injects full context</span>
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  Python Code Execution
                </label>
                <select
                  value={simParams.codeExecutionCount}
                  onChange={(e) => setSimParams({ ...simParams, codeExecutionCount: Number(e.target.value) })}
                  className="w-full border border-neutral-200 rounded p-1.5 bg-neutral-50 text-neutral-800"
                >
                  <option value={0}>Disabled</option>
                  <option value={1}>1 Execution Run ($0.005)</option>
                  <option value={2}>2 Execution Runs ($0.010)</option>
                </select>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">Sandbox container run</span>
              </div>
            </div>

            {/* Daily Request Volume */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-neutral-700">Projected Daily Query Volume</label>
                <span className="font-mono tabular-nums font-semibold text-neutral-900">
                  {simParams.dailyRequests.toLocaleString()} requests/day
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="50000"
                step="500"
                value={simParams.dailyRequests}
                onChange={(e) => setSimParams({ ...simParams, dailyRequests: Number(e.target.value) })}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

          </div>

          {/* Simulation Output Cards & FinOps Ledger (5 Cols) */}
          <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200 rounded p-4 text-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                FinOps Simulation Projection
              </div>

              {/* Cost Per Single Request */}
              <div className="bg-white p-3 rounded border border-neutral-200 mb-3">
                <span className="text-neutral-500 text-[11px] block">Single Request Cost</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
                  ${costResult.costPerRequest.totalPerRequest.toFixed(5)}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
                  <span>Base Model: ${costResult.costPerRequest.baseInputCost + costResult.costPerRequest.cachedInputCost + costResult.costPerRequest.outputCost}</span>
                  <span className="text-amber-700 font-medium">Tools: ${costResult.costPerRequest.searchGroundingCost + costResult.costPerRequest.codeExecutionCost}</span>
                </div>
              </div>

              {/* Monthly Projected Total */}
              <div className="bg-white p-3 rounded border border-neutral-200 mb-3">
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Projected Monthly Spend</span>
                  <span className="font-mono text-neutral-400">30-day run</span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight mt-0.5">
                  {formatCurrency(costResult.monthlyProjected.totalSpend)}
                </div>
                
                {/* Visual Tool vs Model bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                    <span>Model: {100 - Math.round(costResult.monthlyProjected.toolSpendPercentage)}%</span>
                    <span className="text-amber-700 font-medium">Tools Burn: {Math.round(costResult.monthlyProjected.toolSpendPercentage)}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 rounded-full flex overflow-hidden">
                    <div 
                      style={{ width: `${100 - costResult.monthlyProjected.toolSpendPercentage}%` }} 
                      className="bg-blue-600"
                    />
                    <div 
                      style={{ width: `${costResult.monthlyProjected.toolSpendPercentage}%` }} 
                      className="bg-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Ledger Breakdown */}
              <div className="space-y-1.5 py-2 font-mono text-[11px]">
                <div className="flex justify-between text-neutral-600">
                  <span>Input Tokens ({simParams.promptTokens.toLocaleString()} tok)</span>
                  <span>${costResult.costPerRequest.baseInputCost.toFixed(5)}</span>
                </div>
                {costResult.costPerRequest.cachedInputCost > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Cached Tokens Discount</span>
                    <span>-${(costResult.costPerRequest.baseInputCost * 0.75).toFixed(5)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Output Candidate Tokens</span>
                  <span>${costResult.costPerRequest.outputCost.toFixed(5)}</span>
                </div>
                {costResult.costPerRequest.searchGroundingCost > 0 && (
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span>Google Search Grounding ({simParams.searchGroundingCount}x)</span>
                    <span>${costResult.costPerRequest.searchGroundingCost.toFixed(3)}</span>
                  </div>
                )}
                {costResult.costPerRequest.codeExecutionCost > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>Code Execution ({simParams.codeExecutionCount}x)</span>
                    <span>${costResult.costPerRequest.codeExecutionCost.toFixed(3)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Savings Callout */}
            {costResult.monthlyProjected.savingsFromCaching > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-emerald-950 text-[11px] mt-2">
                <span className="font-semibold block text-emerald-900">
                  Prompt Caching Dividend:
                </span>
                Saves <strong className="font-mono">{formatCurrency(costResult.monthlyProjected.savingsFromCaching)}/month</strong> compared to submitting raw uncached prompt tokens on every call.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
