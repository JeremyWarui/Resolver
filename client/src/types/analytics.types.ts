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
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  resolution_rate: number;
  new_tickets_24h: number;
  tickets_past_week: number;
  tickets_past_month: number;
  avg_resolution_time_hours: number | null;
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
// SECTION HEAD ANALYTICS  (/analytics/section-head/)
// ============================================

export interface SectionStat {
  section: { id: number; name: string; code: string; section_head: string | null };
  total_tickets: number;
  open_tickets: number;
  escalated_tickets: number;
  avg_resolution_hours: number | null;
  technician_count: number;
}

export interface TechPerformanceStat {
  technician: { id: number; name: string; username: string; sections: string[] };
  total_assigned: number;
  resolved: number;
  open: number;
  avg_resolution_hours: number | null;
  escalation_count: number;
}

export interface SectionHeadOverview {
  total_tickets: number;
  open_tickets: number;
  overdue_tickets: number;
  escalated_tickets: number;
  avg_resolution_hours: number | null;
}

export interface SectionHeadDepartment {
  name: string;
  code: string;
  campus: string | null;
  sections_count: number;
}

export interface SectionHeadAnalytics {
  department: SectionHeadDepartment;
  overview: SectionHeadOverview;
  section_stats: SectionStat[];
  tech_performance: TechPerformanceStat[];
  status_distribution: StatusCount[];
}

// ============================================
// HOD ANALYTICS  (/analytics/hod/)
// ============================================

export interface DeptStat {
  department: { id: number; name: string; code: string; hod: string | null };
  total_tickets: number;
  open_tickets: number;
  escalated_tickets: number;
  avg_resolution_hours: number | null;
  sla_compliance: number;
}

export interface SectionPerformanceStat {
  section: { id: number; name: string; code: string; department: string; section_head: string | null };
  ticket_count: number;
  open_count: number;
  avg_resolution_hours: number | null;
  technician_count: number;
}

export interface HODOverview {
  total_tickets: number;
  open_tickets: number;
  overdue_tickets: number;
  escalated_tickets: number;
}

export interface HODAnalytics {
  campus: { id: number; name: string; code: string; location: string };
  overview: HODOverview;
  dept_stats: DeptStat[];
  section_performance: SectionPerformanceStat[];
  tech_performance: TechPerformanceStat[];
}

// ============================================
// MANAGER ANALYTICS  (/analytics/manager/)
// ============================================

export interface ManagerCampusStat {
  campus: { id: number; name: string; code: string };
  department_id: number;
  total_tickets: number;
  open_tickets: number;
  escalated_tickets: number;
  avg_resolution_hours: number | null;
  sla_compliance: number;
}

export interface ManagerSectionStat {
  section: {
    id: number;
    name: string;
    code: string;
    campus: string | null;
    head_of_section: string | null;
  };
  total_tickets: number;
  open_tickets: number;
  escalated_tickets: number;
  avg_resolution_hours: number | null;
  technician_count: number;
}

export interface ManagerTechnicianStat {
  technician: { id: number; name: string; username: string };
  total_assigned: number;
  resolved: number;
  avg_resolution_hours: number | null;
}

export interface ManagerOverview {
  total_tickets: number;
  open_tickets: number;
  overdue_tickets: number;
  escalated_tickets: number;
  avg_resolution_hours: number | null;
  sla_compliance: number;
}

export interface ManagerAnalytics {
  department: { name: string; code: string; campuses_count: number };
  overview: ManagerOverview;
  campuses: ManagerCampusStat[];
  sections: ManagerSectionStat[];
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
  section: { id: number; name: string };
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
