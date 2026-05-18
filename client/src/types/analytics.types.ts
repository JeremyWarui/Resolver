// ============================================
// TICKET ANALYTICS
// ============================================

export interface TicketCounts {
  period: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface TrendDataPoint {
  period: string;
  count: number;
}

export interface FacilityDistribution {
  name: string;
  ticket_count: number;
}

export interface SectionDistribution {
  name: string;
  ticket_count: number;
  display_name?: string | null;
}

export interface TicketAnalytics {
  ticket_counts: TicketCounts;
  status_counts: StatusCount[];
  trend_data: TrendDataPoint[];
  facility_distribution: FacilityDistribution[];
  section_distribution: SectionDistribution[];
}

export interface TicketAnalyticsParams {
  timeframe?: 'day' | 'week' | 'month';
  facility_id?: number;
  section_id?: number;
  raised_by?: number;
  group_by?: 'day' | 'week' | 'month';
  days?: number;
}

// ============================================
// TECHNICIAN ANALYTICS
// ============================================

export interface TechnicianPerformance {
  id: number;
  username: string;
  email: string;
  full_name: string;
  total_tickets: number;
  resolved_tickets: number;
  pending_tickets: number;
  overdue_tickets: number;
  avg_rating: number;
  avg_resolution_time: number;
  resolution_percentage: number;
}

export interface SectionRating {
  section_name: string;
  technician_count: number;
  avg_rating: number;
}

export interface TechnicianAnalytics {
  technician_performance: TechnicianPerformance[];
  section_ratings?: SectionRating[];
}

export interface TechnicianAnalyticsParams {
  technician_id?: number;
}

// ============================================
// ADMIN ANALYTICS
// ============================================

export interface SystemOverview {
  total: number;
  open: number;
  closed: number;
  pending: number;
  pending_approval: number;
  escalated: number;
  new_24h: number;
  new_7d: number;
  new_30d: number;
  resolution_rate_pct: number;
  avg_resolution_hours: number | null;
  sla_24h_pct: number;
}

export interface OverdueTicket {
  id: number;
  ticket_no: string;
  title: string;
  status: string;
  section: string;
  facility: string;
  assigned_to: string | null;
  age_hours: number;
  created_at: string;
}

export interface AdminDashboardAnalytics {
  system_overview: SystemOverview;
  overdue_tickets: OverdueTicket[];
}

// ============================================
// SECTION HEAD ANALYTICS  (/section-head/me/dashboard/)
// ============================================

export interface SectionHeadOverview {
  total: number;
  open: number;
  closed: number;
  in_progress: number;
  pending: number;
  escalated: number;
  avg_resolution_hours: number | null;
  sla_24h_pct: number;
}

export interface SectionHeadBySectionStat {
  section: {
    id: number;
    name: string;
    code: string;
    section_type: string | null;
    campus_code: string;
    department: string;
  };
  technician_count: number;
  total: number;
  open: number;
  closed: number;
  escalated: number;
  avg_resolution_hours: number | null;
  sla_24h_pct: number;
}

export interface SectionHeadTechnicianWorkload {
  technician: { id: number; name: string; username: string };
  total_assigned: number;
  resolved: number;
  open: number;
  escalated: number;
  avg_resolution_hours: number | null;
}

export interface SectionHeadAnalytics {
  head_of_section: { id: number; username: string; sections_count: number };
  period_days: number;
  overview: SectionHeadOverview;
  by_section: SectionHeadBySectionStat[];
  technician_workload: SectionHeadTechnicianWorkload[];
  pending_reasons: { pending_reason: string; count: number }[];
  ticket_inflow: { date: string; count: number }[];
  status_distribution: StatusCount[];
  escalation_trends: { date: string; escalated: number }[];
}

// ============================================
// HOD ANALYTICS  (/hod/me/dashboard/)
// ============================================

export interface HODOverview {
  total: number;
  open: number;
  closed: number;
  pending: number;
  escalated: number;
  avg_resolution_hours: number | null;
  sla_24h_pct: number;
}

export interface HODCampusDepartment {
  id: number;
  campus: { id: number; name: string; code: string };
  department: { id: number; name: string; code: string };
  head_of_department: { id: number; username: string; name: string } | null;
}

export interface HODBySectionStat {
  section: { id: number; name: string; code: string; section_type: string | null };
  head_of_section: { id: number; username: string; name: string } | null;
  technician_count: number;
  total: number;
  open: number;
  closed: number;
  pending: number;
  escalated: number;
  avg_resolution_hours: number | null;
  sla_24h_pct: number;
}

export interface HODTechnicianWorkload {
  technician: { id: number; name: string; username: string };
  sections: { id: number; name: string; code: string }[];
  total_assigned: number;
  resolved: number;
  open: number;
  escalated: number;
  avg_resolution_hours: number | null;
}

export interface HODAnalytics {
  campus_department: HODCampusDepartment;
  period_days: number;
  overview: HODOverview;
  by_section: HODBySectionStat[];
  technician_workload: HODTechnicianWorkload[];
  ticket_inflow: { date: string; count: number }[];
  status_distribution: StatusCount[];
  escalation_trends: { date: string; escalated: number }[];
}

// ============================================
// MANAGER ANALYTICS  (/analytics/manager/)
// ============================================

export interface ManagerCampusStat {
  campus: { id: number; name: string; code: string };
  campus_department_id: number;
  head_of_department: { id: number; name: string; username: string } | null;
  total: number;
  open: number;
  closed: number;
  escalated: number;
  avg_resolution_hours: number | null;
  sla_24h_pct: number;
}

export interface ManagerSectionStat {
  section: {
    id: number;
    name: string;
    code: string;
    section_type: string;
  };
  campus: { code: string; name: string };
  head_of_section: { id: number; username: string; name: string } | null;
  technician_count: number;
  total: number;
  open: number;
  closed: number;
  escalated: number;
  avg_resolution_hours: number | null;
  sla_24h_pct: number;
}

export interface ManagerTechnicianStat {
  technician: { id: number; name: string; username: string };
  total_assigned: number;
  resolved: number;
  avg_resolution_hours: number | null;
}

export interface ManagerOverview {
  total: number;
  open: number;
  closed: number;
  pending: number;
  escalated: number;
  avg_resolution_hours: number | null;
  sla_24h_pct: number;
}

export interface ManagerAnalytics {
  department: { name: string; code: string; campuses_count: number };
  overview: ManagerOverview;
  by_campus: ManagerCampusStat[];
  by_section: ManagerSectionStat[];
  technicians: ManagerTechnicianStat[];
  status_distribution: { status: string; count: number }[];
  period_days: number;
}

export interface RoleAnalyticsParams {
  days?: number;
}

export interface OrgCampusStat {
  campus: { id: number; name: string; code: string };
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  resolution_rate: number;
  avg_resolution_hours: number | null;
  sla_compliance: number;
}

export interface OrgServiceItem {
  id: number;
  name: string;
  category: string;
  ticket_count: number;
}

export interface OrgSectionStat {
  section: { id: number; name: string; display_name?: string | null };
  department: string;
  campus: string;
  ticket_count: number;
}

export interface OrgTrendEntry {
  date: string;
  count: number;
}

export interface OrganisationAnalytics {
  summary: {
    total_tickets: number;
    open_tickets: number;
    resolved_tickets: number;
    new_24h: number;
    past_7_days: number;
    past_30_days: number;
    avg_resolution_time_hours: number | null;
  };
  campus_breakdown: OrgCampusStat[];
  top_service_items: OrgServiceItem[];
  busiest_sections: OrgSectionStat[];
  trend: OrgTrendEntry[];
}
