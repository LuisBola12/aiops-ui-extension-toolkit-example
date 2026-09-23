/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { SEVERITIES } from '../components/constants';

export interface FilterSummaryEntry {
  filterName: string;
  summary: Array<{ severity: number; count: number }>;
}

export interface GroupedBarDataPoint {
  group: string;
  filterName: string;
  value: number;
}

export default function getAlertSeverityByFilter(
  filterSummaries: FilterSummaryEntry[] = []
): GroupedBarDataPoint[] {
  if (!Array.isArray(filterSummaries) || filterSummaries.length === 0) {
    return [];
  }

  const result: GroupedBarDataPoint[] = [];

  filterSummaries.forEach(filterEntry => {
    const fName = filterEntry.filterName || 'Filter';
    const summaryList = filterEntry.summary || [];

    SEVERITIES.forEach((sevName, idx) => {
      const match = summaryList.find(s => Number(s.severity) === idx);
      const val = match ? Number(match.count) || 0 : 0;
      result.push({
        group: sevName,
        filterName: fName,
        value: val
      });
    });
  });

  return result;
}
