# Dashboard Analytics Implementation Guide

## 📊 Backend-to-Frontend Analytics Mapping

Based on the Django backend analytics structure, here's the recommended implementation for each dashboard.

---

## 1. 👨‍💼 ADMIN DASHBOARD

### Data Sources (2 Endpoints)

#### Primary: `/api/analytics/admin-dashboard/`
```typescript
const { data: adminData, loading: adminLoading } = useAdminAnalytics();

// Returns:
{
  system_overview: {
    total_tickets: number,
    open_tickets: number,
    resolved_tickets: number,
    resolution_rate: number, // percentage
    new_tickets_24h: number,
    tickets_past_week: number,
    tickets_past_month: number,
    avg_resolution_time_hours: number | null
  },
  overdue_tickets: [...]
}
```

#### Secondary: `/api/analytics/technicians/`
```typescript
const { data: techData, loading: techLoading } = useTechnicianAnalytics();

// Returns:
{
  technician_performance: [...], // All technicians
  section_ratings: [...] // Average ratings by section
}
```

### Recommended Stats Cards

```tsx
// System Overview Cards
<StatCard title="Total Tickets" value={adminData.system_overview.total_tickets} />
<StatCard title="Open Tickets" value={adminData.system_overview.open_tickets} />
<StatCard title="Resolved Tickets" value={adminData.system_overview.resolved_tickets} />
<StatCard title="Resolution Rate" value={`${adminData.system_overview.resolution_rate}%`} />
<StatCard title="New (24h)" value={adminData.system_overview.new_tickets_24h} />
<StatCard title="Avg Resolution Time" value={`${adminData.system_overview.avg_resolution_time_hours}h`} />

// Technician Overview
<StatCard title="Total Technicians" value={techData.technician_performance.length} />
<StatCard title="Available" value={/* calculate from performance data */} />
```

### Dashboard Sections

1. **System Overview Cards** - From `system_overview`
2. **Overdue Tickets Table** - From `overdue_tickets` array
3. **Technician Performance Table** - From `technician_performance` array
4. **Section Ratings Chart** - From `section_ratings` array
5. **Recent Tickets** - Use existing `/api/tickets/` endpoint

---

## 2. 🔧 TECHNICIAN DASHBOARD

### Data Source (1 Endpoint)

#### Primary: `/api/analytics/technicians/?technician_id={userId}`
```typescript
const { userData } = useUserData();
const { data, loading } = useTechnicianAnalytics({ 
  technician_id: userData?.id 
});

// Returns:
{
  technician_performance: [
    {
      id: number,
      username: string,
      full_name: string,
      total_tickets: number,
      resolved_tickets: number,
      pending_tickets: number,
      overdue_tickets: number,
      avg_rating: number,
      avg_resolution_time: number, // hours
      resolution_percentage: number
    }
  ]
}
```

### Recommended Stats Cards

```tsx
const myStats = data?.technician_performance[0]; // Single technician

<StatCard title="Total Assigned" value={myStats.total_tickets} />
<StatCard title="Resolved" value={myStats.resolved_tickets} />
<StatCard title="Pending" value={myStats.pending_tickets} />
<StatCard title="Overdue" value={myStats.overdue_tickets} />
<StatCard title="Avg Rating" value={`${myStats.avg_rating}/5.0`} />
<StatCard title="Avg Resolution Time" value={`${myStats.avg_resolution_time}h`} />
<StatCard title="Resolution Rate" value={`${myStats.resolution_percentage}%`} />
```

### Dashboard Sections

1. **Performance Stats Cards** - Personal metrics
2. **My Tickets Table** - Filter tickets by `assigned_to={userId}`
3. **Performance Chart** - Resolution time trends
4. **Rating History** - Show feedback received

---

## 3. 👤 USER DASHBOARD

### Data Source (1 Endpoint)

#### Primary: `/api/analytics/tickets/`
```typescript
const { data, loading } = useTicketAnalytics({
  timeframe: 'month', // or 'day', 'week'
  days: 30,
  group_by: 'day'
});

// Returns:
{
  ticket_counts: {
    period: "Last 30 days",
    count: number
  },
  status_counts: [
    { status: 'open', count: 10 },
    { status: 'resolved', count: 25 },
    ...
  ],
  trend_data: [
    { period: '2025-11-01', count: 5 },
    ...
  ],
  facility_distribution: [
    { name: 'Building A', ticket_count: 15 },
    ...
  ],
  section_distribution: [
    { name: 'IT', ticket_count: 20 },
    ...
  ]
}
```

### Recommended Stats Cards

```tsx
// Calculate from status_counts
const openCount = data.status_counts.find(s => s.status === 'open')?.count || 0;
const resolvedCount = data.status_counts.find(s => s.status === 'resolved')?.count || 0;
const assignedCount = data.status_counts.find(s => s.status === 'assigned')?.count || 0;
const pendingCount = data.status_counts.find(s => s.status === 'pending')?.count || 0;

<StatCard title="Open Tickets" value={openCount} />
<StatCard title="Assigned" value={assignedCount} />
<StatCard title="Resolved" value={resolvedCount} />
<StatCard title="Pending" value={pendingCount} />
<StatCard title="Total (30 days)" value={data.ticket_counts.count} />
```

### Dashboard Sections

