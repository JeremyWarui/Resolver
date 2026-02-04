import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileSpreadsheet, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import reportsService from '@/api/services/reportsService';
import { useTickets } from '@/hooks/tickets';

const TechReport = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  // TODO: Replace with actual authentication - using dummy ID for testing
  const technicianId = 3; // Dummy technician ID until auth is implemented
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch technician's tickets for stats
  const { tickets, loading } = useTickets({
    assigned_to: technicianId,
    page_size: 100,
  });

  // Calculate statistics
  const stats = {
    total: tickets.length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
  };

  const handleDownloadReport = async () => {
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

    setIsDownloading(true);
    try {
      const params: any = {
        report_type: 'technician-performance',
        ...(startDate && endDate && { start_date: startDate, end_date: endDate }),
      };
      
      // Only add technician_id if available (for filtering)
      if (technicianId) {
        params.technician_id = technicianId;
      }
      
      await reportsService.generateAndDownload(params);

      toast.success('Report downloaded successfully!', {
        description: technicianId 
          ? 'Your performance report has been saved to your downloads folder'
          : 'All technicians performance report has been saved to your downloads folder',
      });
      setShowDateDialog(false);
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report', {
        description: 'Please try again or contact support if the issue persists',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 px-6 py-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Performance Report</h1>
        <p className="text-sm text-gray-600 mt-1">
          View your ticket statistics and download detailed performance reports
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets Overview */}
        <Card>
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Tickets Overview
            </CardTitle>
            <CardDescription>Your ticket assignment and resolution summary</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Total Assigned</span>
                <span className="text-lg font-bold text-blue-600">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Resolved</span>
                <span className="text-lg font-bold text-green-600">{stats.resolved}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Resolution Time */}
        <Card>
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Resolution Performance
            </CardTitle>
            <CardDescription>Time-based performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-900">Avg Resolution Time</span>
                <span className="text-lg font-bold text-orange-600">2.3 days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Fastest Resolution</span>
                <span className="text-lg font-bold text-blue-600">45 min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">Response Time</span>
                <span className="text-lg font-bold text-purple-600">1.2 hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Satisfaction */}
        <Card>
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Customer Satisfaction
            </CardTitle>
            <CardDescription>Feedback and ratings from users</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">4.7</div>
              <div className="text-sm text-gray-600 mb-3">Average Rating</div>
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <CheckCircle
                    key={star}
                    className={`h-5 w-5 ${star <= 4.7 ? 'text-green-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Recent Reviews</span>
                <span className="text-green-600">87% Positive</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Response Quality</span>
                <span className="text-blue-600">Excellent</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Communication</span>
                <span className="text-green-600">Very Good</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 30-Day Trends */}
        <Card>
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              30-Day Performance
            </CardTitle>
            <CardDescription>Your recent performance trends</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tickets Resolved</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">12</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">+15%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">1.2 hrs</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">-8%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Rating</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">4.8</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">+0.2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Report Section */}
      <Card>
        <CardHeader className="pb-6 pt-6">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Download Performance Report
          </CardTitle>
          <CardDescription>
            Get a detailed Excel report with your performance metrics, ticket history, and ratings
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">Report Includes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Total tickets assigned and resolved</li>
              <li>• Average resolution time</li>
              <li>• Current pending and in-progress tickets</li>
              <li>• Customer satisfaction ratings</li>
              <li>• Performance trends over the last 30 days</li>
            </ul>
          </div>

          <Button
            onClick={() => setShowDateDialog(true)}
            disabled={isDownloading}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download My Performance Report (Excel)
          </Button>
        </CardContent>
      </Card>

      {/* Date Range Dialog */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Performance Report</DialogTitle>
            <DialogDescription>
              Select a date range or leave empty for all time data
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Date Range (Optional)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tech-start-date" className="text-sm">
                  Start Date
                </Label>
                <Input
                  id="tech-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isDownloading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tech-end-date" className="text-sm">
                  End Date
                </Label>
                <Input
                  id="tech-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isDownloading}
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Leave dates empty to include all your tickets from all time
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDateDialog(false);
                setStartDate('');
                setEndDate('');
              }}
              disabled={isDownloading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDownloading ? (
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
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="px-6 pt-6 pb-6">
          <div className="flex gap-3">
            <FileSpreadsheet className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
            <div>
            <h4 className="font-semibold text-gray-900 mb-1">About Your Reports</h4>
            <p className="text-sm text-gray-600">
              {technicianId 
                ? "Your performance reports are generated monthly and include all tickets assigned to you. Use these reports for self-evaluation, performance reviews, or to track your improvement over time."
                : "Download the technician performance report to view detailed metrics for all technicians. This report includes resolution times, ticket counts, and satisfaction ratings."}
            </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechReport;
