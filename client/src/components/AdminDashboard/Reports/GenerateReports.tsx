import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { Download, FileText, Users, Building2, FileSpreadsheet, FileBarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import reportsService from '@/api/services/reportsService';
import type { GenerateReportParams } from '@/api/services/reportsService';

export default function GenerateReports() {
  const [selectedReport, setSelectedReport] = useState('');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportTypes = [
    {
      id: 'ticket-lifecycle',
      name: 'Ticket Lifecycle Report',
      description: 'Complete ticket audit trail with all lifecycle data including pending reasons',
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      id: 'technician-performance',
      name: 'Technician Performance Report',
      description: 'Detailed performance metrics for all technicians',
      icon: <Users className="h-5 w-5 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      id: 'facility-health',
      name: 'Facility Health Report',
      description: 'Health metrics and maintenance needs by facility',
      icon: <Building2 className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      id: 'pending-analysis',
      name: 'Pending Tickets Analysis',
      description: 'All pending tickets with reasons, durations, and priorities',
      icon: <FileSpreadsheet className="h-5 w-5 text-orange-600" />,
      color: 'bg-orange-50',
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'All metrics combined in a single Excel workbook with multiple sheets',
      icon: <FileBarChart className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50',
    },
  ];

  const handleGenerate = async () => {
    if (!selectedReport) {
      toast.error('Please select a report type');
      return;
    }

    // Validate custom date range
    if (timeframe === 'custom') {
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start date must be before end date');
        return;
      }
    }

    setIsGenerating(true);
    
    try {
      const params: GenerateReportParams = {
        report_type: selectedReport as GenerateReportParams['report_type'],
        ...(timeframe === 'custom' 
          ? { start_date: startDate, end_date: endDate }
          : timeframe !== 'all' && { timeframe }
        ),
      };
      
      await reportsService.generateAndDownload(params);
      
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
      toast.success('Report downloaded successfully!', {
        description: `${reportName} has been saved to your downloads folder`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report', {
        description: 'Please try again or contact support if the issue persists',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report) => (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all ${
                selectedReport === report.id
                  ? 'border-blue-500 border-2 shadow-md'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`${report.color} p-3 rounded-lg`}>
                    {report.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{report.name}</h4>
                      {selectedReport === report.id && (
                        <Badge variant="default" className="bg-blue-500">Selected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Report Configuration */}
      {selectedReport && (
        <Card className="py-7 px-2">
          <CardHeader className="pb-5">
            <CardTitle className="pb-2">Report Configuration</CardTitle>
            <CardDescription>Customize your report parameters</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="grid grid-cols-1 gap-6">
              {/* Timeframe Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Time Period
                </label>
                <Select value={timeframe} onValueChange={(value) => setTimeframe(value as typeof timeframe)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                    <SelectItem value="day">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">Last 3 Months</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range Inputs */}
              {timeframe === 'custom' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-sm font-medium">
                      Start Date
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-sm font-medium">
                      End Date
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Info about Excel format */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3 items-start">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Excel Format (XLSX)</h4>
                    <p className="text-xs text-blue-700">
                      Reports are generated in Excel format with professional styling, charts, and pivot-ready data tables.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-[#0078d4] hover:bg-[#106ebe] flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Generate & Download Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
