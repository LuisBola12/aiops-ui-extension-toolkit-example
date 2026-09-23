/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AiContextInput {
  kpis?: any;
  topApplications?: any[];
  bySender?: any[];
  byType?: any[];
  criticalAlerts?: any[];
}

export default function buildAiContext(input: AiContextInput = {}): string {
  try {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        kpiSummary: input.kpis || {},
        topApplications: input.topApplications || [],
        sourceBreakdown: {
          bySender: input.bySender || [],
          byType: input.byType || []
        },
        criticalAlertCount: input.criticalAlerts?.length || 0,
        sampleCriticalAlerts: (input.criticalAlerts || []).slice(0, 5).map(a => ({
          severity: a.severityLabel,
          summary: a.summary,
          resource: a.resourceName,
          sender: a.senderName
        }))
      },
      null,
      2
    );
  } catch {
    return '';
  }
}
