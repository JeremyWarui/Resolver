# Plan: User Dashboard Consolidation

**Depends on:** `00-SHARED-INFRASTRUCTURE.md` completed first.

---

## Problems specific to UserLayout

1. **Double analytics duplication**: `useUserTicketCounts(userId)` is called independently
   in `UserStatsCards`, which is used in BOTH `UserDashboard` and `UserTickets` — firing
   `GET /api/analytics/user/` twice (once per tab visit).
2. `SharedDataProvider` fires 4 calls but returns `[]` for ALL data for the user role.
   This is the most wasteful case — 4 API calls, 0 useful results.
3. `UserLayout` reads `userData` from `useCurrentUser()` correctly (no redundant `useUserData`).

---

## Backend: `GET /api/user/me/dashboard/`

**New file:** `tickets/api/views/user_dashboard_view.py`

Reuses `UserAnalytics.for_user(user)`. Adds:
- `recent_tickets` — last 10 tickets raised by this user (for the dashboard home table)
- `tickets_summary` — counts by status (so frontend doesn't need to derive from ticket list)

```python
class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # All roles can access their own user stats, but this endpoint is for 'user' role
        analytics = UserAnalytics.for_user(user)

        recent = list(
            Ticket.objects.filter(raised_by=user)
            .select_related("section", "campus_department__campus", "assigned_to")
            .order_by("-created_at")[:10]
            .values("id", "ticket_no", "title", "status", "priority", "created_at",
                campus=F("campus_department__campus__code"),
                section_name=F("section__name"))
        )
        status_counts = dict(
            Ticket.objects.filter(raised_by=user)
            .values_list("status").annotate(count=Count("id")).values_list("status","count")
        )

        return Response({
            **analytics,
            "recent_tickets": recent,
            "tickets_summary": status_counts,
        })
```

**Response shape:**
```json
{
  // all existing UserAnalytics.for_user fields
  "recent_tickets": [{ "id", "ticket_no", "title", "status", "priority", "created_at", "campus", "section_name" }],
  "tickets_summary": { "open": N, "resolved": N, "pending": N, "closed": N }
}
```

**URL (tickets/api/urls.py):**
```python
path("user/me/dashboard/", UserDashboardView.as_view(), name="user-dashboard"),
```

**Backend files:**
| File | Action |
|------|--------|
| `tickets/api/views/user_dashboard_view.py` | CREATE |
| `tickets/api/views/index.py` | MODIFY — re-export |
| `tickets/api/urls.py` | MODIFY — add URL pattern |

---

## Frontend: UserDashboardContext

### New files

**`client/src/api/services/userDashboardService.ts`**
```ts
export async function getUserDashboard(): Promise<UserDashboard> {
  const { data } = await apiClient.get('/user/me/dashboard/');
  return data;
}
```

**`client/src/types/user.ts`** (or extend existing user types)
Interfaces for `UserDashboard`, `UserTicketsSummary`, `RecentTicket`.

**`client/src/contexts/UserDashboardContext.tsx`**
```tsx
interface UserDashboardContextValue {
  data: UserDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  userTickets: Ticket[] | null;      // cached full ticket list for UserTickets tab
  setUserTickets: (t: Ticket[]) => void;
}
```

### Modified files

**`UserLayout.tsx`**
- Remove `SharedDataProvider` — user role gets zero data from it anyway
- Wrap with `UserDashboardProvider`

**`UserDashboard.tsx`**
- Remove `useUserTicketCounts(userId)` call
- Read stats from `useUserDashboard().data`
- Read `data.recent_tickets` for the `PostedTicketsTable` initial data
  (no fetch on dashboard home — shows the 10 most recent tickets immediately)

**`UserTickets.tsx`**
- Remove `useUserTicketCounts(userId)` call
- Read stats from context
- Use `initialData={userTickets}` + `onDataFetched={setUserTickets}` in `useTicketTable`

**`UserStatsCards.tsx`** (no structural change)
- Parent passes counts from `data.tickets_summary` — no change to this component itself

### Frontend files

| File | Action |
|------|--------|
| `client/src/api/services/userDashboardService.ts` | CREATE |
| `client/src/types/user.ts` | CREATE (or extend existing) |
| `client/src/contexts/UserDashboardContext.tsx` | CREATE |
| `client/src/components/UserDashboard/UserLayout.tsx` | MODIFY — remove SharedDataProvider, add UserDashboardProvider |
| `client/src/components/UserDashboard/UserDashboard.tsx` | MODIFY — remove useUserTicketCounts |
| `client/src/components/UserDashboard/UserTickets.tsx` | MODIFY — remove useUserTicketCounts, use context tickets |

---

## Call count comparison

| Scenario | Before | After |
|---|---|---|
| Dashboard initial load | 5 calls (4 wasted SharedData + 1 analytics) | **1 call** |
| Switch to "My Tickets" tab | 1 `/analytics/user/` + 1 `/tickets/` | **0** (context) |
| Submit a ticket | 1 `POST /tickets/create/` | 1 `POST` + **1** context refetch |
| Total `/analytics/user/` calls on full navigation | 2 | **1** |

---

## Verification

- `pytest tickets/tests/ -k "user_dashboard"` — new endpoint tests
- DevTools Network: login as `user_sarah` → confirm 0 users/sections/facilities/admin-analytics calls
- Dashboard home shows recent tickets immediately without a second fetch
