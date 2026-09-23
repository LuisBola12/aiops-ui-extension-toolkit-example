/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CriticalAlert {
  severity: number;
  severityLabel: string;
  summary: string;
  resourceName?: string;
  applicationName?: string;
  senderName: string;
  firstOccurrenceTime: string;
  hasIncident?: boolean;
  hasRunbook?: boolean;
  hasCausalRelationship?: boolean;
  acknowledged?: boolean;
}

export default function getCriticalAlerts(
  alertRows: Array<{ fields?: (string | null)[] } | any> = []
): CriticalAlert[] {
  if (!Array.isArray(alertRows)) return [];

  const severityNames: Record<number, string> = {
    6: 'Critical',
    5: 'Major',
    4: 'Minor',
    3: 'Warning',
    2: 'Information',
    1: 'Indeterminate',
    0: 'Clear',
  };

  const results: CriticalAlert[] = [];

  alertRows.forEach(row => {
    // If it's a tabular row format with fields array:
    // Columns: [0: severity, 1: summary, 2: resourceName, 3: applicationName, 4: senderName, 5: firstOccurrenceTime, 6: acknowledged, 7: insights, 8: owner, 9: team]
    if (row && Array.isArray(row.fields)) {
      const fields = row.fields;
      const severity = Number(fields[0]) || 0;
      if (severity >= 5) {
        const insights = fields[7] ? String(fields[7]) : '';
        results.push({
          severity,
          severityLabel: severityNames[severity] || 'Critical',
          summary: fields[1] || 'No summary',
          resourceName: fields[2] || undefined,
          applicationName: fields[3] || undefined,
          senderName: fields[4] || 'Unknown',
          firstOccurrenceTime: fields[5] || '',
          acknowledged: fields[6] === 'true' || fields[6] === true,
          hasIncident: insights.includes('incident') || insights.includes('story'),
          hasRunbook: insights.includes('runbook'),
          hasCausalRelationship: insights.includes('causal'),
        });
      }
    } else if (row && typeof row === 'object') {
      const severity = Number(row.severity) || 0;
      if (severity >= 5) {
        results.push({
          severity,
          severityLabel: severityNames[severity] || (severity === 6 ? 'Critical' : 'Major'),
          summary: row.summary || 'No summary',
          resourceName: row.resourceName || row.resource?.name,
          applicationName: row.applicationName || row.application?.name,
          senderName: row.senderName || row.sender?.name || 'Unknown',
          firstOccurrenceTime: row.firstOccurrenceTime || '',
          acknowledged: !!row.acknowledged,
          hasIncident: Boolean(row.relatedStoryIds?.length || row.hasIncident),
          hasRunbook: Boolean(row.hasRunbook),
          hasCausalRelationship: Boolean(row.hasCausalRelationship),
        });
      }
    }
  });

  return results.slice(0, 50);
}
