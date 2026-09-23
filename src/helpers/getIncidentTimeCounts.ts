/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimeCountEntry {
  group: string;
  date: string;
  value: number;
}

export default function getIncidentTimeCounts(stories: any[] = []): TimeCountEntry[] {
  if (!Array.isArray(stories) || stories.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    return [
      { group: 'Priority 1', date: today, value: 0 },
      { group: 'Priority 2', date: today, value: 0 },
      { group: 'Priority 3', date: today, value: 0 },
      { group: 'Priority 4', date: today, value: 0 },
    ];
  }

  const counts: Record<string, Record<string, number>> = {
    'Priority 1': {},
    'Priority 2': {},
    'Priority 3': {},
    'Priority 4': {},
  };

  const datesSet = new Set<string>();

  stories.forEach(story => {
    const priorityNum = Number(story?.priority);
    const groupName =
      priorityNum === 1
        ? 'Priority 1'
        : priorityNum === 2
        ? 'Priority 2'
        : priorityNum === 3
        ? 'Priority 3'
        : 'Priority 4';

    const rawTime = story?.createdTime || story?.firstOccurrenceTime || story?.createTime;
    let dateStr = new Date().toISOString().split('T')[0];
    if (rawTime) {
      try {
        dateStr = new Date(rawTime).toISOString().split('T')[0];
      } catch {
        // fallback
      }
    }
    datesSet.add(dateStr);
    counts[groupName][dateStr] = (counts[groupName][dateStr] || 0) + 1;
  });

  const sortedDates = Array.from(datesSet).sort();
  const result: TimeCountEntry[] = [];

  ['Priority 1', 'Priority 2', 'Priority 3', 'Priority 4'].forEach(group => {
    sortedDates.forEach(date => {
      result.push({
        group,
        date,
        value: counts[group][date] || 0,
      });
    });
  });

  return result;
}
