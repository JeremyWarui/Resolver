# Plan: Section Head Dashboard Consolidation

**Depends on:** `00-SHARED-INFRASTRUCTURE.md` completed first.

---

## Problems specific to SectionHeadLayout

1. **Triple analytics duplication**: `useSectionHeadAnalytics()` is called independently in 3
   components — `SectionHeadDashboard`, `SectionHeadTickets`, `SectionHeadTechnicians`. Every
   tab visit fires another `GET /api/analytics/section-head/`.
2. `SharedDataProvider` fires 4 calls; only `sections` and `technicians` are actually used.
3. Redundant `useUserData()` in `SectionHeadLayout`.
4. Tab switching re-fetches ticket list in `SectionHeadTickets` on every return.

This layout is structurally identical to HODLayout — same duplication pattern, same fix.

---

## Backend: `GET /api/section-head/me/dashboard/`

**New file:** `tickets/api/views/section_head_dashboard_view.py`

Reuses `SectionHeadAnalytics.section_head_dashboard(user)`. Adds:
- `sections` — sections this HOS heads (can be multiple if assigned to multiple sections)
- `technicians` — active technicians in those sections
- `tickets_summary` — aggregate counts by status across all HOS sections

```python
class SectionHeadDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ("head_of_section", "admin"):
            return Response({"detail": "Section head role required."}, status=403)
        if user.role == "admin":
            user_id = request.query_params.get("user_id")
            if user_id:
                user = get_object_or_404(CustomUser, pk=user_id, role="head_of_section")

        days = int(request.query_params.get("days", 30))
        analytics = SectionHeadAnalytics.section_head_dashboard(user, days=days)

        sections = list(
            Section.objects.filter(head_of_section=user)
            .select_related("section_type", "campus_department__campus")
            .values("id", "name", "code",
                campus=F("campus_department__campus__code"),
                section_type_name=F("section_type__name"))
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
            "tickets_summary": status_counts,
        })
```

**Response shape** (extends existing `SectionHeadAnalytics.section_head_dashboard` output):
```json
{
  // existing analytics fields
  "sections": [{ "id", "name", "code", "campus", "section_type_name" }],
  "technicians": [{ "id", "username", "name" }],
  "tickets_summary": { "open": N, "assigned": N, "in_progress": N, "pending": N }
}
```

**URL (tickets/api/urls.py):**
```python
path("section-head/me/dashboard/", SectionHeadDashboardView.as_view(), name="section-head-dashboard"),
```

---

## Note: Ticket assignment — `available_technicians` is already handled

When a HOS opens a ticket in `TicketDetailModal` to assign it:
- `GET /api/tickets/<id>/` returns `available_technicians` — populated from
  `section.technician_links` (technicians assigned to that specific ticket's section).
- `TicketSerializer.get_fields()` includes this field only for `head_of_section`, `hod`,
  `admin` — stripped for all other roles.
- This list is **ticket/section-specific** and must remain a separate fetch via
  `TicketDetailModal` — it cannot be pre-loaded from the dashboard context.
- The dashboard context `data.technicians` (all technicians across all HOS sections) is
  useful for filter dropdowns in `SectionHeadTechnicians`, NOT for ticket assignment.
- After a ticket is assigned, call `dashboardRefetch()` so the section queue counts update.

**Backend files:**
| File | Action |
|------|--------|
| `tickets/api/views/section_head_dashboard_view.py` | CREATE |
| `tickets/api/views/index.py` | MODIFY — re-export |
| `tickets/api/urls.py` | MODIFY — add URL pattern |

---

## Frontend: SectionHeadDashboardContext

### New files

**`client/src/api/services/sectionHeadService.ts`**
```ts
export async function getSectionHeadDashboard(days = 30): Promise<SectionHeadDashboard> {
  const { data } = await apiClient.get(`/section-head/me/dashboard/?days=${days}`);
  return data;
}
```

**`client/src/types/sectionHead.ts`**
Interfaces for `SectionHeadDashboard`, `SectionHeadSection`, `SectionHeadTechnician`,
`SectionHeadTicketsSummary`. Extend analytics types from `useSectionHeadAnalytics`.

**`client/src/contexts/SectionHeadDashboardContext.tsx`**
```tsx
interface SectionHeadDashboardContextValue {
  data: SectionHeadDashboard | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;
  refetch: () => void;
  sectionTickets: Ticket[] | null;
  setSectionTickets: (t: Ticket[]) => void;
}
```

### Modified files

**`SectionHeadLayout.tsx`**
- Remove `SharedDataProvider`
- Replace `useUserData()` with `useCurrentUser()`
- Wrap with `SectionHeadDashboardProvider`

**`SectionHeadDashboard.tsx`**
- Remove `useSectionHeadAnalytics()` call
- Read analytics from `useSectionHeadDashboard().data`

**`SectionHeadTickets.tsx`**
- Remove `useSectionHeadAnalytics()` call (used for stats cards)
- Read stats from context
- Use `initialData={sectionTickets}` + `onDataFetched={setSectionTickets}` in `useTicketTable`

**`SectionHeadTechnicians.tsx`**
- Remove `useSectionHeadAnalytics()` call
- Read `data.technicians` and `data.sections` from context

### Frontend files

| File | Action |
|------|--------|
| `client/src/api/services/sectionHeadService.ts` | CREATE |
| `client/src/types/sectionHead.ts` | CREATE |
| `client/src/contexts/SectionHeadDashboardContext.tsx` | CREATE |
| `client/src/components/SectionHeadDashboard/SectionHeadLayout.tsx` | MODIFY |
| `client/src/components/SectionHeadDashboard/SectionHeadDashboard.tsx` | MODIFY |
| `client/src/components/SectionHeadDashboard/SectionHeadTickets.tsx` | MODIFY |
| `client/src/components/SectionHeadDashboard/SectionHeadTechnicians.tsx` | MODIFY |

---

## Call count comparison

| Scenario | Before | After |
|---|---|---|
| Dashboard initial load | 6 calls | **1 call** |
| Switch to "Tickets" tab | 1 `/analytics/section-head/` + 1 `/tickets/` | **0** (context) |
| Switch to "Technicians" tab | 1 `/analytics/section-head/` | **0** (context) |
| Total `/analytics/section-head/` calls on full navigation | 3 | **1** |

---

## Verification

- `pytest tickets/tests/ -k "section_head_dashboard"` — new endpoint tests
- DevTools Network: login as `hos_ict_nrb` → 1 call on load, 0 on tab switch
