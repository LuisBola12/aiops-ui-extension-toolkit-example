/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LocationCountEntry {
  group: string;
  value: number;
}

export default function getAlertLocationCounts(
  alertRows: Array<{ fields?: (string | null)[] } | any> = [],
  limit = 15
): LocationCountEntry[] {
  if (!Array.isArray(alertRows)) return [];

  const counts: Record<string, number> = {};

  alertRows.forEach(row => {
    let loc = 'Unassigned';
    if (row && Array.isArray(row.fields)) {
      // Columns: ['severity', 'resourceName', 'locationName']
      loc = row.fields[2] || row.fields[1] || 'Unassigned';
    } else if (row && typeof row === 'object') {
      loc = row.locationName || row.resourceName || row.resource?.name || 'Unassigned';
    }

    if (loc) {
      counts[loc] = (counts[loc] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([group, value]) => ({ group, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
