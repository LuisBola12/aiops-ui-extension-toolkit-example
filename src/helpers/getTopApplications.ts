/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApplicationAlertCount {
  name: string;
  alertCount: number;
}

export default function getTopApplications(
  alertRows: Array<{ fields?: (string | null)[] } | any> = [],
  limit = 10
): ApplicationAlertCount[] {
  if (!Array.isArray(alertRows)) return [];

  const counts: Record<string, number> = {};

  alertRows.forEach(row => {
    let appName = 'Unknown';
    if (row && Array.isArray(row.fields)) {
      appName = row.fields[3] || row.fields[2] || 'Unassigned';
    } else if (row && typeof row === 'object') {
      appName = row.applicationName || row.application?.name || row.resourceName || row.resource?.name || 'Unassigned';
    }

    if (appName) {
      counts[appName] = (counts[appName] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([name, alertCount]) => ({ name, alertCount }))
    .sort((a, b) => b.alertCount - a.alertCount)
    .slice(0, limit);
}
