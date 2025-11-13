import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { Download, FileText, Users, Building2, FileSpreadsheet, FileBarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GenerateReports() {
  const [selectedReport, setSelectedReport] = useState('');
  const [timeframe, setTimeframe] = useState('month');
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'ticket-summary',
      name: 'Ticket Summary Report',
      description: 'Overview of all tickets with status, trends, and distribution',
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
      id: 'section-analysis',
      name: 'Section Analysis Report',
      description: 'Section-wise ticket distribution and performance',
      icon: <Building2 className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'All metrics combined in a single detailed report',
      icon: <FileBarChart className="h-5 w-5 text-orange-600" />,
      color: 'bg-orange-50',
    },
  ];

  const handleGenerate = async () => {
    if (!selectedReport) return;

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      // In production, this would call the backend API to generate and download the report
      console.log(`Generating ${selectedReport} report for ${timeframe} in ${format} format`);
      setIsGenerating(false);
      
      // Create a dummy download (replace with actual API call)
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
      alert(`${reportName} would be downloaded here in ${format.toUpperCase()} format`);
    }, 2000);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timeframe Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Time Period
                </label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">Last 3 Months</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Format
                </label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <FileBarChart className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">About Report Generation</h4>
              <p className="text-sm text-blue-700">
                Generated reports include comprehensive analytics, visualizations, and detailed data tables. 
                PDF format is ideal for presentations, Excel for data analysis, and CSV for database imports.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
