import type { ManagerAnalytics } from './analytics.types';

/**
 * Ticket counts by status
 */
export interface ManagerTicketsSummary {
  [status: string]: number;
}

/**
 * Complete Manager Dashboard response
 *
 * Extends ManagerAnalytics with consolidated ticket summary by status.
 * Includes cross-campus analytics for the manager's department.
 */
export interface ManagerDashboard extends ManagerAnalytics {
  tickets_summary: ManagerTicketsSummary;
  [key: string]: unknown;
}
