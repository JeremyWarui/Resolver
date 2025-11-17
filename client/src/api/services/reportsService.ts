import apiClient from '../client';

export interface ReportType {
  id: string;
  name: string;
  description: string;
  filters: string[];
  columns: string[];
}

export interface ReportTypesResponse {
  report_types: ReportType[];
  timeframe_options: Array<{
    value: string;
    label: string;
  }>;
}

export interface GenerateReportParams {
  report_type: 'ticket-lifecycle' | 'technician-performance' | 'facility-health' | 'pending-analysis' | 'comprehensive';
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';
  start_date?: string; // YYYY-MM-DD format
  end_date?: string; // YYYY-MM-DD format
  status?: string;
  section_id?: number;
  technician_id?: number;
}

const reportsService = {
  // Get available report types and configurations
  getReportTypes: async (): Promise<ReportTypesResponse> => {
    const response = await apiClient.get('/reports/types/');
    return response.data;
  },

  // Generate and download a report
  generateReport: async (params: GenerateReportParams): Promise<Blob> => {
    const response = await apiClient.get('/reports/generate/', {
      params,
      responseType: 'blob', // Important for file downloads
    });
    return response.data;
  },

  // Helper to trigger browser download
  downloadReport: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Convenience method to generate and download in one call
  generateAndDownload: async (params: GenerateReportParams): Promise<void> => {
    const blob = await reportsService.generateReport(params);
    
    // Generate filename based on report type and date
    const reportTypeNames: Record<string, string> = {
      'ticket-lifecycle': 'Ticket_Lifecycle_Report',
      'technician-performance': 'Technician_Performance_Report',
      'facility-health': 'Facility_Health_Report',
      'pending-analysis': 'Pending_Analysis_Report',
      'comprehensive': 'Comprehensive_Report',
    };
    
    const reportName = reportTypeNames[params.report_type] || 'Report';
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `${reportName}_${dateStr}.xlsx`;
    
    reportsService.downloadReport(blob, filename);
  },
};

export default reportsService;
