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

// Static options — defined outside the component so object identity is stable.
const ALERTS_QUERY_OPTIONS = {
  tenantId: TENANT_ID,
  columns: ['severity', 'resourceName', 'locationName'],
  format: 'FULL'
};

const ALERT_SUMMARY_OPTIONS = {
  tenantId: TENANT_ID,
  columns: ['severity'],
  format: 'SUMMARY'
};

const AlertSummaryDashboardPanel = () => {
  const alertsQuery = useQuery('getAlerts', ALERTS_QUERY_OPTIONS);
  const alertSummaryQuery = useQuery('getAlerts', ALERT_SUMMARY_OPTIONS);

  return React.createElement(AlertSummaryDashboard, {
    alertsQuery,
    alertSummaryQuery
  });
};

export default createPanel(AlertSummaryDashboardPanel);
