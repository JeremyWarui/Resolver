# Plan: Technician Dashboard Consolidation

**Depends on:** `00-SHARED-INFRASTRUCTURE.md` completed first.

---

## Problems specific to TechnicianLayout

1. Tab switching re-fetches: `TechSectionTickets` and `TechTickets` each own their `useTicketTable`
   call. The `&&` rendering unmounts the tab component on switch and re-fetches on remount.
2. `SharedDataProvider` fires 4 calls but only `sections` is ever used by technician.
3. `TechReport` calls `useTickets` independently (third separate ticket list fetch).
4. Stats card counts derived client-side from current page (page-slice bug — counts only the
   visible 20 rows, not server totals).
5. `useTechnicianAnalytics` hook exists but is never wired into TechnicianLayout.

---

## Backend: `GET /api/technicians/me/dashboard/`

**New file:** `tickets/api/views/technician_dashboard_view.py`

```python
class TechnicianDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == "admin":
            user_id = request.query_params.get("user_id")
            if user_id:
                user = get_object_or_404(CustomUser, pk=user_id, role="technician")
        elif user.role not in ("technician", "head_of_section"):
            return Response({"detail": "Insufficient permissions."}, status=403)

        analytics = TechnicianAnalytics.for_technician(user)  # reuses cached result

        assigned_qs = (
            Ticket.objects
            .filter(assigned_to=user, status__in=ACTIVE_STATUSES)
            .select_related("campus_department__campus", "section", "raised_by", "service_item")
            .order_by("-updated_at")
        )

        section_ids = list(user.sections.values_list("id", flat=True))
        status_counts = dict(
            Ticket.objects.filter(section__in=section_ids)
            .values_list("status")
            .annotate(count=Count("id"))
            .values_list("status", "count")
        )
        unassigned_count = Ticket.objects.filter(
            section__in=section_ids, assigned_to__isnull=True, status__in=ACTIVE_STATUSES
        ).count()

        return Response({
            "technician": analytics["technician"],
            "kpis": analytics["kpis"],
            "sections": analytics["sections"],
            "assigned_tickets": [_serialize_ticket(t) for t in assigned_qs],
            "section_queue": {
                "unassigned_count": unassigned_count,
                "tickets_by_status": status_counts,
            },
        })
```

`_serialize_ticket(t)` returns a dict with: `id`, `ticket_no`, `title`, `status`, `priority`,
`created_at`, `updated_at`, `due_date`, `campus` (campus code), `section_name`, `raised_by`
(name string), `pending_reason`, `pending_comment`, `escalation_level`, `escalation_status`,
`is_due_for_escalation`, `service_item` (id + name + requires_approval).

**Response shape:**
```json
{
  "technician": { "id", "username", "name", "email", "primary_campus" },
  "kpis": { "open_assignments", "resolved_today", "resolved_this_week",
            "resolved_this_month", "total_assigned", "total_resolved",
            "escalated", "resolution_rate_pct", "avg_resolution_hours", "avg_rating" },
  "sections": [{ "id", "name", "code", "campus", "department", "section_type_name" }],
  "assigned_tickets": [{ ...fields above... }],
  "section_queue": { "unassigned_count", "tickets_by_status": { "open": N, ... } }
}
```

**URL (tickets/api/urls.py)** — insert BEFORE the existing `technicians/` route:
```python
path("technicians/me/dashboard/", TechnicianDashboardView.as_view(), name="technician-dashboard"),
```

**Backend files:**
| File | Action |
|------|--------|
| `tickets/api/views/technician_dashboard_view.py` | CREATE |
| `tickets/api/views/index.py` | MODIFY — re-export `TechnicianDashboardView` |
| `tickets/api/urls.py` | MODIFY — add URL before `technicians/` |

---

## Frontend: TechnicianDashboardContext

### New files

**`client/src/api/services/technicianService.ts`**
```ts
export async function getTechnicianDashboard(): Promise<TechnicianDashboard> {
  const { data } = await apiClient.get('/technicians/me/dashboard/');
  return data;
}
```

**`client/src/types/technician.ts`**
```ts
export interface TechnicianKPIs { open_assignments: number; resolved_today: number;
  resolved_this_week: number; resolved_this_month: number; total_assigned: number;
  total_resolved: number; escalated: number; resolution_rate_pct: number;
  avg_resolution_hours: number; avg_rating: number; }

export interface TechnicianSection { id: number; name: string; code: string;
  campus: string; department: string; section_type_name: string; }

export interface DashboardTicket { id: number; ticket_no: string; title: string;
  status: string; priority: string; created_at: string; updated_at: string;
  due_date: string | null; campus: string; section_name: string; raised_by: string;
  pending_reason: string | null; pending_comment: string | null;
  escalation_level: number; escalation_status: { code: string; label: string; };
  is_due_for_escalation: boolean;
  service_item: { id: number; name: string; requires_approval: boolean; }; }

export interface SectionQueue { unassigned_count: number;
  tickets_by_status: Record<string, number>; }

export interface TechnicianDashboard {
  technician: { id: number; username: string; name: string; email: string; primary_campus: string; };
  kpis: TechnicianKPIs;
  sections: TechnicianSection[];
  assigned_tickets: DashboardTicket[];
  section_queue: SectionQueue;
}
```

