import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import analyticsService from '@/api/services/analyticsService';
import type { OrganisationAnalytics as OrgData } from '@/types';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

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
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
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

      {/* Summary Cards */}
      {loading || !data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Tickets" value={data.summary.total_tickets} />
          <StatCard label="Open" value={data.summary.open_tickets} />
          <StatCard label="Resolved" value={data.summary.resolved_tickets} />
          <StatCard
            label="Avg Resolution"
            value={data.summary.avg_resolution_time_hours != null
              ? `${data.summary.avg_resolution_time_hours}h`
              : '—'}
            sub="hours to resolve"
          />
        </div>
      )}

      {/* Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ticket Volume — Last {days} Days</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || !data ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v: number) => [v, 'Tickets']}
                  labelFormatter={l => `Date: ${l}`}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campus Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Campus Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <SectionSkeleton />
            ) : data.campus_breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No campus data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="pb-2 font-medium">Campus</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                      <th className="pb-2 font-medium text-right">Open</th>
                      <th className="pb-2 font-medium text-right">SLA %</th>
                      <th className="pb-2 font-medium text-right">Avg Hrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.campus_breakdown.map(c => (
                      <tr key={c.campus.id}>
                        <td className="py-2">
                          <span className="font-medium">{c.campus.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{c.campus.code}</Badge>
                        </td>
                        <td className="py-2 text-right">{c.total_tickets}</td>
                        <td className="py-2 text-right">{c.open_tickets}</td>
                        <td className="py-2 text-right">
                          <span className={c.sla_compliance >= 80 ? 'text-green-600' : c.sla_compliance >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                            {c.sla_compliance}%
                          </span>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Busiest Sections</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <SectionSkeleton />
            ) : data.busiest_sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No section data</p>
            ) : (
              <div className="space-y-2">
                {data.busiest_sections.map((s, i) => (
                  <div key={s.section.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.section.name}</p>
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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Requested Service Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || !data ? (
            <SectionSkeleton />
          ) : data.top_service_items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No service item data yet — items will appear here once tickets are raised via the catalogue.
            </p>
          ) : (
            <div className="space-y-2">
              {data.top_service_items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
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
