import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Building2, Download } from 'lucide-react';
import TicketMetricsReport from './TicketMetricsReport';
import TechnicianPerformanceReport from './TechnicianPerformanceReport';
import SectionPerformanceReport from './SectionPerformanceReport';
import GenerateReports from './GenerateReports';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('tickets');

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {/* Page Header */}
      <div className="flex justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Reports & Analytics</h1>
          <p className="text-sm text-gray-600">
            Comprehensive insights into ticket metrics, technician performance, and facility operations
          </p>
        </div>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px] p-1.5">
          <TabsTrigger value="tickets" className="flex items-center gap-2 px-4 py-2.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Ticket Metrics</span>
            <span className="sm:hidden">Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="technicians" className="flex items-center gap-2 px-4 py-2.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Technician Performance</span>
            <span className="sm:hidden">Technicians</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2 px-4 py-2.5">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Section Performance</span>
            <span className="sm:hidden">Sections</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2 px-4 py-2.5">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Generate Reports</span>
            <span className="sm:hidden">Generate</span>
          </TabsTrigger>
        </TabsList>

        {/* Ticket Metrics Tab */}
        <TabsContent value="tickets">
          <Card className="py-7 px-2">
            <CardHeader className="pb-5">
              <CardTitle className="pb-2">Ticket Metrics Overview</CardTitle>
              <CardDescription>
                Analyze ticket trends, status distribution, and facility performance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              <TicketMetricsReport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technician Performance Tab */}
        <TabsContent value="technicians">
          <Card className="py-7 px-2">
            <CardHeader className="pb-5">
              <CardTitle className="pb-2">Technician Performance</CardTitle>
              <CardDescription>
                View technician workload, resolution rates, and performance ratings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              <TechnicianPerformanceReport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Performance Tab */}
        <TabsContent value="sections">
          <Card className="py-7 px-2">
            <CardHeader className="pb-5">
              <CardTitle className="pb-2">Section Performance Analysis</CardTitle>
              <CardDescription>
                Compare section-wise ticket distribution and technician ratings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              <SectionPerformanceReport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Reports Tab */}
        <TabsContent value="generate">
          <Card className="py-7 px-2">
            <CardHeader className="pb-5">
              <CardTitle className="pb-2">Generate & Download Reports</CardTitle>
              <CardDescription>
                Create custom reports and export them in your preferred format
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              <GenerateReports />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
