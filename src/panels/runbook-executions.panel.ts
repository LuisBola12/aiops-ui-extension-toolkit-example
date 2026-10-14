/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 *
 * Panel wiring for RunbookExecutions dashboard.
 *
 * Data source: AIOps Runbook Automation v2 REST API
 *   GET /api/v2/runbooks/executions
 *
 * Auth: bearer token from window.akoraConfig.baseState.bearerToken
 * Base URL: dashOriginUrl prop (injected by createPanel / Akora framework)
 */

import React, { useCallback, useEffect, useState } from 'react';
import createPanel from '../app/createPanel';
import RunbookExecutions, { RunbookExecution } from '../components/runbook-executions/RunbookExecutions';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalises a single execution record returned by the v2 API into the
 * shape expected by the RunbookExecutions component.
 */
function normaliseExecution(raw: any): RunbookExecution {
  return {
    id: raw.id ?? raw._id ?? String(Math.random()),
    runbookId: raw.runbookId ?? raw.runbook_id ?? '',
    runbookName: raw.runbookName ?? raw.runbook_name ?? raw.name ?? raw.runbookId ?? '',
    status: raw.status ?? raw.state ?? 'unknown',
    startTime: raw.startTime ?? raw.start_time ?? raw.createdTime ?? '',
    endTime: raw.endTime ?? raw.end_time ?? raw.finishedTime ?? null,
    triggeredBy: raw.triggeredBy ?? raw.triggered_by ?? raw.owner ?? '',
    errorMessage: raw.errorMessage ?? raw.error ?? raw.message ?? '',
  };
}

// ---------------------------------------------------------------------------
// Panel component
// ---------------------------------------------------------------------------

const RunbookExecutionsPanel = (props: any) => {
  const { dashOriginUrl } = props;

  const [executions, setExecutions] = useState<RunbookExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExecutions = useCallback(() => {
    setLoading(true);
    setError(null);

    // Resolve the bearer token from Akora's global config
    const token: string =
      (window as any)?.akoraConfig?.baseState?.bearerToken ?? '';

    const baseUrl = dashOriginUrl ?? '';
    const url = `${baseUrl}/api/v2/runbooks/executions`;

    fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: any) => {
        // v2 API may return { executions: [...] } or a bare array
        const raw: any[] = Array.isArray(data)
          ? data
          : (data?.executions ?? data?.items ?? data?.data ?? []);
        setExecutions(raw.map(normaliseExecution));
      })
      .catch((err: Error) => {
        setError(err.message ?? String(err));
        setExecutions([]);
      })
      .finally(() => setLoading(false));
  }, [dashOriginUrl]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  return React.createElement(RunbookExecutions, {
    executions,
    loading,
    error,
    onRefresh: fetchExecutions,
  });
};

export default createPanel(RunbookExecutionsPanel);
