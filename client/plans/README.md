# Dashboard Consolidation Plans

Architecture: each role gets one BFF endpoint + one dashboard context.
Goal: reduce API calls, eliminate re-fetches on tab switching, fix wrong stat counts.

## Execution order

| # | File | Backend endpoint | What it fixes |
|---|------|-----------------|---------------|
| 0 | `00-SHARED-INFRASTRUCTURE.md` | — | Add `skip` flags to all hooks; refactor `useTicketTable` to accept `externalSections/initialData/onDataFetched`; fix redundant `useUserData()` in 4 layouts |
| 1 | `01-technician.md` | `GET /api/technicians/me/dashboard/` | 7 calls → 1; stats card page-slice bug; remove SharedDataProvider from technician |
| 2 | `02-hod.md` | `GET /api/hod/me/dashboard/` | 3× duplicate `useHODAnalytics` calls → 1 |
| 3 | `03-section-head.md` | `GET /api/section-head/me/dashboard/` | 3× duplicate `useSectionHeadAnalytics` calls → 1 |
| 4 | `04-manager.md` | `GET /api/manager/me/dashboard/` | 2× duplicate `useManagerAnalytics` calls → 1; `days` param change updates all tabs |
| 5 | `05-admin.md` | None (admin is too dynamic) | Lift chart queries to parent; halve chart API calls |
| 6 | `06-user.md` | `GET /api/user/me/dashboard/` | 5 calls → 1 (user role gets 0 useful data from SharedDataContext) |

## Pattern applied to each role (except admin)

```
Layout
  └── {Role}DashboardProvider        ← fetches once, caches data
        └── layout content
              ├── Tab A              ← reads from context (0 fetch on switch)
              ├── Tab B              ← reads from context (0 fetch on switch)
              └── Tab C              ← lazy-fetches on first visit, caches result
```

After mutation (ticket update): single `refetch()` on context, not per-table refetches.

## Call count summary

| Role | Before (load) | After (load) | Tab switch | Stats accuracy |
|------|-------------|-------------|------------|----------------|
| Technician | 7 | **1** | 0 | Fixed (server KPIs) |
| HOD | 6 | **1** | 0 | Correct |
| Section Head | 6 | **1** | 0 | Correct |
| Manager | 6 | **1** | 0 | Correct |
| Admin | 6 | 6 (unchanged) | varies | Correct |
| User | 5 | **1** | 0 | Correct |
