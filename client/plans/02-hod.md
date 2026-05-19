# Plan: HOD Dashboard Consolidation

**Depends on:** `00-SHARED-INFRASTRUCTURE.md` completed first.

---

## Problems specific to HODLayout

1. **Triple analytics duplication**: `useHODAnalytics()` is called independently in 3 separate
   components — `HODDashboard`, `HODTickets`, `HODTechnicians`. Every tab visit fires another
   `GET /api/analytics/hod/`.
2. `SharedDataProvider` fires 4 calls but `adminAnalytics` is never used by HOD.
3. Redundant `useUserData()` call in `HODLayout` (root `UserDataProvider` already has the user).
4. Tab switching re-fetches ticket list in `HODTickets` on every return visit.

---

## Backend: `GET /api/hod/me/dashboard/`

**New file:** `tickets/api/views/hod_dashboard_view.py`

Reuses `HODAnalytics.hod_dashboard(user)` for the analytics payload. Adds:
- `sections` — all sections under the HOD's `CampusDepartment`
- `technicians` — active technicians assigned to those sections
- `tickets_summary` — aggregate counts by status for the HOD's scope (not a list)

```python
class HODDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ("hod", "admin"):
            return Response({"detail": "HOD role required."}, status=403)
        if user.role == "admin":
            user_id = request.query_params.get("user_id")
            if user_id:
                user = get_object_or_404(CustomUser, pk=user_id, role="hod")

        days = int(request.query_params.get("days", 30))
        analytics = HODAnalytics.hod_dashboard(user, days=days)

        # Sections under HOD's CampusDepartment
        campus_dept = user.primary_campus_department  # existing property on CustomUser
        sections = []
        technicians = []
        if campus_dept:
            sections = list(
                Section.objects.filter(campus_department=campus_dept)
                .select_related("section_type")
                .values("id", "name", "code", section_type_name=F("section_type__name"))
            )
            section_ids = [s["id"] for s in sections]
            status_counts = dict(
                Ticket.objects.filter(section__in=section_ids)
                .values_list("status").annotate(count=Count("id")).values_list("status","count")
            )
            technicians = list(
                CustomUser.objects.filter(
                    techniciansection__section__in=section_ids,
                    is_active=True, role="technician"
                ).distinct().values("id", "username",
                    name=Concat("first_name", Value(" "), "last_name"))
            )

        return Response({
            **analytics,
            "sections": sections,
            "technicians": technicians,
            "tickets_summary": status_counts if campus_dept else {},
        })
```

**Response shape** (extends existing `HODAnalytics.hod_dashboard` output):
```json
{
  // existing analytics fields (overview, department stats, etc.)
  "sections": [{ "id", "name", "code", "section_type_name" }],
  "technicians": [{ "id", "username", "name" }],
  "tickets_summary": { "open": N, "assigned": N, "in_progress": N, "pending": N }
}
```

**URL (tickets/api/urls.py):**
```python
path("hod/me/dashboard/", HODDashboardView.as_view(), name="hod-dashboard"),
```

**Backend files:**
| File | Action |
|------|--------|
| `tickets/api/views/hod_dashboard_view.py` | CREATE |
| `tickets/api/views/index.py` | MODIFY — re-export |
| `tickets/api/urls.py` | MODIFY — add URL pattern |

---

## Note: Ticket assignment — `available_technicians` is already handled

When a HOD opens a ticket in `TicketDetailModal` and assigns it to a technician, the available
technicians are returned by `GET /api/tickets/<id>/` as the `available_technicians` field
(populated by `TicketSerializer.get_available_technicians()` from `section.technician_links`).

- `TicketSerializer.get_fields()` includes `available_technicians` only for `hod`, `head_of_section`,
  and `admin` roles — it is stripped for other roles.
- The list is **section-specific** (only technicians assigned to THAT ticket's section via
  `TechnicianSection`) — it cannot be pre-cached from the dashboard context.
- `TicketDetailModal` must continue to fetch `GET /api/tickets/<id>/` independently to get
  this list. Do NOT replace this with the context `data.technicians` (which is all technicians
  across all HOD sections — too broad for assignment).
- After the context is implemented, the dashboard context `data.technicians` is useful for
  display/filter purposes (e.g., the technicians filter dropdown in the HODTickets table),
  NOT for populating the assignment dropdown in the detail modal.

---

## Frontend: HODDashboardContext

### New files

**`client/src/api/services/hodService.ts`**
```ts
export async function getHODDashboard(days = 30): Promise<HODDashboard> {
  const { data } = await apiClient.get(`/hod/me/dashboard/?days=${days}`);
  return data;
}
```

**`client/src/types/hod.ts`**
Interfaces for `HODDashboard`, `HODSection`, `HODTechnician`, `HODTicketsSummary`.
Extend existing analytics types from `useHODAnalytics` — reuse the same shape.

**`client/src/contexts/HODDashboardContext.tsx`**
```tsx
interface HODDashboardContextValue {
  data: HODDashboard | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;  // for reports page that changes the days param
  refetch: () => void;
  hodTickets: Ticket[] | null;          // cached ticket list for HODTickets tab
  setHodTickets: (t: Ticket[]) => void;
}

export function HODDashboardProvider({ children }) {
  const [days, setDays] = useState(30);
  // fetchDashboard called on mount and when days changes
  // ...same pattern as TechnicianDashboardContext
}
```

### Modified files

**`HODLayout.tsx`**
- Remove `SharedDataProvider`
- Replace `useUserData()` with `useCurrentUser()`
- Wrap with `HODDashboardProvider`

**`HODDashboard.tsx`**
- Remove `useHODAnalytics()` call
- Read analytics from `useHODDashboard().data`
- Pass `externalSections` from context to any section-aware component

**`HODTickets.tsx`**
- Remove `useHODAnalytics()` call (used for `HODStatsCards`)
- Read stats from `useHODDashboard().data`
- Read `hodTickets` from context as `initialData` for `useTicketTable`
- Cache result with `onDataFetched={setHodTickets}`

**`HODTechnicians.tsx`**
- Remove `useHODAnalytics()` call
- Read `data.technicians` and `data.sections` from context instead of `useSharedData()`

### Frontend files

| File | Action |
|------|--------|
| `client/src/api/services/hodService.ts` | CREATE |
| `client/src/types/hod.ts` | CREATE |
| `client/src/contexts/HODDashboardContext.tsx` | CREATE |
| `client/src/components/HODDashboard/HODLayout.tsx` | MODIFY |
| `client/src/components/HODDashboard/HODDashboard.tsx` | MODIFY |
| `client/src/components/HODDashboard/HODTickets.tsx` | MODIFY |
| `client/src/components/HODDashboard/HODTechnicians.tsx` | MODIFY |

---

## Call count comparison

| Scenario | Before | After |
|---|---|---|
| Dashboard initial load | 6 calls | **1 call** |
| Switch to "Tickets" tab | 1 `/analytics/hod/` + 1 `/tickets/` | **0** (context) |
| Switch to "Technicians" tab | 1 `/analytics/hod/` | **0** (context) |
| Return to dashboard tab | 1 `/analytics/hod/` | **0** (context) |
| Total `/analytics/hod/` calls on full navigation | 3 | **1** |

---

## Verification

- `pytest tickets/tests/ -k "hod_dashboard"` — new endpoint tests
- DevTools Network: login as `hod_ict_nrb` → 1 call on load, 0 on tab switch
