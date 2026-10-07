import { ModelId, ToolType } from '../types/aiStudio';

export interface CostSimulationInput {
  model: ModelId;
  promptTokens: number;
  outputTokens: number;
  cachedTokensPercent: number; // 0 to 100%
  searchGroundingCount: number;
  codeExecutionCount: number;
  agentToolTurns: number;
  videoDurationSeconds: number;
  imageCount: number;
  dailyRequests: number;
}

export interface CostSimulationResult {
  costPerRequest: {
    baseInputCost: number;
    cachedInputCost: number;
    outputCost: number;
    searchGroundingCost: number;
    codeExecutionCost: number;
    multimodalIngestCost: number;
    toolRecursionCost: number;
    totalPerRequest: number;
  };
  monthlyProjected: {
    totalSpend: number;
    baseModelSpend: number;
    toolSpend: number;
    toolSpendPercentage: number;
    savingsFromCaching: number;
    potentialSavingsWithOptimizations: number;
  };
}

export function calculateRequestCost(input: CostSimulationInput): CostSimulationResult {
  const isPro = input.model.includes('pro');
  const isFlash = input.model.includes('flash');
  const isLiveAudio = input.model.includes('audio');
  const isImagen = input.model.includes('imagen');

  // Input & Output token rates per 1M tokens
  let inputRatePerM = isPro ? 1.25 : 0.075;
  let outputRatePerM = isPro ? 5.00 : 0.30;

  if (isLiveAudio) {
    inputRatePerM = 0.70;
    outputRatePerM = 2.00;
  }

  // Multimodal video adds 258 tokens per second
  const videoTokens = input.videoDurationSeconds * 258;
  // Images add 258 tokens per image (standard resolution)
  const imageTokens = input.imageCount * 258;
  const multimodalExtraTokens = videoTokens + imageTokens;

  // Agent tool loops compound input tokens across turns:
  // e.g. each turn re-sends prompt + previous turn tool call + return data (~600 tokens extra per turn)
  const recursionCompoundTokens = input.agentToolTurns > 1 
    ? (input.agentToolTurns - 1) * (input.promptTokens * 0.4 + 600)
    : 0;

  const totalEffectivePromptTokens = input.promptTokens + multimodalExtraTokens + recursionCompoundTokens;

  const cachedTokens = Math.floor(totalEffectivePromptTokens * (input.cachedTokensPercent / 100));
  const uncachedTokens = totalEffectivePromptTokens - cachedTokens;

  // Prompt caching gives ~75% discount on cached tokens
  const uncachedInputCost = (uncachedTokens / 1_000_000) * inputRatePerM;
  const cachedInputCost = (cachedTokens / 1_000_000) * (inputRatePerM * 0.25);
  const baseInputCost = uncachedInputCost;

  // What base would cost WITHOUT caching
  const hypotheticalFullCost = (totalEffectivePromptTokens / 1_000_000) * inputRatePerM;
  const cachingSavingsPerReq = hypotheticalFullCost - (uncachedInputCost + cachedInputCost);

  // Output cost
  const outputCost = isImagen 
    ? 0.030 
    : (input.outputTokens / 1_000_000) * outputRatePerM;

  // Tool Costs
  // Search Grounding: $35.00 / 1,000 queries = $0.035 each
  const searchGroundingCost = input.searchGroundingCount * 0.035;

  // Code Execution: $0.005 flat per sandbox container invocation
  const codeExecutionCost = input.codeExecutionCount * 0.005;

  // Multimodal token cost portion
  const multimodalIngestCost = (multimodalExtraTokens / 1_000_000) * inputRatePerM;

  // Agent Recursion extra token cost portion
  const toolRecursionCost = (recursionCompoundTokens / 1_000_000) * inputRatePerM;

  const totalPerRequest = 
    baseInputCost + 
    cachedInputCost + 
    outputCost + 
    searchGroundingCost + 
    codeExecutionCost;

  const monthlyMultiplier = input.dailyRequests * 30;
  const totalMonthlySpend = totalPerRequest * monthlyMultiplier;

  const toolCostPerRequest = searchGroundingCost + codeExecutionCost + toolRecursionCost;
  const totalToolSpend = toolCostPerRequest * monthlyMultiplier;
  const totalBaseModelSpend = Math.max(0, totalMonthlySpend - totalToolSpend);
  const toolSpendPercentage = totalMonthlySpend > 0 ? (totalToolSpend / totalMonthlySpend) * 100 : 0;

  const monthlySavingsFromCaching = Math.max(0, cachingSavingsPerReq * monthlyMultiplier);

  // Calculate potential savings if optimizations are applied:
  // 1. Dynamic search grounding (reduce grounding by 60%)
  // 2. Enable 70% prompt caching if currently 0%
  // 3. Cap tool loops
  let potentialSavings = 0;
  if (input.searchGroundingCount > 0) {
    potentialSavings += (searchGroundingCost * 0.6) * monthlyMultiplier;
  }
  if (input.cachedTokensPercent < 50 && totalEffectivePromptTokens > 20000) {
    potentialSavings += ((totalEffectivePromptTokens * 0.6 / 1_000_000) * inputRatePerM * 0.75) * monthlyMultiplier;
  }
  if (input.agentToolTurns > 2) {
    potentialSavings += (toolRecursionCost * 0.5) * monthlyMultiplier;
  }

  return {
    costPerRequest: {
      baseInputCost: Number(baseInputCost.toFixed(5)),
      cachedInputCost: Number(cachedInputCost.toFixed(5)),
      outputCost: Number(outputCost.toFixed(5)),
      searchGroundingCost: Number(searchGroundingCost.toFixed(5)),
      codeExecutionCost: Number(codeExecutionCost.toFixed(5)),
      multimodalIngestCost: Number(multimodalIngestCost.toFixed(5)),
      toolRecursionCost: Number(toolRecursionCost.toFixed(5)),
      totalPerRequest: Number(totalPerRequest.toFixed(5))
    },
    monthlyProjected: {
      totalSpend: Number(totalMonthlySpend.toFixed(2)),
      baseModelSpend: Number(totalBaseModelSpend.toFixed(2)),
      toolSpend: Number(totalToolSpend.toFixed(2)),
      toolSpendPercentage: Number(toolSpendPercentage.toFixed(1)),
      savingsFromCaching: Number(monthlySavingsFromCaching.toFixed(2)),
      potentialSavingsWithOptimizations: Number(potentialSavings.toFixed(2))
    }
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'k';
  }
  return num.toLocaleString();
}
