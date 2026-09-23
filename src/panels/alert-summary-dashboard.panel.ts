/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 *
 * Panel wiring file for AlertSummaryDashboard.
 */

import React from 'react';
import { useQuery } from '../helpers/useQuery';
import createPanel from '../app/createPanel';
import AlertSummaryDashboard from '../components/alert-summary-dashboard/AlertSummaryDashboard';

const TENANT_ID = 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255';

const AlertSummaryDashboardPanel = () => {
  const alertsQuery = useQuery('getAlerts', {
    tenantId: TENANT_ID,
    columns: ['severity', 'resourceName', 'locationName'],
    format: 'FULL'
  });

  const alertSummaryQuery = useQuery('getAlerts', {
    tenantId: TENANT_ID,
    columns: ['severity'],
    format: 'SUMMARY'
  });

  return React.createElement(AlertSummaryDashboard, {
    alertsQuery,
    alertSummaryQuery
  });
};

export default createPanel(AlertSummaryDashboardPanel);
