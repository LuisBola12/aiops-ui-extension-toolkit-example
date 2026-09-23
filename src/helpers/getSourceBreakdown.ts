/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PieChartDataPoint {
  group: string;
  value: number;
}

export interface SourceBreakdown {
  bySender: PieChartDataPoint[];
  byType: PieChartDataPoint[];
}

export default function getSourceBreakdown(
  alertRows: Array<{ fields?: (string | null)[] } | any> = []
): SourceBreakdown {
  const senderCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};

  if (Array.isArray(alertRows)) {
    alertRows.forEach(row => {
      let sender = 'Other';
      let alertType = 'General';

      if (row && Array.isArray(row.fields)) {
        // [0: severity, 1: summary, 2: resourceName, 3: applicationName, 4: senderName, ...]
        sender = row.fields[4] || 'Other';
        alertType = row.fields[7] ? 'Insight / AI' : 'Standard';
      } else if (row && typeof row === 'object') {
        sender = row.senderName || row.sender?.name || 'Other';
        alertType = row.type?.classification || row.alertType || 'Standard';
      }

      senderCounts[sender] = (senderCounts[sender] || 0) + 1;
      typeCounts[alertType] = (typeCounts[alertType] || 0) + 1;
    });
  }

  const bySender = Object.entries(senderCounts).map(([group, value]) => ({ group, value }));
  const byType = Object.entries(typeCounts).map(([group, value]) => ({ group, value }));

  return { bySender, byType };
}