1. **Ticket Status Cards** - From `status_counts`
2. **Ticket Trends Chart** - From `trend_data`
3. **Facility Distribution** - From `facility_distribution`
4. **Section Distribution** - From `section_distribution`
5. **My Tickets Table** - Filter tickets by `raised_by={userId}`

---

## 🎯 Implementation Priority

### Phase 1: Update Types & Services ✅
- [x] Update `analytics.types.ts` with correct backend types
- [x] Update `analyticsService.ts` with correct endpoints
- [x] Create `useTicketAnalytics` hook
- [x] Create `useTechnicianAnalytics` hook
- [x] Create `useAdminAnalytics` hook

### Phase 2: Update Admin Dashboard
- [ ] Replace `useStats` with `useAdminAnalytics` + `useTechnicianAnalytics`
- [ ] Update StatsCards component to use `system_overview` data
- [ ] Create OverdueTicketsTable component
- [ ] Create TechnicianPerformanceTable component
- [ ] Add section ratings chart

### Phase 3: Update Technician Dashboard ✅
- [x] Already updated to use real API (but needs technician analytics)
- [ ] Replace ticket stats with `useTechnicianAnalytics`
- [ ] Add performance metrics display
- [ ] Add rating display

### Phase 4: Update User Dashboard
- [ ] Replace `useStats` with `useTicketAnalytics`
- [ ] Calculate stats from `status_counts`
- [ ] Add trend chart
- [ ] Add facility/section distribution charts

---

## 📝 Code Examples

### Admin Dashboard Implementation

```tsx
import { useAdminAnalytics, useTechnicianAnalytics } from '@/hooks/analytics';

const AdminDashboard = () => {
  const { data: adminData, loading: adminLoading } = useAdminAnalytics();
  const { data: techData, loading: techLoading } = useTechnicianAnalytics();

  if (adminLoading || techLoading) return <LoadingSkeleton />;

  const overview = adminData.system_overview;
  const technicians = techData.technician_performance;

  return (
    <>
      {/* System Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Tickets" value={overview.total_tickets} />
        <StatCard title="Open" value={overview.open_tickets} />
        <StatCard title="Resolved" value={overview.resolved_tickets} />
        <StatCard title="Resolution Rate" value={`${overview.resolution_rate}%`} />
      </div>

      {/* Overdue Tickets */}
      <OverdueTicketsTable tickets={adminData.overdue_tickets} />

      {/* Technician Performance */}
      <TechnicianPerformanceTable technicians={technicians} />
    </>
  );
};
```

### Technician Dashboard Implementation

```tsx
import { useTechnicianAnalytics } from '@/hooks/analytics';
import useUserData from '@/hooks/users/useUserData';

const TechnicianDashboard = () => {
  const { userData } = useUserData();
  const { data, loading } = useTechnicianAnalytics({ 
    technician_id: userData?.id 
  });

  if (loading) return <LoadingSkeleton />;

  const myStats = data.technician_performance[0];

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Assigned" value={myStats.total_tickets} />
        <StatCard title="Resolved" value={myStats.resolved_tickets} />
        <StatCard title="Pending" value={myStats.pending_tickets} />
        <StatCard title="Overdue" value={myStats.overdue_tickets} />
        <StatCard title="Avg Rating" value={`${myStats.avg_rating}/5`} />
        <StatCard title="Resolution %" value={`${myStats.resolution_percentage}%`} />
      </div>

      <MyTicketsTable assignedTo={userData.id} />
    </>
  );
};
```

### User Dashboard Implementation

```tsx
import { useTicketAnalytics } from '@/hooks/analytics';

const UserDashboard = () => {
  const { data, loading } = useTicketAnalytics({ timeframe: 'month' });

  if (loading) return <LoadingSkeleton />;

  // Calculate stats from status_counts
  const getStatusCount = (status: string) => 
    data.status_counts.find(s => s.status === status)?.count || 0;

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Open" value={getStatusCount('open')} />
        <StatCard title="Assigned" value={getStatusCount('assigned')} />
        <StatCard title="In Progress" value={getStatusCount('in_progress')} />
        <StatCard title="Resolved" value={getStatusCount('resolved')} />
      </div>

      <TicketTrendsChart data={data.trend_data} />
      <FacilityDistributionChart data={data.facility_distribution} />
    </>
  );
};
```

---

## ⚠️ Important Notes

1. **Old `useStats` hook is DEPRECATED**
   - It was using the wrong endpoint structure
   - Replace with new hooks in all dashboards

2. **Backend permissions are commented out**
   - Enable them in production for security

3. **Timeframe flexibility**
   - User and Admin dashboards can filter by day/week/month
   - Use query parameters appropriately

4. **Caching considerations**
   - Analytics data should be cached/refreshed periodically
   - Consider adding polling or websocket updates

---

## ✅ Testing Checklist

- [ ] Admin dashboard shows system overview correctly
- [ ] Admin dashboard shows all technicians performance
- [ ] Technician dashboard shows only their own stats
- [ ] User dashboard shows general ticket overview
- [ ] All status counts match backend data
- [ ] Trend charts render correctly
- [ ] Overdue tickets display properly
- [ ] Loading states work correctly
- [ ] Error handling works for failed requests

---

## 🚀 Next Steps

1. Keep existing `useStats` hook for backward compatibility (mark as deprecated)
2. Gradually migrate each dashboard to new hooks
3. Test thoroughly with real backend data
4. Add charts for trend visualization
5. Implement real-time updates if needed