**`client/src/contexts/TechnicianDashboardContext.tsx`**
```tsx
interface TechnicianDashboardContextValue {
  data: TechnicianDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  sectionTickets: Ticket[] | null;          // cached section ticket list
  setSectionTickets: (t: Ticket[]) => void;
}

export function TechnicianDashboardProvider({ children }) {
  const [data, setData] = useState<TechnicianDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionTickets, setSectionTickets] = useState<Ticket[] | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setData(await getTechnicianDashboard());
      setError(null);
    } catch { setError('Failed to load dashboard'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return (
    <TechnicianDashboardContext.Provider
      value={{ data, loading, error, refetch: fetchDashboard, sectionTickets, setSectionTickets }}
    >
      {children}
    </TechnicianDashboardContext.Provider>
  );
}
export function useTechDashboard() { /* throw if no provider */ }
```

### Modified files

**`TechnicianLayout.tsx`**
- Remove `SharedDataProvider` (no longer needed — all data comes from `TechnicianDashboardContext`)
- Replace `useUserData()` with `useCurrentUser()` (from root `UserDataProvider`)
- Wrap with `TechnicianDashboardProvider`:
```tsx
const TechnicianLayout = () => (
  <TechnicianDashboardProvider>
    <TechnicianLayoutContent />
  </TechnicianDashboardProvider>
);
```
- Pass `userData` from `useCurrentUser()` to child components instead of `useUserData()`.

**`TechTickets.tsx`** (Assigned Tickets page)
- Remove `useTicketTable` call (no fetch on mount)
- Read `assignedTickets` from `useTechDashboard().data.assigned_tickets`
- Pass `externalSections={data.sections}` to any table/filter that needs sections
- Fix stats cards: use `data.kpis` from context instead of client-side page filter
- When user applies a status filter: call `useTickets({ assigned_to: id, status: filter })`
  only then (lazy, on filter change)

**`TechnicianStatsCards.tsx`** (no structural changes needed)
- Parent (`TechTickets`) already computes `counts` from `kpis` — no change to this component
- The fix is in the parent

**`TechSectionTickets.tsx`** (Section Tickets page)
- Read `section_queue` from context for the summary counts header
- Use `useTicketTable` with `initialData={sectionTickets}` (from context) and
  `onDataFetched={setSectionTickets}` so the first fetch result is cached
- On second visit to this tab: `initialData` is populated → skip initial fetch
- Pass `externalSections={data.sections}` for filter dropdown

**`TechReport.tsx`**
- Remove independent `useTickets` call
- Use `data.assigned_tickets` from context for the base stats display
- Keep `reportsService.generateAndDownload()` (on-demand action, must stay)

### Frontend files

| File | Action |
|------|--------|
| `client/src/api/services/technicianService.ts` | CREATE |
| `client/src/types/technician.ts` | CREATE |
| `client/src/contexts/TechnicianDashboardContext.tsx` | CREATE |
| `client/src/components/TechnicianDashboard/TechnicianLayout.tsx` | MODIFY |
| `client/src/components/TechnicianDashboard/TechTickets.tsx` | MODIFY |
| `client/src/components/TechnicianDashboard/TechSectionTickets.tsx` | MODIFY |
| `client/src/components/TechnicianDashboard/TechReport.tsx` | MODIFY |

---

## Call count comparison

| Scenario | Before | After |
|---|---|---|
| Dashboard initial load | 5 calls (users, sections, facilities, admin-analytics, tickets) | **1 call** |
| Switch to "Assigned Tickets" | 1 `GET /tickets/?assigned_to=` | **0** |
| Switch back to "Section Tickets" | 1 `GET /tickets/` | **0** if already cached, 1 on first visit |
| Stats card counts | Wrong (page-slice) | **Correct** (server KPIs) |
| After ticket update | 2 table refetches | **1** dashboard refetch |

---

## Verification

- `pytest tickets/tests/ -k "technician_dashboard"` — new endpoint tests
- `pytest tickets/tests/test_views_permissions.py` — no regressions
- DevTools Network: login as `tech_alex` → 1 call on load, 0 on tab switch
