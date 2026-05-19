# Plan: Shared Infrastructure Changes

These changes must be done BEFORE implementing individual role dashboards.
Every role-dashboard plan depends on this foundation.

---

## Problem summary

1. **`SharedDataContext` fires 4 API calls for every role**, even when most of that data is
   unused (e.g., `user` and `technician` roles get empty arrays for 3 of 4 calls).
   None of the hooks it calls (`useUsers`, `useSections`, `useFacilities`, `useAdminAnalytics`)
   have a `skip` or `enabled` flag — so the fetches cannot be conditionally suppressed.

2. **`useTicketTable` hard-couples every table to `useSharedData()`** — it reads `sections`,
   `users`, `technicians`, `facilities` from context for filter dropdowns. This forces every
   role layout (even simple ones) to wrap in `SharedDataProvider`.

3. **`useUserData()` is called redundantly in 4 layouts** (`ManagerLayout`, `HODLayout`,
   `SectionHeadLayout`, `TechnicianLayout`) even though `UserDataProvider` (at root level)
   already provides `userData` via `useCurrentUser()`.

4. **Analytics hooks have no skip/enabled flag** — `useHODAnalytics`, `useSectionHeadAnalytics`,
   `useManagerAnalytics`, `useAdminAnalytics` each fire unconditionally on mount. Role-specific
   dashboards currently call these hooks independently in 2-3 separate components, causing
   duplicate requests.

---

## Changes Required

### 1. Add `skip` flag to each hook called by SharedDataContext

**Files to modify:**
- `client/src/hooks/users/useUsers.ts` — add `skip?: boolean` param, guard `useEffect` with it
- `client/src/hooks/sections/useSections.ts` — same
- `client/src/hooks/facilities/useFacilities.ts` — same
- `client/src/hooks/analytics/useAdminAnalytics.ts` — same

Pattern (same for all four):
```ts
// Before
export function useUsers(params = {}): UseUsersResult {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetchUsers() }, [params]);
  ...
}

// After
export function useUsers(params = {}, skip = false): UseUsersResult {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (skip) return;
    fetchUsers();
  }, [params, skip]);
  ...
}
```

---

### 2. Update SharedDataContext to skip role-irrelevant calls

**File to modify:** `client/src/contexts/SharedDataContext.tsx`

Pass `skip` based on role before calling each hook:

```tsx
const { role } = useCurrentUser();

// Only admin/manager/hod/head_of_section need full org data
const skipOrgData = !['admin', 'manager', 'hod', 'head_of_section'].includes(role);
// Only admin/manager need analytics
const skipAnalytics = !['admin', 'manager'].includes(role);

const { sections, ... } = useSections(skipOrgData && role !== 'technician');
const { users, ... } = useUsers({page_size: 500}, skipOrgData);
const { facilities, ... } = useFacilities(skipOrgData);
const { adminAnalytics, ... } = useAdminAnalytics(skipAnalytics);
```

Technician role still needs `sections` (for filter dropdown in ticket tables) so don't skip it for technician.

**Result:** With role-specific dashboard contexts (below), SharedDataProvider will be REMOVED
from most layouts entirely. This change is a safety net for any layout that still uses it during
the transition.

---

### 3. Add analytics hooks skip/enabled flag

**Files to modify:**
- `client/src/hooks/analytics/useManagerAnalytics.ts` — add `skip?: boolean`
- `client/src/hooks/analytics/useHODAnalytics.ts` — add `skip?: boolean`
- `client/src/hooks/analytics/useSectionHeadAnalytics.ts` — add `skip?: boolean`
- `client/src/hooks/analytics/useTechnicianAnalytics.ts` — add `skip?: boolean`
- `client/src/hooks/analytics/useAdminAnalytics.ts` — already covered above

Pattern (same for all):
```ts
export function useHODAnalytics(params?: { days?: number }, skip = false) {
  useEffect(() => {
    if (skip) return;
    fetchHODAnalytics();
  }, [params?.days, skip]);
}
```

These hooks become useful again when a component needs to refetch analytics with dynamic
params (e.g., changing `days` on a reports page) without going through the dashboard context.

---

