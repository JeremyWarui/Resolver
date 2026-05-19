# Plan: Admin Dashboard Consolidation

**Depends on:** `00-SHARED-INFRASTRUCTURE.md` completed first.

---

## Notes on Admin Dashboard complexity

Admin is the most data-intensive role. Unlike other roles, the admin dashboard has:
- Dynamic chart params (`timeframe`, `days`, `group_by`) that change interactively
- An org-wide analytics page that fetches a different endpoint (`/analytics/organizational/`)
- Multiple independent sub-pages (tickets, reports, sections, facilities, users, campuses, etc.)
  each of which needs full org-scope data

A single consolidated endpoint would be too rigid for admin — the charts need to re-query
dynamically. The approach here is more conservative:

1. **Keep `SharedDataProvider` for admin** — admin genuinely uses all 4 calls
2. **Keep `useAdminAnalytics` in SharedDataContext** — admin stats cards read from context
3. **Fix: Remove duplicate calls** between pages (no per-component analytics hook calls)
4. **Fix: Reduce `RecentTicketsTable` duplication** — if both dashboard and tickets page
   fetch the same ticket list, cache the result

However, `AdminDashboardContext` can still help here by caching the initial dashboard data
so that switching between the dashboard home and other pages doesn't refetch the overview stats.

---

## Backend: No new endpoint needed

Admin's `SharedDataContext` already calls `GET /api/analytics/admin-dashboard/`. The admin
dashboard (`StatsCards`, `TechniciansWorkload`) reads this from `SharedDataContext`. No
consolidated endpoint is needed because:
- Chart data needs dynamic params (`timeframe`, `days`) — can't be pre-fetched
- Org analytics page fetches independently with `analyticsService.getOrganisationAnalytics`
- Tickets page needs paginated + filterable ticket list

The admin's main performance problem is the `useTicketAnalytics` hook being called
independently in `ChartsSection` AND `FacilityChart` — both components make separate
`GET /api/analytics/tickets/` calls, sometimes with the same params.

**New endpoint (optional enhancement):** `GET /api/admin/me/dashboard/` — returns system
overview + recent overdue tickets in one call. This replaces the `useAdminAnalytics` call
in `SharedDataContext` and deduplicates it. However, this is low priority for admin since
the data is already cached in `SharedDataContext`.

---

## Frontend changes for Admin

### Shared issue: duplicate `useTicketAnalytics` calls

**Files to examine:** `ChartsSection.tsx`, `FacilityChart.tsx`

Both call `useTicketAnalytics()`. If they use the same params, they should share state.
Solution: Lift `useTicketAnalytics` into a shared state in `AdminDashboardContext` (or a
local state in the parent component that passes data down as props).

### AdminDashboardContext (optional, lightweight)

**File:** `client/src/contexts/AdminDashboardContext.tsx` (optional new file)

```tsx
interface AdminDashboardContextValue {
  adminTickets: Ticket[] | null;      // cached from RecentTicketsTable fetch
  setAdminTickets: (t: Ticket[]) => void;
  ticketAnalyticsData: TicketAnalytics | null;  // shared chart data
  setTicketAnalyticsData: (d: TicketAnalytics) => void;
}
```

This doesn't replace `SharedDataContext` for admin — it adds a lightweight cache for
data that is currently duplicated across sub-components.

### Keep SharedDataProvider for admin

Admin layout keeps `<SharedDataProvider>`. The `useAdminAnalytics` call inside it fires once
and provides `adminAnalytics` to `StatsCards` and `TechniciansWorkload` without duplication.

### Remove redundant `useUserData()` in AdminLayout

`AdminLayout.tsx` already reads `currentUser` from `useSharedData()` correctly — no change.

### Reduce duplicate chart queries

**`DashboardLayout.tsx`** (the main dashboard home):
- Move `useTicketAnalytics` call from `ChartsSection` and `FacilityChart` up to `DashboardLayout`
- Pass results as props to both components
- This halves the chart API calls on the dashboard home page

### Frontend files for Admin

| File | Action |
|------|--------|
| `client/src/contexts/AdminDashboardContext.tsx` | CREATE (optional — add when charts are refactored) |
| `client/src/components/AdminDashboard/Dashboard/DashboardLayout.tsx` | MODIFY — lift `useTicketAnalytics` |
| `client/src/components/AdminDashboard/Dashboard/ChartsSection.tsx` | MODIFY — accept analytics as prop |
| `client/src/components/AdminDashboard/Dashboard/FacilityChart.tsx` | MODIFY — accept analytics as prop |

**Do NOT remove `SharedDataProvider` from `AdminLayout`** — admin uses all 4 calls.

---

## Call count comparison for Admin

| Scenario | Before | After |
|---|---|---|
| Dashboard home load | 6 SharedData + 2 chart queries | 6 SharedData + **1** chart query |
| Switch to Tickets tab | 1 `/tickets/` | **0** if cached in AdminDashboardContext |
| Switch to Analytics tab | 1 `/analytics/organizational/` | 1 (unchanged — dynamic) |

---

## Verification

- Admin charts still update when timeframe/days changes
- `StatsCards` still shows correct overview numbers
- DevTools: dashboard home loads with 1 chart query (not 2)
