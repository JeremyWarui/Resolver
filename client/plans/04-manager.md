# Plan: Manager Dashboard Consolidation

**Depends on:** `00-SHARED-INFRASTRUCTURE.md` completed first.

---

## Problems specific to ManagerLayout

1. **Double analytics duplication**: `useManagerAnalytics()` is called independently in 2
   components — `ManagerDashboard` (no `days` param) and `ManagerAnalytics` (with `days` state).
   These can never share state because the `days` param differs and there's no shared cache.
2. `SharedDataProvider` fires 4 calls; `adminAnalytics` is the one manager uses, the rest
   are used for filter dropdowns.
3. Redundant `useUserData()` in `ManagerLayout`.
4. Tab switching re-fetches ticket list in `ManagerTickets`.

---

## Backend: `GET /api/manager/me/dashboard/`

**New file:** `tickets/api/views/manager_dashboard_view.py`

Reuses `ManagerAnalytics.manager_dashboard(user, days=days)`. Adds:
- `department` — the manager's department info
- `campuses` — all campuses with that department's sections present
- `tickets_summary` — aggregate counts by status across all department tickets

```python
class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ("manager", "admin"):
            return Response({"detail": "Manager role required."}, status=403)
        if user.role == "admin":
            user_id = request.query_params.get("user_id")
            if user_id:
                user = get_object_or_404(CustomUser, pk=user_id, role="manager")

        days = int(request.query_params.get("days", 30))
        analytics = ManagerAnalytics.manager_dashboard(user, days=days)

        dept = user.primary_department
        tickets_summary = {}
        if dept:
            status_counts = dict(
                Ticket.objects.filter(
                    section__campus_department__department=dept
                ).values_list("status").annotate(count=Count("id")).values_list("status","count")
            )
            tickets_summary = status_counts

        return Response({
            **analytics,
            "department": {
                "id": dept.id if dept else None,
                "name": dept.name if dept else None,
            },
            "tickets_summary": tickets_summary,
        })
```

**Response shape:**
```json
{
  // all existing ManagerAnalytics.manager_dashboard fields
  "department": { "id": N, "name": "ICT" },
  "tickets_summary": { "open": N, "assigned": N, "in_progress": N, "pending": N }
}
```

**URL (tickets/api/urls.py):**
```python
path("manager/me/dashboard/", ManagerDashboardView.as_view(), name="manager-dashboard"),
```

**Backend files:**
| File | Action |
|------|--------|
| `tickets/api/views/manager_dashboard_view.py` | CREATE |
| `tickets/api/views/index.py` | MODIFY — re-export |
| `tickets/api/urls.py` | MODIFY — add URL pattern |

---

## Frontend: ManagerDashboardContext

### New files

**`client/src/api/services/managerService.ts`**
```ts
export async function getManagerDashboard(days = 30): Promise<ManagerDashboard> {
  const { data } = await apiClient.get(`/manager/me/dashboard/?days=${days}`);
  return data;
}
```

**`client/src/types/manager.ts`**
Interfaces for `ManagerDashboard`, extending existing analytics types.

**`client/src/contexts/ManagerDashboardContext.tsx`**
```tsx
interface ManagerDashboardContextValue {
  data: ManagerDashboard | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;  // ManagerAnalytics page changes days; triggers refetch
  refetch: () => void;
  managerTickets: Ticket[] | null;
  setManagerTickets: (t: Ticket[]) => void;
}
```

When `days` changes (`setDays`), the context re-fetches the dashboard with the new `days` param.
This replaces the independent `useManagerAnalytics({ days })` in `ManagerAnalytics.tsx`.

### Modified files

**`ManagerLayout.tsx`**
- Remove `SharedDataProvider`
- Replace `useUserData()` with `useCurrentUser()`
- Wrap with `ManagerDashboardProvider`

**`ManagerDashboard.tsx`**
- Remove `useManagerAnalytics()` call
- Read analytics from `useManagerDashboard().data`

**`ManagerAnalytics.tsx`**
- Remove independent `useManagerAnalytics({ days })` call
- Read analytics from `useManagerDashboard().data`
- Call `setDays(newDays)` from context when user changes the days slider/selector
  → this triggers a context refetch and updates data for all tabs simultaneously

**`ManagerTickets.tsx`**
- Use `initialData={managerTickets}` + `onDataFetched={setManagerTickets}` in `useTicketTable`
- Pass `externalSections` from `data.sections` (if analytics includes section list)

### Frontend files

| File | Action |
|------|--------|
| `client/src/api/services/managerService.ts` | CREATE |
| `client/src/types/manager.ts` | CREATE |
| `client/src/contexts/ManagerDashboardContext.tsx` | CREATE |
| `client/src/components/ManagerDashboard/ManagerLayout.tsx` | MODIFY |
| `client/src/components/ManagerDashboard/ManagerDashboard.tsx` | MODIFY |
| `client/src/components/ManagerDashboard/ManagerAnalytics.tsx` | MODIFY |
| `client/src/components/ManagerDashboard/ManagerTickets.tsx` | MODIFY |

---

## Call count comparison

| Scenario | Before | After |
|---|---|---|
| Dashboard initial load | 6 calls | **1 call** |
| Switch to "Analytics" tab | 1 `/analytics/manager/` | **0** (reads context) |
| Change days slider in Analytics | 1 `/analytics/manager/?days=N` | **1** (context refetch, updates all tabs) |
| Switch to "Tickets" tab | 1 `/tickets/` | **0** (context) |
| Total `/analytics/manager/` calls on full navigation | 2 | **1** |

---

## Verification

- `pytest tickets/tests/ -k "manager_dashboard"` — new endpoint tests
- DevTools Network: login as `manager_ict` → 1 call on load
- Change days range → 1 call, analytics data updates everywhere
