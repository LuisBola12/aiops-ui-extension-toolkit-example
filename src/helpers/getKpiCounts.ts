/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KpiCounts {
  totalAlerts: number;
  criticalAlerts: number;
  majorAlerts: number;
  totalIncidents: number;
  p1Incidents: number;
  unassignedIncidents: number;
}

export default function getKpiCounts(
  summaryEntries: Array<{ severity: number; count: number }> = [],
  stories: any[] = []
): KpiCounts {
  let totalAlerts = 0;
  let criticalAlerts = 0;
  let majorAlerts = 0;

  if (Array.isArray(summaryEntries)) {
    summaryEntries.forEach(entry => {
      const count = Number(entry.count) || 0;
      totalAlerts += count;
      if (entry.severity === 6) {
        criticalAlerts += count;
      } else if (entry.severity === 5) {
        majorAlerts += count;
      }
    });
  }

  const totalIncidents = Array.isArray(stories) ? stories.length : 0;
  const p1Incidents = Array.isArray(stories)
    ? stories.filter(s => s?.priority === 1 || s?.priority === '1' || s?.priority === 'P1').length
    : 0;
  const unassignedIncidents = Array.isArray(stories)
    ? stories.filter(s => !s?.owner || s?.owner === 'Unassigned' || s?.owner === '').length
    : 0;

  return {
    totalAlerts,
    criticalAlerts,
    majorAlerts,
    totalIncidents,
    p1Incidents,
    unassignedIncidents
  };
}
