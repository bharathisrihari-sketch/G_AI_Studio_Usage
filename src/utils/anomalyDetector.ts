import { RequestTrace, AIStudioProject, AnomalyEvent } from '../types/aiStudio';

export function detectAnomaliesFromTraces(
  recentTraces: RequestTrace[],
  projects: AIStudioProject[]
): AnomalyEvent[] {
  const anomalies: AnomalyEvent[] = [];

  // Group traces by project
  const projectTraceMap: Record<string, RequestTrace[]> = {};
  recentTraces.forEach(trace => {
    if (!projectTraceMap[trace.projectId]) {
      projectTraceMap[trace.projectId] = [];
    }
    projectTraceMap[trace.projectId].push(trace);
  });

  // Evaluate each project
  projects.forEach(project => {
    const traces = projectTraceMap[project.id] || [];
    if (traces.length === 0) return;

    // 1. Check error rate spike (HTTP 429 / 500)
    const errorTraces = traces.filter(t => t.statusCode >= 400);
    const errorRatePercent = (errorTraces.length / traces.length) * 100;

    if (errorRatePercent > 5 && traces.length >= 5) {
      anomalies.push({
        id: `anom-err-${project.id}-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        projectName: project.name,
        type: 'error_rate_surge',
        severity: errorRatePercent > 15 ? 'critical' : 'high',
        detectedAt: 'Just now',
        headline: `HTTP ${errorTraces[0]?.statusCode || 429} Rate Surge (${errorRatePercent.toFixed(1)}%)`,
        description: `Uncharacteristic error rate surge detected on ${project.name}. ${errorTraces.length} of last ${traces.length} requests failed due to rate limits or quota exhaustion.`,
        metricCurrent: `${errorRatePercent.toFixed(1)}% failures`,
        metricBaseline: '< 0.5% nominal',
        deviationPercent: Math.round(errorRatePercent * 10),
        suggestedAction: 'Enable client exponential backoff or request TPM quota elevation in GCP Console.',
        isResolved: false
      });
    }

    // 2. Check spend / burn velocity spike
    const totalRecentSpend = traces.reduce((acc, t) => acc + t.totalCost, 0);
    const avgRecentCostPerReq = totalRecentSpend / traces.length;

    // Nominal baseline is ~$0.012 per request on Flash
    if (avgRecentCostPerReq > 0.045 && traces.length >= 3) {
      anomalies.push({
        id: `anom-spend-${project.id}-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        projectName: project.name,
        type: 'spend_spike',
        severity: avgRecentCostPerReq > 0.08 ? 'critical' : 'high',
        detectedAt: '2 mins ago',
        headline: `Uncharacteristic Spend Acceleration ($${avgRecentCostPerReq.toFixed(4)}/req)`,
        description: `High cost density detected. Requests are consuming 3.2x more budget than baseline due to repeated search grounding queries ($0.035 each) or deep agent recursion.`,
        metricCurrent: `$${avgRecentCostPerReq.toFixed(4)}/call`,
        metricBaseline: '$0.0120/call baseline',
        deviationPercent: Math.round(((avgRecentCostPerReq - 0.012) / 0.012) * 100),
        suggestedAction: 'Set dynamic grounding confidence threshold (score > 0.75) and enforce agent max_turns=3.',
        isResolved: false
      });
    }

    // 3. Check tool runaway loop
    const toolCallCount = traces.reduce((acc, t) => acc + t.toolsUsed.length, 0);
    const avgToolsPerRequest = toolCallCount / traces.length;

    if (avgToolsPerRequest >= 1.8 && traces.length >= 4) {
      anomalies.push({
        id: `anom-tool-${project.id}-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        projectName: project.name,
        type: 'tool_runaway',
        severity: 'high',
        detectedAt: '5 mins ago',
        headline: `Multi-Tool Runaway Loop Detected (${avgToolsPerRequest.toFixed(1)} tools/req)`,
        description: `Agent loops on ${project.name} are invoking compounding tools and re-transmitting entire conversation history across multiple turns.`,
        metricCurrent: `${avgToolsPerRequest.toFixed(1)} tool executions/call`,
        metricBaseline: '0.4 tool calls nominal',
        deviationPercent: Math.round((avgToolsPerRequest / 0.4) * 100),
        suggestedAction: 'Cap recursive tool loop turns and summarize intermediate tool outputs before re-injection.',
        isResolved: false
      });
    }
  });

  return anomalies;
}

export function generate30DayTrendData(projects: AIStudioProject[]) {
  const points = [];
  const now = new Date(2026, 9, 7); // Oct 07, 2026

  let runningCumulative = 680;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = d.getDate().toString().padStart(2, '0');
    const label = `${monthStr}/${dayStr}`;
    const fullDate = d.toISOString().split('T')[0];

    // Day of week seasonality (higher on weekdays)
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const activityFactor = isWeekend ? 0.65 : 1.15;

    // Simulate steady growth with sudden spike around 3 days ago
    const spikeFactor = (i >= 2 && i <= 4) ? 1.7 : 1.0;

    const baseDailySpend = (24 + Math.sin(i * 0.4) * 6 + (30 - i) * 0.6) * activityFactor * spikeFactor;
    const dailySpend = Number(baseDailySpend.toFixed(2));
    runningCumulative += dailySpend;

    const promptTokens = Math.round((dailySpend * 520000) * (1 + Math.random() * 0.2));
    const outputTokens = Math.round((dailySpend * 85000) * (1 + Math.random() * 0.15));
    const cachedTokens = Math.round(promptTokens * 0.45);
    const totalTokens = promptTokens + outputTokens;

    const requestsCount = Math.round(dailySpend * 140);
    const errorCount = (i >= 2 && i <= 4) ? Math.round(requestsCount * 0.08) : Math.round(requestsCount * 0.005);

    // Project breakdown
    const projectSpendBreakdown: Record<string, number> = {};
    projects.forEach((p, idx) => {
      const share = [0.15, 0.35, 0.28, 0.12, 0.10][idx % 5] || 0.2;
      projectSpendBreakdown[p.id] = Number((dailySpend * share).toFixed(2));
    });

    points.push({
      date: label,
      fullDate,
      totalSpend: dailySpend,
      cumulativeSpend: Number(runningCumulative.toFixed(2)),
      promptTokens,
      outputTokens,
      cachedTokens,
      totalTokens,
      requestsCount,
      errorCount,
      ...projectSpendBreakdown
    });
  }

  return points;
}
