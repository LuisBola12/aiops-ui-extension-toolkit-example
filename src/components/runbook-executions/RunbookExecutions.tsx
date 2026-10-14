/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 *
 * RunbookExecutions dashboard — shows runbook execution history and results
 * fetched from the AIOps Runbook Automation v2 REST API.
 */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';
import { InlineLoading, InlineNotification, Tag, Button } from '@carbon/react';

import './runbook-executions.scss';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState } = ReactRenderer.components;

const CLASS = 'runbook-executions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RunbookExecution {
  id: string;
  runbookId: string;
  runbookName: string;
  status: 'success' | 'failed' | 'running' | 'pending' | string;
  startTime: string;
  endTime: string | null;
  triggeredBy: string;
  errorMessage?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_TAG_TYPE: Record<string, string> = {
  success: 'green',
  failed: 'red',
  running: 'blue',
  pending: 'gray',
};

function statusTagType(status: string): string {
  return STATUS_TAG_TYPE[status?.toLowerCase()] ?? 'gray';
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function calcDuration(start: string, end: string | null): string {
  if (!end) return '—';
  try {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 0) return '—';
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
  } catch {
    return '—';
  }
}

// ---------------------------------------------------------------------------
// KPI strip
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: number | string;
  accent?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, accent = '#0f62fe' }) => (
  <div className={`${CLASS}__kpi-card`} style={{ borderLeftColor: accent }}>
    <div className={`${CLASS}__kpi-value`}>{value}</div>
    <div className={`${CLASS}__kpi-label`}>{label}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface RunbookExecutionsProps {
  executions: RunbookExecution[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const RunbookExecutions: React.FC<RunbookExecutionsProps> = ({
  executions,
  loading,
  error,
  onRefresh,
}) => {
  let title = 'Runbook Executions';
  try {
    const { state, app } = useAkoraState();
    if (app && state) {
      const targetUrl = app.resolvePathExpression(state.path);
      const stateForPath = app.getStateForPath(targetUrl);
      if (stateForPath?.title) title = stateForPath.title;
    }
  } catch {
    // keep fallback title
  }

  // ---- derived KPIs -------------------------------------------------------
  const total = executions.length;
  const succeeded = executions.filter(e => e.status?.toLowerCase() === 'success').length;
  const failed = executions.filter(e => e.status?.toLowerCase() === 'failed').length;
  const running = executions.filter(e => e.status?.toLowerCase() === 'running').length;

  return (
    <div className={CLASS} role="main">
      <div className={`${CLASS}__heading-row`}>
        <div className={`${CLASS}__heading`}>{title}</div>
        <Button kind="ghost" size="sm" disabled={loading} onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {/* KPI strip */}
      <div className={`${CLASS}__kpi-row`}>
        <KpiCard label="Total Executions" value={total} accent="#0f62fe" />
        <KpiCard label="Succeeded" value={succeeded} accent="#198038" />
        <KpiCard label="Failed" value={failed} accent="#da1e28" />
        <KpiCard label="Running" value={running} accent="#0043ce" />
      </div>

      {/* Loading / error states */}
      {loading && <InlineLoading description="Loading executions…" />}
      {!loading && error && (
        <InlineNotification
          kind="error"
          title="Error loading runbook executions"
          subtitle={error}
          hideCloseButton
        />
      )}

      {/* Executions table */}
      {!loading && !error && (
        <div className={`${CLASS}__section`}>
          <div className={`${CLASS}__section-title`}>Execution History</div>
          {executions.length === 0 ? (
            <p className={`${CLASS}__empty`}>No runbook executions found.</p>
          ) : (
            <div className={`${CLASS}__table-wrapper`}>
              <table className={`${CLASS}__table`}>
                <thead>
                  <tr>
                    <th>Runbook</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Duration</th>
                    <th>Triggered By</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map(exec => (
                    <tr key={exec.id}>
                      <td className={`${CLASS}__cell-name`}>{exec.runbookName || exec.runbookId}</td>
                      <td>
                        <Tag type={statusTagType(exec.status) as any} size="sm">
                          {exec.status ?? 'unknown'}
                        </Tag>
                      </td>
                      <td>{formatTime(exec.startTime)}</td>
                      <td>{calcDuration(exec.startTime, exec.endTime)}</td>
                      <td>{exec.triggeredBy || '—'}</td>
                      <td className={`${CLASS}__cell-error`}>{exec.errorMessage || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RunbookExecutions;
