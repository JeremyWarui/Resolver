import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import StatsCards from '@/components/Common/StatsCards';
import analyticsService from '@/api/services/analyticsService';
import type { OrganisationAnalytics as OrgData } from '@/types';

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
    </div>
  );
}

export function OrganisationAnalytics() {
  const [data, setData] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    analyticsService.getOrganisationAnalytics({ days })
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Organisation Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">System-wide ticket metrics across all campuses</p>
        </div>
        <select
          className="text-sm border rounded-md px-3 py-1.5 bg-white shadow-sm"
          value={days}
          onChange={e => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards - shared with Dashboard for consistency */}
      <StatsCards />

      {/* Trend Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6">
          <CardTitle className="text-base">Ticket Volume — Last {days} Days</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          {loading || !data ? (
            <Skeleton className="h-70 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.trend} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v) => [v, 'Tickets']}
                  labelFormatter={l => `Date: ${l}`}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Campus Breakdown */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-base">Campus Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            {loading || !data ? (
              <SectionSkeleton />
            ) : data.campus_breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No campus data</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm bg-white">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="px-3 py-3 font-medium">Campus</th>
                      <th className="px-3 py-3 font-medium text-right">Total</th>
                      <th className="px-3 py-3 font-medium text-right">Open</th>
                      <th className="px-3 py-3 font-medium text-right">SLA %</th>
                      <th className="px-3 py-3 font-medium text-right">Avg Hrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.campus_breakdown.map(c => (
                      <tr key={c.campus.id}>
                        <td className="px-3 py-2.5">
                          <span className="font-medium">{c.campus.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{c.campus.code}</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">{c.total_tickets}</td>
                        <td className="px-3 py-2.5 text-right">{c.open_tickets}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={c.sla_compliance >= 80 ? 'text-green-600' : c.sla_compliance >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                            {c.sla_compliance}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">
                          {c.avg_resolution_hours != null ? `${c.avg_resolution_hours}h` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Busiest Sections */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-base">Busiest Sections</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            {loading || !data ? (
              <SectionSkeleton />
            ) : data.busiest_sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No section data</p>
            ) : (
              <div className="space-y-3">
                {data.busiest_sections.map((s, i) => (
                  <div key={s.section.id} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2.5">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.section.display_name ?? s.section.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.department} · {s.campus}</p>
                    </div>
                    <Badge variant="secondary">{s.ticket_count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Service Items */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6">
          <CardTitle className="text-base">Top Requested Service Items</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          {loading || !data ? (
            <SectionSkeleton />
          ) : data.top_service_items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No service item data yet — items will appear here once tickets are raised via the catalogue.
            </p>
          ) : (
            <div className="space-y-3">
              {data.top_service_items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2.5">
                  <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <Badge variant="secondary">{item.ticket_count} tickets</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
