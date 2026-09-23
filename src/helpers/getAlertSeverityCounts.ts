/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { SEVERITIES } from '../components/constants';

export interface SeverityCountEntry {
  group: string;
  value: number;
}

export default function getAlertSeverityCounts(
  summaryEntries: Array<{ severity: number; count: number }> = []
): SeverityCountEntry[] {
  if (!Array.isArray(summaryEntries)) return [];

  const counts: Record<string, number> = {};
  SEVERITIES.forEach(sev => {
    counts[sev] = 0;
  });

  summaryEntries.forEach(entry => {
    const sevIdx = Number(entry.severity);
    const sevName = SEVERITIES[sevIdx] || `Severity ${sevIdx}`;
    counts[sevName] = (counts[sevName] || 0) + (Number(entry.count) || 0);
  });

  return SEVERITIES.map(group => ({
    group,
    value: counts[group] || 0
  }));
}
