/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 *
 * Panel wiring for ObserverResources dashboard.
 *
 * Data source: ASM / Topology v2 REST API
 *   GET /api/v2/observers                                    — list observers
 *   GET /api/v2/resources?_filter=observers::<id>&_limit=0   — count resources
 *
 * Auth: bearer token from window.akoraConfig.baseState.bearerToken
 * Base URL: asmProxyEndpoint prop (injected by createPanel / Akora framework)
 */

import React, { useCallback, useEffect, useState } from 'react';
import createPanel from '../app/createPanel';
import ObserverResources, { ObserverSummary } from '../components/observer-resources/ObserverResources';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the bearer token from the Akora global config, or an empty string.
 */
function getBearerToken(): string {
  return (window as any)?.akoraConfig?.baseState?.bearerToken ?? '';
}

/**
 * Builds fetch headers with an optional Authorization header.
 */
function makeHeaders(): HeadersInit {
  const token = getBearerToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Normalises a single observer record from the v2 API.
 */
function normaliseObserver(raw: any): { id: string; name: string } {
  return {
    id: raw.id ?? raw._id ?? raw.observerId ?? String(Math.random()),
    name:
      raw.name ??
      raw.displayName ??
      raw.observerName ??
      raw.id ??
      '',
  };
}

// ---------------------------------------------------------------------------
// Panel component
// ---------------------------------------------------------------------------

const ObserverResourcesPanel = (props: any) => {
  // asmProxyEndpoint is the base URL for ASM/Topology REST calls,
  // threaded through createPanel from the Akora framework.
  const { asmProxyEndpoint } = props;

  const [observers, setObservers] = useState<ObserverSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    const base = asmProxyEndpoint ?? '';
    const headers = makeHeaders();

    // Step 1 — fetch the list of observers
    fetch(`${base}/api/v2/observers`, { headers })
      .then(res => {
        if (!res.ok) throw new Error(`GET /api/v2/observers — HTTP ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: any) => {
        // v2 API may wrap the list under different keys
        const rawList: any[] = Array.isArray(data)
          ? data
          : (data?.observers ?? data?.items ?? data?.data ?? []);

        const observerList = rawList.map(normaliseObserver);

        if (observerList.length === 0) {
          setObservers([]);
          setLastRefreshed(new Date().toISOString());
          setLoading(false);
          return;
        }

        // Step 2 — for each observer, fetch its resource count using _limit=0
        // (_limit=0 returns only metadata + totalCount without payload)
        Promise.all(
          observerList.map(obs =>
            fetch(
              `${base}/api/v2/resources?_filter=observers::${encodeURIComponent(obs.id)}&_limit=0`,
              { headers }
            )
              .then(res => {
                if (!res.ok) return { count: 0 };
                return res.json();
              })
              .then((res: any) => ({
                observerId: obs.id,
                observerName: obs.name,
                // v2 may surface the total in _metadata.totalCount, total, or count
                resourceCount:
                  res?._metadata?.totalCount ??
                  res?.totalCount ??
                  res?.total ??
                  res?.count ??
                  (Array.isArray(res) ? res.length : 0),
              }))
              .catch((): ObserverSummary => ({
                observerId: obs.id,
                observerName: obs.name,
                resourceCount: 0,
              }))
          )
        ).then((summaries: ObserverSummary[]) => {
          setObservers(summaries);
          setLastRefreshed(new Date().toISOString());
          setLoading(false);
        });
      })
      .catch((err: Error) => {
        setError(err.message ?? String(err));
        setObservers([]);
        setLoading(false);
      });
  }, [asmProxyEndpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return React.createElement(ObserverResources, {
    observers,
    loading,
    error,
    lastRefreshed,
    onRefresh: fetchData,
  });
};

export default createPanel(ObserverResourcesPanel);
