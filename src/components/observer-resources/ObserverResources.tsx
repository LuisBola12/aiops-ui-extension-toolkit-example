/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 *
 * ObserverResources dashboard — shows the number of topology resources
 * discovered per observer, using the ASM / Topology v2 REST API.
 */

import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
// @ts-ignore
import { SimpleBarChart } from '@carbon/charts-react';
// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';
import { InlineLoading, InlineNotification, Button } from '@carbon/react';

import { PLEASANT_COLORS } from '../constants';

import '@carbon/charts-react/styles.css';
import './observer-resources.scss';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState } = ReactRenderer.components;

const CLASS = 'observer-resources';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ObserverSummary {
  observerId: string;
  observerName: string;
  resourceCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string | null): string {
  if (!iso) return 'never';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// KPI card
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

interface ObserverResourcesProps {
  observers: ObserverSummary[];
  loading: boolean;
  error: string | null;
  lastRefreshed: string | null;
  onRefresh: () => void;
}

const ObserverResources: React.FC<ObserverResourcesProps> = ({
  observers,
  loading,
  error,
  lastRefreshed,
  onRefresh,
}) => {
  let title = 'Observer Resource Discovery';
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
  const totalObservers = observers.length;
  const totalResources = observers.reduce((sum, o) => sum + o.resourceCount, 0);
  const maxObserver = observers.reduce(
    (best, o) => (o.resourceCount > (best?.resourceCount ?? -1) ? o : best),
    null as ObserverSummary | null
  );

  // ---- bar chart data -----------------------------------------------------
  const barData = useMemo(
    () =>
      [...observers]
        .sort((a, b) => b.resourceCount - a.resourceCount)
        .map(o => ({ group: o.observerName || o.observerId, value: o.resourceCount })),
    [observers]
  );

  const barOptions = useMemo(
    () => ({
      axes: {
        left: { title: 'Resources discovered', mapsTo: 'value', scaleType: 'linear' },
        bottom: { title: 'Observer', mapsTo: 'group', scaleType: 'labels' },
      },
      bars: { maxWidth: 48 },
      data: { loading },
      height: '320px',
      legend: { enabled: false },
      getFillColor: (_g: string, _l: any, _d: any, idx: number) =>
        PLEASANT_COLORS[idx % PLEASANT_COLORS.length] ?? '#0f62fe',
    }),
    [loading]
  );

  return (
    <div className={CLASS} role="main">
      <div className={`${CLASS}__heading-row`}>
        <div className={`${CLASS}__heading`}>{title}</div>
        <div className={`${CLASS}__heading-meta`}>
          {lastRefreshed && (
            <span className={`${CLASS}__last-refresh`}>Last refreshed: {formatTime(lastRefreshed)}</span>
          )}
          <Button kind="ghost" size="sm" disabled={loading} onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className={`${CLASS}__kpi-row`}>
        <KpiCard label="Observers" value={totalObservers} accent="#0f62fe" />
        <KpiCard label="Total Resources" value={totalResources} accent="#198038" />
        <KpiCard
          label="Largest Observer"
          value={maxObserver ? `${maxObserver.observerName || maxObserver.observerId} (${maxObserver.resourceCount})` : '—'}
          accent="#8a3ffc"
        />
      </div>

      {/* Loading / error */}
      {loading && <InlineLoading description="Loading observer data…" />}
      {!loading && error && (
        <InlineNotification
          kind="error"
          title="Error loading observer resources"
          subtitle={error}
          hideCloseButton
        />
      )}

      {!loading && !error && (
        <>
          {/* Bar chart */}
          <div className={`${CLASS}__section`}>
            <div className={`${CLASS}__section-title`}>Resources Discovered per Observer</div>
            {barData.length === 0 ? (
              <p className={`${CLASS}__empty`}>No observer data available.</p>
            ) : (
              <SimpleBarChart data={barData} options={barOptions} />
            )}
          </div>

          {/* Detail table */}
          <div className={`${CLASS}__section`}>
            <div className={`${CLASS}__section-title`}>Observer Summary</div>
            {observers.length === 0 ? (
              <p className={`${CLASS}__empty`}>No observers found.</p>
            ) : (
              <div className={`${CLASS}__table-wrapper`}>
                <table className={`${CLASS}__table`}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Observer Name</th>
                      <th>Observer ID</th>
                      <th>Resources Discovered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...observers]
                      .sort((a, b) => b.resourceCount - a.resourceCount)
                      .map((obs, idx) => (
                        <tr key={obs.observerId}>
                          <td>{idx + 1}</td>
                          <td className={`${CLASS}__cell-name`}>{obs.observerName || '—'}</td>
                          <td className={`${CLASS}__cell-id`}>{obs.observerId}</td>
                          <td>
                            <strong>{obs.resourceCount.toLocaleString()}</strong>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ObserverResources;