### 4. Refactor `useTicketTable` to accept optional external data

**File to modify:** `client/src/hooks/tickets/useTicketTable.ts`

Add optional override params so the hook does not REQUIRE `SharedDataProvider`:

```ts
interface UseTicketTableConfig {
  // ... existing fields ...
  externalSections?: Section[];    // if provided, skips useSharedData().sections
  externalUsers?: User[];          // if provided, skips useSharedData().users
  externalTechnicians?: User[];    // if provided, skips useSharedData().technicians
  externalFacilities?: Facility[]; // if provided, skips useSharedData().facilities
  initialData?: Ticket[];          // pre-load table with this data; skip initial fetch
  onDataFetched?: (tickets: Ticket[]) => void; // callback after fetch (for caching in context)
}
```

Inside the hook:
```ts
const sharedData = useSharedData();
const sections = config.externalSections ?? sharedData.sections;
const users = config.externalUsers ?? sharedData.users;
// etc.
```

This allows role layouts that use `TechnicianDashboardContext` (or similar) to pass their own
scoped data and not depend on `SharedDataProvider` at all.

**Note on `initialData`:** When provided, the hook should skip the initial `GET /tickets/` fetch
and populate `tableData` from `initialData` instead. Subsequent filter/page changes still fetch.

---

### 5. Remove redundant `useUserData()` calls from role layouts

**Files to modify:**
- `client/src/components/ManagerDashboard/ManagerLayout.tsx`
- `client/src/components/HODDashboard/HODLayout.tsx`
- `client/src/components/SectionHeadDashboard/SectionHeadLayout.tsx`
- `client/src/components/TechnicianDashboard/TechnicianLayout.tsx`

All four call `useUserData()` independently for the header, but `UserDataProvider` is at the
root (`main.tsx`) and already provides `useCurrentUser()` everywhere. Replace:
```tsx
// Before
const { userData, loading: userLoading } = useUserData();

// After
const { userData, loading: userLoading } = useCurrentUser();
```

`AdminLayout` already does this correctly (reads from `useSharedData()` which gets it from context).

---

## Order of implementation

1. Add `skip` to `useUsers`, `useSections`, `useFacilities`, `useAdminAnalytics`
2. Add `skip` to analytics hooks
3. Update `SharedDataContext` to pass role-based skip flags
4. Add `externalSections/initialData/onDataFetched` to `useTicketTable`
5. Fix redundant `useUserData()` in 4 layout files

Then implement individual role dashboard plans in any order.

---

## Files changed in this step

| File | Action |
|------|--------|
| `client/src/hooks/users/useUsers.ts` | MODIFY — add `skip` param |
| `client/src/hooks/sections/useSections.ts` | MODIFY — add `skip` param |
| `client/src/hooks/facilities/useFacilities.ts` | MODIFY — add `skip` param |
| `client/src/hooks/analytics/useAdminAnalytics.ts` | MODIFY — add `skip` param |
| `client/src/hooks/analytics/useManagerAnalytics.ts` | MODIFY — add `skip` param |
| `client/src/hooks/analytics/useHODAnalytics.ts` | MODIFY — add `skip` param |
| `client/src/hooks/analytics/useSectionHeadAnalytics.ts` | MODIFY — add `skip` param |
| `client/src/hooks/analytics/useTechnicianAnalytics.ts` | MODIFY — add `skip` param |
| `client/src/hooks/tickets/useTicketTable.ts` | MODIFY — add `externalSections/Users/Technicians/Facilities`, `initialData`, `onDataFetched` |
| `client/src/contexts/SharedDataContext.tsx` | MODIFY — add role-based skip flags |
| `client/src/components/ManagerDashboard/ManagerLayout.tsx` | MODIFY — remove redundant `useUserData()` |
| `client/src/components/HODDashboard/HODLayout.tsx` | MODIFY — remove redundant `useUserData()` |
| `client/src/components/SectionHeadDashboard/SectionHeadLayout.tsx` | MODIFY — remove redundant `useUserData()` |
| `client/src/components/TechnicianDashboard/TechnicianLayout.tsx` | MODIFY — remove redundant `useUserData()` |
