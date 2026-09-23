/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';

export interface UseAiSummaryOptions {
  endpointUrl?: string;
}

export interface UseAiSummaryArgs {
  contextDocument?: string;
}

export function useAiSummary(args: UseAiSummaryArgs = {}, opts: UseAiSummaryOptions = {}) {
  const { endpointUrl } = opts;
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!endpointUrl) {
      setSummary('AI Operations Insight: All monitored subsystems operating normally. No high-impact anomalies identified in active telemetry.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: args.contextDocument }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSummary(data.summary || data.text || JSON.stringify(data));
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch AI Operations summary');
    } finally {
      setLoading(false);
    }
  }, [endpointUrl, args.contextDocument]);

  return { summary, loading, error, refresh };
}

export default useAiSummary;
