/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 *
 * Panel wiring file for AiOpsDashboard.
 */

import React from 'react';
import { useQuery } from '../helpers/useQuery';
import createPanel from '../app/createPanel';
import AiOpsDashboard from '../components/aiops-dashboard/AiOpsDashboard';

const TENANT_ID = 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255';

const AiOpsDashboardPanel = () => {
  const alertsQuery = useQuery('getAlerts', {
    tenantId: TENANT_ID,
    columns: [
      'severity', 'summary', 'resourceName', 'applicationName',
      'senderName', 'firstOccurrenceTime', 'acknowledged',
      'insights', 'owner', 'team'
    ],
    format: 'FULL'
  });

  const storiesQuery = useQuery('getStories', {
    tenantId: TENANT_ID
  });

  const alertSummaryQuery = useQuery('getAlerts', {
    tenantId: TENANT_ID,
    columns: ['severity'],
    format: 'SUMMARY'
  });

  return React.createElement(AiOpsDashboard, {
    alertsQuery,
    storiesQuery,
    alertSummaryQuery
  });
};

export default createPanel(AiOpsDashboardPanel);
