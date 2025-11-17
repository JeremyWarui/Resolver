import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Filter, Download, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import StatsCards from "../../Common/StatsCards";
import ChartSection from "./ChartsSection";
import FacilityAndWorkload from "./FacilityAndWorkload";
import RecentTicketsTable from "./RecentTickets";
import reportsService from "@/api/services/reportsService";
import type { GenerateReportParams } from "@/api/services/reportsService";

const MainContent = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<GenerateReportParams['report_type'] | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = async () => {
    if (!selectedReportType) {
      toast.error('Please select a report type');
      return;
    }

    // Validate date range if provided
    if (startDate || endDate) {
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates, or leave both empty for all time');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start date must be before end date');
        return;
      }
    }

    setIsExporting(true);
    try {
      const params: GenerateReportParams = {
        report_type: selectedReportType,
        ...(startDate && endDate && { start_date: startDate, end_date: endDate }),
      };

      await reportsService.generateAndDownload(params);

      const reportNames = {
        'ticket-lifecycle': 'Ticket Lifecycle Report',
        'technician-performance': 'Technician Performance Report',
        'facility-health': 'Facility Health Report',
        'pending-analysis': 'Pending Analysis Report',
        'comprehensive': 'Comprehensive Report',
      };

      toast.success('Report downloaded successfully!', {
        description: `${reportNames[selectedReportType]} has been saved to your downloads folder`,
      });
      setShowExportDialog(false);
      setSelectedReportType(null);
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report', {
        description: 'Please try again or contact support if the issue persists',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Maintenance Overview
          </h2>
          <p className="text-sm text-gray-600">Welcome back, 👋</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />
      
      {/* Charts - First Row */}
      <ChartSection />
      {/* Charts and Tables - Second Row */}
      <FacilityAndWorkload />
      {/*Recent Tickets */}
      <RecentTicketsTable />

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Dashboard Data</DialogTitle>
            <DialogDescription>
              Choose a report and optionally select a date range
            </DialogDescription>
          </DialogHeader>
          
          {/* Report Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Report Type</Label>
            <div className="space-y-2">
            <Button
              onClick={() => setSelectedReportType('ticket-lifecycle')}
              disabled={isExporting}
              variant={selectedReportType === 'ticket-lifecycle' ? 'default' : 'outline'}
              className="w-full justify-start h-auto py-3 px-4"
            >
              <div className="text-left">
                <div className="font-semibold">Ticket Lifecycle Report</div>
                <div className="text-xs opacity-70">Complete ticket history with pending reasons</div>
              </div>
            </Button>
            
            <Button
              onClick={() => setSelectedReportType('technician-performance')}
              disabled={isExporting}
              variant={selectedReportType === 'technician-performance' ? 'default' : 'outline'}
              className="w-full justify-start h-auto py-3 px-4"
            >
              <div className="text-left">
                <div className="font-semibold">Technician Performance</div>
                <div className="text-xs opacity-70">Performance metrics for all technicians</div>
              </div>
            </Button>
            
            <Button
              onClick={() => setSelectedReportType('facility-health')}
              disabled={isExporting}
              variant={selectedReportType === 'facility-health' ? 'default' : 'outline'}
              className="w-full justify-start h-auto py-3 px-4"
            >
              <div className="text-left">
                <div className="font-semibold">Facility Health Report</div>
                <div className="text-xs opacity-70">Maintenance needs by facility</div>
              </div>
            </Button>
            
            <Button
              onClick={() => setSelectedReportType('pending-analysis')}
              disabled={isExporting}
              variant={selectedReportType === 'pending-analysis' ? 'default' : 'outline'}
              className="w-full justify-start h-auto py-3 px-4"
            >
              <div className="text-left">
                <div className="font-semibold">Pending Tickets Analysis</div>
                <div className="text-xs opacity-70">All pending tickets with reasons</div>
              </div>
            </Button>
            
            <Button
              onClick={() => setSelectedReportType('comprehensive')}
              disabled={isExporting}
              variant={selectedReportType === 'comprehensive' ? 'default' : 'outline'}
              className="w-full justify-start h-auto py-3 px-4"
            >
              <div className="text-left">
                <div className="font-semibold">Comprehensive Report</div>
                <div className="text-xs opacity-70">All reports in one Excel workbook</div>
              </div>
            </Button>
            </div>
          </div>

          {/* Date Range Selection */}
          {selectedReportType && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <Label className="text-sm font-medium">Date Range (Optional)</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dashboard-start-date" className="text-xs text-gray-600">
                    Start Date
                  </Label>
                  <Input
                    id="dashboard-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isExporting}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dashboard-end-date" className="text-xs text-gray-600">
                    End Date
                  </Label>
                  <Input
                    id="dashboard-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isExporting}
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Leave empty to include all tickets from all time
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowExportDialog(false);
                setSelectedReportType(null);
                setStartDate('');
                setEndDate('');
              }}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || !selectedReportType}
              className="bg-[#0078d4] hover:bg-[#106ebe]"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          </div>
          
          {isExporting && (
            <div className="flex items-center justify-center py-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
              Generating report...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default MainContent;
