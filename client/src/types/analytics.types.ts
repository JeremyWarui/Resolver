// ============================================
// TICKET ANALYTICS (from TicketAnalyticsView)
// ============================================

export interface TicketCounts {
  period: string; // e.g., "Last 1 day", "Last 7 days"
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface TrendDataPoint {
  period: string; // ISO date string
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
  timeframe?: 'day' | 'week' | 'month'; // default: 'day'
  facility_id?: number;
  section_id?: number;
  raised_by?: number; // Filter by user who raised the ticket
  group_by?: 'day' | 'week' | 'month'; // default: 'day'
  days?: number; // default: 30
}

// ============================================
// TECHNICIAN ANALYTICS (from TechnicianAnalyticsView)
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
  avg_resolution_time: number; // in hours
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
// ADMIN ANALYTICS (from AdminDashboardAnalyticsView)
// ============================================

export interface SystemOverview {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  resolution_rate: number; // percentage
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
