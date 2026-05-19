# Resolver Frontend: Architecture Analysis & Optimization Report

> **Scope**: Full codebase audit — 6 dashboards, all shared infrastructure, backend API contract  
> **Date**: 2026-05-19  
> **Model**: Multi-agent forensic analysis (8 subagents)  
> **Validated**: 2026-05-19 — forensic re-audit against actual codebase + live Django backend. Corrections in §11.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Industry Benchmark](#2-industry-benchmark)
3. [Cross-Dashboard Component Analysis](#3-cross-dashboard-component-analysis)
   - [Ticket Tables](#31-ticket-tables)
   - [Charts](#32-charts)
   - [Stat Cards](#33-stat-cards)
   - [Quick Filters](#34-quick-filters)
   - [Reports & Analytics](#35-reports--analytics)
   - [Sidebar Navigation](#36-sidebar-navigation)
   - [Layout Wrappers](#37-layout-wrappers)
   - [Modals & Detail Sheets](#38-modals--detail-sheets)
4. [Cross-Role Purpose Duplication](#4-cross-role-purpose-duplication)
   - [Technicians List View](#41-technicians-list-view)
   - [Sections Overview](#42-sections-overview)
   - [Technician Performance List](#43-technician-performance-list)
   - [Campus / Section Breakdown Table](#44-campus--section-breakdown-table)
   - [Analytics & Reports Pages](#45-analytics--reports-pages)
   - [Ticket Table Pages](#46-ticket-table-pages)
   - [What Is Correctly Unified](#47-what-is-correctly-unified)
5. [Component Reusability Matrix](#5-component-reusability-matrix)
6. [State Management Architecture](#6-state-management-architecture)
7. [Backend API Constraints](#7-backend-api-constraints)
8. [Deep Codebase Audit](#8-deep-codebase-audit)
   - [Admin CRUD Pattern Duplication](#81-admin-crud-pattern-duplication)
   - [API Services Layer Issues](#82-api-services-layer-issues)
   - [Micro-Pattern Duplication](#83-micro-pattern-duplication)
   - [Type System Gaps](#84-type-system-gaps)
   - [Constants & Configuration Issues](#85-constants--configuration-issues)
   - [Codebase-Wide Pattern Scan](#86-codebase-wide-pattern-scan)
9. [Deduplication & Refactoring Plan](#9-deduplication--refactoring-plan)
10. [Proposed New File Structure](#10-proposed-new-file-structure)
11. [Audit Validation Log — Corrections & New Findings](#11-audit-validation-log--corrections--new-findings)
    - [11.1 Corrections to Original Analysis](#111-corrections-to-original-analysis)
    - [11.2 New Findings](#112-new-findings-not-in-original-analysis)
    - [11.3 Backend API — Confirmed Alignment](#113-backend-api--confirmed-alignment)
    - [11.4 Evidence-Based Priority Adjustment](#114-evidence-based-priority-adjustment)

---

## 1. Executive Summary

The Resolver frontend is a well-structured, role-aware SPA with good foundational decisions: BFF-pattern dashboards, a shared `DataTable`, centralized `TicketDetailModal`, and role-scoped context fetching. However iterative development has produced systematic duplication at every layer — visual components, business logic, API services, type definitions, and constants.

**Full audit total: ~6,500+ redundant/duplicate lines across 90+ files.**  
**Estimated recoverable by structured refactoring: ~4,200 lines (65%).**

### Complete duplication inventory

| Category | Files | Duplicate Lines | Recovery |
|----------|-------|-----------------|---------|
| **Dashboard-level UI** | | | |
| Sidebar navigation (6 similar shells — config diffs only) | 6 | ~280 | ~120 |
| Layout wrappers (6 identical shells + ComingSoon ×6) | 6 | ~505 | ~330 |
| Dashboard context providers (6 × ~115 lines, 87% identical) | 6 | ~600 | ~500 |
| Analytics hooks (5 × ~45 lines, identical structure) | 5 | ~180 | ~150 |
| **Component-level UI** | | | |
| Chart components (bar + pie copy-pasted ×3–4) | 5 | ~220 | ~130 |
| Stat card components (Admin/Manager bypass `RoleStatsGrid`) | 3 | ~200 | ~180 |
| Quick filter components (Admin + Tech custom) | 2 | ~80 | ~80 |
| TechReport hardcoded `<Card>` blocks | 1 | ~80 | ~80 |
| Admin detail sheets (3 × 78% identical) | 3 | ~620 | ~483 |
| **Cross-role purpose duplicates** | | | |
| Technicians list view (3 separate implementations) | 3 | ~250 | ~250 |
| Sections overview (3 separate implementations) | 3 | ~120 | ~120 |
| Technician workload list (2× verbatim) | 2 | ~40 | ~40 |
| Campus breakdown table (2× 90% identical) | 2 | ~50 | ~50 |
| Analytics/reports (shared sub-patterns) | 4 | ~150 | ~150 |
| Ticket table page setup (Manager/Tech bypass wrapper) | 2 | ~60 | ~60 |
| **Admin CRUD pages** | | | |
| Table container boilerplate (Card+Search+Columns+Pagination) | 5 | ~600 | ~500 |
| Sortable column header pattern | 5 | ~200 | ~150 |
| Page fetch+state boilerplate (`useCRUDPage` opportunity) | 2 | ~100 | ~80 |
| DRF error handler repeated in detail sheets | 3 | ~50 | ~50 |
| Inline form pattern (Campuses/Departments vs react-hook-form) | 2 | ~100 | ~80 |
| **Micro-patterns** | | | |
| Skeleton loading (4 implementations, `Skeleton` unused in half) | 12 | ~120 | ~100 |
| Empty state patterns (4 implementations, no shared component) | 12 | ~100 | ~90 |
| Error display (AlertCircle block verbatim in 3 report files) | 3 | ~50 | ~50 |
| Date range picker (2 implementations) | 2 | ~40 | ~40 |
| Export/download spinner (3 implementations) | 3 | ~60 | ~50 |
| Technician workload table (5 implementations) | 5 | ~120 | ~100 |
| List-item-with-badges pattern (8 files, `divide-y`) | 8 | ~280 | ~250 |
| **API services layer** | | | |
| `sectionsService.ts` fully duplicated by `organizationsService` | 1 | ~40 | ~40 |
| `facilitiesService.ts` fully duplicated by `organizationsService` | 1 | ~36 | ~36 |
| `techniciansService` duplicates `usersService` methods | 1 | ~8 | ~8 |
| Service files not in `index.ts` barrel (`hodService`, `managerService`, `sectionHeadService`, `technicianService`, `userDashboardService`, `sectionsService`, `facilitiesService`, `catalogueService`) | 8 | 0 | org |
| Root-level `useSections` + `useFacilities` hooks (orphaned) | 2 | ~30 | ~30 |
| Magic link dead code in `authService` + `useAuth` | 2 | ~80 | ~80 |
| **Constants & types** | | | |
| `STATUS_LABELS` defined in 3 places | 2 | ~30 | ~25 |
| `PRIORITY_BADGE` colors — 1 definition only (claim of 2 was incorrect) ~~2~~ | 1 | 0 | — |
| Hardcoded color hex strings | 45 | 143 occurrences | CSS vars |
| Hardcoded role strings | 25 | **83** occurrences (not 72) | constants |
| `AdminAnalyticsData` uses `any` for both fields | 1 | — | type fix |
| `Section.section_type` typed as `unknown` (defined in 3 conflicting files) | 3 | — | type fix |
| `TICKET_STATUSES` missing 3 statuses | 1 | — | fix |
| `Ticket` type missing: `available_technicians`, `escalated_to`, `is_due_for_escalation`, `location_detail`, `organizational_path` | 1 | — | type fix |
| `constants/features.ts` referenced in CLAUDE.md but does not exist | 1 | — | create |
| `useTicketTable` wraps `useSharedData()` in `try/catch` — Rules of Hooks violation | 1 | — | fix |
| `useTicketAnalytics` creates `refetch` with `useMemo` instead of `useCallback` (bug) | 1 | — | fix |
| Logout redirects to `/auth`; 401 interceptor redirects to `/login` (path mismatch) | 2 | — | fix |
| Direct `apiClient` calls in `CampusesPage`, `DepartmentsPage`, `CataloguePage` (3 more beyond `UserDashboard`) | 3 | — | move to service |
| `as any` total: **22** (not 18) — 4 additional in `TechTickets.tsx` + `TechSectionTickets.tsx` | — | — | type fix |
| `console.log` total: **7 real** (not 4) — 4 in `api/config.ts`, 2 layout stubs, 1 `AuthPage.tsx` | — | — | delete |
| `SharedDataContext` fetches `page_size=1000` for sections (more aggressive than cited 500) | 1 | — | paginate |
| All hooks in `SharedDataContext` fire unconditionally — `user` role triggers 500-record fetches that are discarded | 1 | — | gate fetches |
| **Total** | **~130** | **~5,700 lines** | **~4,200** |

### Hardcoded values scan results (grep-based)

| Pattern | Occurrences | Files |
|---------|------------|-------|
| `#0078d4` (primary blue) | 79 | 35+ |
| `#106ebe` (blue hover) | 24 | 15+ |
| `#107c10` (success green) | 20 | 12+ |
| `#e5f2fc` / `#fcf0e5` (bg tints) | 20 | 12+ |
| Other hex colors | 20 | 10+ |
| Role strings (`'admin'`, `'hod'`, etc.) | 72 | 25 |
| Direct `apiClient.*` in components | 3 | 1 (`UserDashboard`) |
| `console.log` to remove | 4 | 4 |
| `as any` casts | 18 | 6 |
| `onSearchChange={() => {}}` dead stubs | 4 | 4 |
| Components with 10+ `useState` calls | 3 | `CataloguePage` (26), `DepartmentsPage` (16), `CampusesPage` (15) |

### Critical architectural finding

The original plan proposed **Zustand as the primary state manager**. Industry research (2025–2026 consensus, Zammad, case studies) points to a better split:

- **TanStack Query** — all server state (tickets, users, sections, analytics). Replaces every `useState/useEffect/refetch` hook. Its cache is a normalized entity store by query key.
- **Zustand** — UI-only client state only: `activeFilter`, `selectedTicketId`, `isDialogOpen`, `columnVisibility`. Never API data.
- **React Hook Form** — form state (unchanged; already correct).
- **Context API** — theme, locale only (unchanged).

---

## 2. Industry Benchmark

### ITIL / ITSM Alignment

Resolver's role hierarchy maps exactly to ITIL 4:

| ITIL Role | Resolver Role | Status |
|-----------|-------------|--------|
| End User | `user` | ✅ Correct |
| Service Desk Analyst | `technician` | ✅ Correct |
| Team Lead / Supervisor | `head_of_section` | ✅ Correct |
| Department Manager | `hod` | ✅ Correct |
| Service Delivery Manager | `manager` | ✅ Correct |
| Service Desk Manager | `admin` | ✅ Correct |

**Ticket status machine** maps cleanly to ITIL incident lifecycle. The `pending_approval` gate for `requires_approval` service items is a correct ITIL service request pattern.

### Gaps vs ITIL best practice

| Gap | ITIL Requirement | Fix |
|-----|-----------------|-----|
| Priority not mandatory at creation | ITIL: priority is required | `TicketCreationWizard` should prompt or default to `medium` |
| No SLA countdown in UI | ITIL: visible SLA status required | Phase 4 `SLAIndicator` (already spec'd in `CLAUDE.md`) |
| QuickFilterPills show no counts | Standard: "Open (12)" not "Open" | Add counts from analytics hook |
| No clickable stat cards | Standard: stat clicks filter the table | Wire `StatCard.onClick` to `table.setStatusFilter` |

### Open-source benchmark findings

- **Zammad** validates the `createTicketColumnVisibility({ role })` config-driven column approach. Their Vue 3 implementation does the same. Zammad also validates that sidebar navigation is config-driven per role — exactly what `UnifiedSidebar + SIDEBAR_CONFIG` proposes.
- **FreeScout** validates `DataTable` + right-panel detail modal — confirmed UX pattern.
- **osTicket** validates `head_of_section` seeing all section tickets while technicians see only assigned.

### Feature gaps vs. robust ITSM platforms

This table benchmarks Resolver against Zammad, Jira Service Management, and Freshservice — the three most commonly deployed mid-market ITSM platforms — to identify where the product is at parity, behind, or ahead.

| Feature | Resolver | Zammad | JSM | Freshservice | Priority |
|---------|----------|--------|-----|-------------|----------|
| Role-scoped dashboards (6 roles) | ✅ | ✅ | ✅ | ✅ | — |
| SLA countdown display | ❌ Phase 4 | ✅ | ✅ | ✅ | **P0** |
| Filter counts on pill buttons | ❌ | ✅ | ✅ | ✅ | **P1** |
| Clickable stat cards → filter table | ❌ | ✅ | ✅ | ✅ | **P1** |
| Real-time ticket updates (WebSocket/SSE) | ❌ | ✅ | ✅ | ✅ | P2 |
| Full-text search (server-side, all tickets) | ❌ client-side only | ✅ | ✅ | ✅ | **P1** |
| Saved/shareable filter views | ❌ | ✅ | ✅ | ✅ | P2 |
| Ticket attachments | ❌ Phase 5 | ✅ | ✅ | ✅ | P2 |
| Email-to-ticket intake | ❌ | ✅ | ✅ | ✅ | P3 |
| Audit log / change history on ticket | ❌ | ✅ | ✅ | ✅ | P2 |
| Bulk ticket operations (UI) | ❌ (backend exists) | ✅ | ✅ | ✅ | **P1** |
| Mobile-responsive UI | ⚠️ untested | ✅ | ✅ | ✅ | P2 |
| Service catalogue with approval workflow | ✅ | ⚠️ limited | ✅ | ✅ | — (ahead) |
| Multi-campus org hierarchy | ✅ | ❌ | ⚠️ | ⚠️ | — (ahead) |
| Priority mandatory at creation | ❌ | ✅ | ✅ | ✅ | **P1** |
| Dark mode | ✅ (next-themes) | ✅ | ❌ | ❌ | — (ahead) |

#### Specific UX patterns used by all mature service desks

**1. Server-side global search** — Zammad, JSM, and Freshservice all have a global search bar that queries all tickets across all time (not just the current page). Resolver's search box in `Header` is currently a no-op stub in 4 of 6 dashboards; where it works (`DataTable`), it only filters the in-memory current page via TanStack Table's `getFilteredRowModel`. This is a significant gap — users cannot find old tickets without scrolling through paginated results.

**Fix**: Wire `Header.onSearchChange` → `useTicketTable.setSearchQuery` → append `?search=...` to the API call. The backend already supports `?search=` on `/tickets/` via DRF's `SearchFilter`.

**2. Filter count badges** — Every service desk shows "Open **(12)**" not just "Open". Resolver's `QuickFilterPills` and the two custom `QuickFilterButtons` show no counts. The analytics data already comes back from the dashboard endpoint with status breakdowns — the counts are fetched but not displayed.

**Fix** (Phase D): Pass analytics status breakdown to the filter pills. Zero new API calls required.

**3. Bulk ticket operations** — Zammad's mass-update drawer and JSM's bulk transition are table-stakes for admin and HOD roles managing high-volume queues. The Resolver backend already has `POST /tickets/bulk-status-update/`. The frontend has no UI for it.

**Fix** (Phase B): Add row checkboxes to `DataTable` for admin/hod/manager roles; add a bulk action toolbar that calls `ticketsService.bulkStatusUpdate`.

**4. SLA visibility (ITIL-critical)** — ITIL 4 Practice Guide for Incident Management mandates visible SLA status on every ticket in the queue. The `SLAIndicator` component (Phase 4 spec in CLAUDE.md) should be elevated to **P0** given this requirement. Until then, technicians have no way to triage by urgency without opening each ticket.

**5. Priority at creation** — All ITIL-compliant platforms require priority at ticket creation (or auto-derive it from impact × urgency). Resolver's `TicketCreationWizard` has no priority step. Default priority is null, which makes SLA calculation impossible for the backend (`sla_hours` fallback applies but severity is undefined).

**Fix**: Add a priority selector (Low / Medium / High / Critical) to Step 4 (ticket details) of the wizard. Backend `Ticket.priority` field accepts these values.

#### Architecture decisions validated by industry benchmarks

| Decision | Resolver | Industry consensus | Status |
|---------|----------|-------------------|--------|
| BFF dashboard endpoint per role | ✅ | Zammad, JSM — confirmed pattern | ✅ Correct |
| Server-side filtering (every filter = API call) | ✅ | All major platforms | ✅ Correct |
| Centralized detail modal (not new page) | ✅ | FreeScout, Zammad | ✅ Correct |
| Config-driven column visibility per role | ✅ | Zammad Vue 3 | ✅ Correct |
| Token auth (no refresh) | ✅ | Acceptable for internal tooling | ✅ Correct |
| Client-side search (current page only) | ❌ | No major platform does this | ❌ Gap |
| Filters as ephemeral local state (not URL) | ❌ | All major platforms use URL params | ❌ Gap |
| No real-time updates | ❌ | All major platforms have WebSocket/SSE | ❌ Gap |

**The two highest-impact architectural gaps are:**

1. **Ephemeral filter state** — filters reset on page navigation and cannot be shared via URL. URL-based filter state (`?status=open&section=5`) is a zero-cost fix (use `react-router-dom`'s `useSearchParams` as the source of truth for filter state in `useTicketTable`) and eliminates the "lost my filter" support complaint common in internal tools.

2. **Client-side-only search** — not a refactor concern but a product gap that makes the system unusable at scale. Wire the existing `Header` search input to `?search=` at the API layer before the system grows beyond ~200 tickets per role.

---

## 3. Cross-Dashboard Component Analysis

### 3.1 Ticket Tables

#### Shared implementation

`/components/Common/DataTable/DataTable.tsx` — universal TanStack Table wrapper:
- Column visibility dropdown
- Server/client pagination modes
- Role-aware `FilterOption[]` filters
- `variant` prop: `"admin" | "user" | "tech"`

Supporting factory functions in `DataTable/`:
- `createTicketTableColumns({ role, ... })` — column definitions
- `createTicketTableFilters({ ... })` — filter config
- `createTicketColumnVisibility({ role })` — default column visibility

Core state hook: `hooks/tickets/useTicketTable.ts` (459 lines — monolith, see §5).

#### Per-dashboard usage

| Dashboard | File | Pattern | Identical to factory? | Key Difference |
|-----------|------|---------|----------------------|----------------|
| Admin All Tickets | `AdminDashboard/TicketsPage/TicketsTable.tsx` | `useTicketTable` + factory | 95% | Custom `overdue` filter |
| Admin Recent | `AdminDashboard/Dashboard/RecentTickets.tsx` | `useTicketTable` + factory | 95% | Hides `updated_at`, shows `created_at` |
| Technician Assigned | `TechnicianDashboard/TechTickets.tsx` | `useTicketTable` + factory | 95% | Derives counts client-side from context |
| Section Head | `SectionHeadDashboard/SectionHeadTickets.tsx` | `RoleTicketTablePage` wrapper | 100% | None |
| HOD | `HODDashboard/HODTickets.tsx` | `RoleTicketTablePage` wrapper | 100% | Different header text only |
| Manager | `ManagerDashboard/ManagerTickets.tsx` | `useTicketTable` direct | 95% | Caches in context |
| User | `UserDashboard/PostedTicketsTable.tsx` | `useTicketTable` + factory | 90% | Filters to `raised_by=currentUser` |

#### Duplication evidence

All dashboards generate columns with identical calls:

```tsx
// TicketsTable.tsx, RecentTickets.tsx, TechTickets.tsx — identical pattern
const columns = useMemo(() => createTicketTableColumns({
  role: 'admin', // role differs; everything else is identical
  technicians: table.technicians,
  allStatuses: table.allStatuses,
  setSelectedTicket: table.setSelectedTicket,
  setIsTicketDialogOpen: table.setIsTicketDialogOpen,
}), [table.technicians, table.allStatuses, table.setSelectedTicket, table.setIsTicketDialogOpen]);
```

Admin `TicketsTable` and `RecentTickets` differ only in `defaultPageSize` (20 vs 25) and one column visibility flag — they should be one component with a `variant` prop.

#### Extraction opportunity

```tsx
// Merge TicketsTable + RecentTickets into one component
interface AdminTicketTableProps {
  variant?: 'all' | 'recent';
}
const AdminTicketTable = ({ variant = 'all' }: AdminTicketTableProps) => {
  const table = useTicketTable({
    role: 'admin',
    defaultPageSize: variant === 'recent' ? 25 : 20,
  });
  // variant === 'recent' → hide QuickFilterButtons, adjust columnVisibility
};
```

**Savings: ~100 lines.**

---

### 3.2 Charts

#### Shared implementation

`/components/Common/ChartCard.tsx` — generic card wrapper:

```tsx
interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;    // for timeframe dropdowns
  children: ReactNode;
  contentClassName?: string;
}
```

There is **no shared Recharts component** — every dashboard writes its own `<BarChart>` and `<PieChart>` configuration from scratch.

#### Bar chart duplication evidence

Three dashboards have near-identical bar chart configuration:

```tsx
// Admin ChartsSection.tsx:120-162
<RechartsBarChart data={ticketsRaisedData}
  margin={{ top: 10, right: 10, left: 0, bottom: 20 }} barCategoryGap={50}>
  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#edebe9" />
  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={20} />
  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={30} />
  <RechartsTooltip content={...} />
  <Bar dataKey="tickets" fill="#0078d4" radius={[4, 4, 0, 0]} barSize={20} />
</RechartsBarChart>

// HODChartsSection.tsx:49-64 — IDENTICAL except:
// barCategoryGap={40}, vertical={false}, dataKey="Count"

// SectionHeadChartsSection.tsx:61-77 — IDENTICAL except:
// barCategoryGap={40}, vertical={false}, dual bars (Total + Open)
```

**What is 100% identical across all three**: margin values, `axisLine={false}`, `tickLine={false}`, `tick={{ fontSize }}`, `stroke="#edebe9"`, `radius={[4,4,0,0]}`, `fill="#0078d4"` color.

#### Pie chart duplication evidence

All three dashboards render near-identical pie charts with the same `COLORS` array and structure:

```tsx
// Admin, HOD, SectionHead — identical skeleton:
const COLORS = ['#0078d4', '#107c10', '#ffaa44', '#d13438', '#5c2d91'];
<Pie data={data} cx="50%" cy="50%"
  innerRadius={50}  // Admin: 75, HOD/SectionHead: 50
  outerRadius={80}  // Admin: 120, HOD/SectionHead: 80
  paddingAngle={5} dataKey="value"
  label={({ percent = 0 }) => `${((percent || 0) * 100).toFixed(0)}%`}
  labelLine={false}>
  {data.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
</Pie>
<Legend layout="vertical" verticalAlign="middle" align="right" />
<RechartsTooltip content={/* identical */} />
```

#### Extraction: `<AppBarChart>` and `<AppPieChart>` components

```tsx
// src/components/Common/Charts/AppBarChart.tsx
interface AppBarChartProps {
  data: Record<string, unknown>[];
  bars: { dataKey: string; color?: string }[];  // e.g. [{ dataKey: 'Count' }]
  margin?: Margin;
  barSize?: number;
  barCategoryGap?: number;
  showVerticalGrid?: boolean;
}

// src/components/Common/Charts/AppPieChart.tsx
interface AppPieChartProps {
  data: { name: string; value: number }[];
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
}
```

Usage replaces ~30 lines of Recharts boilerplate with ~5-line invocations.

**Savings: ~130 lines** across 5 chart components.

---

### 3.3 Stat Cards

#### Shared implementation

`/components/Common/StatCard.tsx` — single card:

```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBgColor?: string;
  badge?: { value: string; color: BadgeColor };
  description?: string;
  isLoading?: boolean;
}
```

`/components/Common/RoleStatsGrid.tsx` — maps `StatConfig[]` to responsive grid of `StatCard` components.

#### Per-dashboard implementations and duplication

| Dashboard | File | Pattern | Status |
|-----------|------|---------|--------|
| User | `UserDashboard/UserStatsCards.tsx` | Builds `StatConfig[]` → `RoleStatsGrid` | ✅ Correct |
| Section Head | `SectionHeadDashboard/SectionHeadStatsCards.tsx` | Builds `StatConfig[]` → `RoleStatsGrid` | ✅ Correct |
| HOD | `HODDashboard/HODStatsCards.tsx` | Builds `StatConfig[]` → `RoleStatsGrid` | ✅ Correct |
| Technician | `TechnicianDashboard/TechnicianStatsCards.tsx` | Hardcoded `StatCard` calls in loop | ⚠️ OK but could use `RoleStatsGrid` |
| Admin | `AdminDashboard/Dashboard/StatsCards.tsx` | Hardcoded `StatCard` calls (no loop) | 🔴 Should use `RoleStatsGrid` |
| Manager | `ManagerDashboard/ManagerStatsCards.tsx` | Hardcoded `StatCard` calls (no loop) | 🔴 Should use `RoleStatsGrid` |

#### Admin vs Manager duplication evidence

```tsx
// Admin StatsCards.tsx:64-80
<div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-2'>
  <StatCard
    title="Total Tickets"
    value={totalCount}
    description="All tickets in system"
    icon={<FileText className='h-6 w-6 text-[#0078d4]' />}
    iconBgColor="bg-[#e5f2fc]"
    badge={{ value: `${newThisMonth} this month`, color: "blue" }}
    isLoading={loading}
  />
  <StatCard title="Open Tickets" value={openCount} ... />
  // 3 more hardcoded cards

// Manager ManagerStatsCards.tsx:56-128 — IDENTICAL structure:
<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
  <StatCard
    title="Total Tickets"        // same
    value={totalCount}            // same
    description="All department tickets"  // ← only difference
    icon={<FileText className="h-6 w-6 text-[#0078d4]" />}  // same
    iconBgColor="bg-[#e5f2fc]"   // same
    badge={{ value: 'All', color: 'blue' }}  // ← slightly different
    isLoading={loading}
  />
  // 4 more hardcoded cards
```

The grid `className` is identical. Icon colors are identical. Badge logic is identical.

#### SectionHead vs HOD stat card duplication evidence

```tsx
// SectionHeadStatsCards.tsx — StatConfig entry
{ title: 'Total Tickets', value: totalCount, description: 'All section tickets',
  icon: <FileText className="h-6 w-6 text-[#0078d4]" />, iconBgColor: 'bg-[#e5f2fc]',
  badge: { value: 'Section', color: 'blue' } }

// HODStatsCards.tsx — 95% identical:
{ title: 'Total Tickets', value: totalCount, description: 'All campus tickets',  // ← only diff
  icon: <FileText className="h-6 w-6 text-[#0078d4]" />, iconBgColor: 'bg-[#e5f2fc]',
  badge: { value: 'Campus', color: 'blue' } }  // ← only diff
```

All 5 cards differ only in badge label ('Section' vs 'Campus') and description text.

#### TechReport hardcoded stat cards

`TechnicianDashboard/TechReport.tsx` (444 lines) builds inline `<Card>` markup instead of using `StatCard`:

```tsx
// TechReport.tsx:100-157 — hardcoded card structure (should use RoleStatsGrid)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>
    <CardContent className="px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Tickets</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>
  // 3 more identical-pattern cards
```

**Fix**: Replace with `<RoleStatsGrid stats={stats} loading={loading} />`.

#### Extraction: standardize Admin + Manager on `RoleStatsGrid`

```tsx
// AdminStatsCards.tsx (refactored — replaces 55 lines of JSX)
const stats: StatConfig[] = [
  { title: 'Total Tickets', value: systemOverview?.total ?? 0,
    icon: <FileText className="h-6 w-6 text-[#0078d4]" />, iconBgColor: 'bg-[#e5f2fc]',
    badge: { value: `${systemOverview?.new_30d ?? 0} this month`, color: 'blue' },
    description: 'All tickets in system' },
  // ... 4 more
];
return <RoleStatsGrid stats={stats} loading={loading} />;
```

**Savings: ~200 lines** (Admin + Manager + TechReport).

---

### 3.4 Quick Filters

#### Shared implementation

`/components/Common/QuickFilterPills.tsx` — generic pill buttons (no counts):

```tsx
interface QuickFilterPillsProps {
  filters: readonly FilterPill[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
}
```

Used by: `UserTickets`, `RoleTicketTablePage` (SectionHead + HOD). No count badges.

#### Custom implementations with counts

Two dashboards implement their own button-style filter component with count badges:

| File | Role | Filter Options | Has Counts |
|------|------|---------------|-----------|
| `AdminDashboard/TicketsPage/QuickFilterButtons.tsx` | admin | all/open/unassigned/overdue/in_progress/resolved | ✅ Yes |
| `TechnicianDashboard/QuickFilterButtons.tsx` | technician | all/assigned/in_progress/pending/resolved | ✅ Yes |

#### Duplication evidence

```tsx
// Admin QuickFilterButtons.tsx render loop (lines 56-83)
{filters.map((filter) => {
  const isActive = activeFilter === filter.id;
  return (
    <Button key={filter.id}
      variant={isActive ? "default" : "outline"}
      onClick={() => onFilterChange(filter.id)}
      className={`flex items-center gap-2 py-3 transition-all ${
        isActive ? 'ring-2 ring-offset-1 ring-blue-500' : filter.colorClass
      }`}>
      <Icon className="h-4 w-4" />
      <span>{filter.label}</span>
      {filter.count !== undefined && (
        <Badge variant={isActive ? "secondary" : "outline"}
          className="ml-1 px-1.5 py-0 h-5 text-xs">
          {filter.count}
        </Badge>
      )}
    </Button>
  );
})}

// TechQuickFilterButtons.tsx — IDENTICAL render loop, only header icon differs
// Admin header icon: <Clock />   Tech header icon: <Wrench />
```

The entire render logic is identical. Only the filter array content and header icon differ.

#### Extraction: unified `<QuickFilterButtons>` with count support

```tsx
// src/components/Common/QuickFilterButtons.tsx (new — replaces both custom implementations)
interface QuickFilterConfig {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
  count?: number;
}

interface QuickFilterButtonsProps {
  filters: QuickFilterConfig[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
  headerIcon?: ComponentType<{ className?: string }>;
  headerLabel?: string;
}
```

The two existing custom implementations become data-only config arrays passed into this one component.

**Savings: ~80 lines.**

---

### 3.5 Reports & Analytics

#### Report component inventory

| Component | File | Lines | Data Source | Charts | Download |
|-----------|------|-------|-------------|--------|----------|
| Technician Report | `TechnicianDashboard/TechReport.tsx` | 444 | `useTechDashboard()` | None (stat cards only) | ✅ Excel |
| Admin Ticket Metrics | `AdminDashboard/Reports/TicketMetricsReport.tsx` | ~250 | `useTicketAnalytics()` | Bar + Line + Pie | ❌ |
| Admin Technician Perf | `AdminDashboard/Reports/TechnicianPerformanceReport.tsx` | ~200 | `useTechnicianAnalytics()` | Bar + Table | ❌ |
| Admin Section Perf | `AdminDashboard/Reports/SectionPerformanceReport.tsx` | ~180 | analytics hook | Bar + Table | ❌ |
| Manager Analytics | `ManagerDashboard/ManagerAnalytics.tsx` | ~280 | `useManagerDashboard()` | Bar + Table + List | ❌ |
| Generate Reports | `AdminDashboard/Reports/GenerateReports.tsx` | ~120 | none (form only) | None | ✅ Excel |

#### Key duplication

`TechReport.tsx` is the primary offender — 444 lines, of which ~80 lines are hardcoded `<Card>` markup that duplicates the `StatCard`/`RoleStatsGrid` pattern. The remaining ~200 lines of report section cards duplicate the same `<Card><CardHeader>...<CardContent>...` pattern 6 times for different metrics.

`TechnicianPerformanceReport` correctly uses `StatCard`. `TechReport` does not.

#### Improvement

1. Refactor `TechReport.tsx` stat section to use `RoleStatsGrid` (saves ~80 lines)
2. Extract repeated metric `<Card>` sections in `TechReport` into a shared `<MetricCard title description value />` primitive
3. No further report consolidation needed — each report has legitimately different data and presentation

---

### 3.6 Sidebar Navigation

#### All 6 sidebars follow identical JSX structure

```tsx
// UserSideBar.tsx:32-62 (representative — all others are line-for-line copies)
return (
  <>
    {isLoading && <FullScreenLoading message="Logging out..." />}
    <div className='w-64 bg-white border-r border-gray-200 flex flex-col'>
      <div className='p-6 border-b border-gray-200'>
        <h1 className='text-2xl font-semibold text-[#0078d4]'>Resolver 🚀</h1>
        {/* SectionHead/HOD/Manager optionally render a subtitle here */}
      </div>
      <div className='flex-1 py-4 overflow-y-auto'>
        <nav className='space-y-1 px-2'>
          {sections.map(({ id, label, icon }) => (
            <NavButton key={id} icon={icon} label={label}
              isActive={activeSection === id}
              onClick={() => onSectionChange(id)} />
          ))}
        </nav>
      </div>
      <div className='p-4 border-t border-gray-200'>
        <button onClick={handleLogout}
          className='flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900'>
          <LogOut className='mr-3 h-5 w-5' />
          Logout
        </button>
      </div>
    </div>
  </>
);
```

**Files with 100% identical structure**: `UserSideBar`, `TechSideBar`, `SectionHeadSideBar`, `HODSideBar`, `ManagerSideBar`.  
`Common/Sidebar.tsx` (Admin) differs in JSX wrapper style but shares the same nav loop and logout button.

#### What legitimately differs

Only the `sections` array (nav items) and an optional subtitle string. Everything else is identical.

| Sidebar | Items | Subtitle |
|---------|-------|---------|
| User | dashboard, userTickets, submitTicket, settings | None |
| Technician | dashboard, assignedTickets, report, settings | None |
| Section Head | dashboard, tickets, technicians, reports, settings | "Section Head Portal" |
| HOD | dashboard, tickets, technicians, sections, reports, settings | "Head of Department Portal" |
| Manager | dashboard, tickets, reports, settings | "Manager Portal" |
| Admin | 12 items | None |

#### Unified `UnifiedSidebar` + config

```tsx
// src/components/Common/UnifiedSidebar.tsx
export function UnifiedSidebar<T extends string>({
  activeSection, onSectionChange, role,
}: { activeSection: T; onSectionChange: (id: T) => void; role: UserRole }) {
  const { handleLogout, isLoading } = useLogout();
  const config = SIDEBAR_CONFIG[role];
  return (
    <>
      {isLoading && <FullScreenLoading message="Logging out..." />}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-[#0078d4]">Resolver 🚀</h1>
          {config.subtitle && <p className="text-xs text-gray-500 mt-1">{config.subtitle}</p>}
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            {config.items.map(({ id, label, icon }) => (
              <NavButton key={id} icon={icon} label={label}
                isActive={activeSection === id}
                onClick={() => onSectionChange(id as T)} />
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
```

**Savings: ~120 lines (6 sidebar files → 1 component + 1 config file).**

---

### 3.7 Layout Wrappers

#### All 6 layouts share the same shell

```tsx
// Representative (SectionHeadLayout, HODLayout, ManagerLayout are near-identical)
<div className="flex h-screen bg-gray-100">
  {isLoading && <FullScreenLoading message="Loading your dashboard..." />}
  <SidebarComponent activeSection={activeSection} onSectionChange={setActiveSection} />
  <div className="flex-1 flex flex-col overflow-hidden">
    <Header title={headerTitle[activeSection]} searchPlaceholder="Search..."
      currentUser={userData} onSearchChange={() => {}} />
    <main className="flex-1 overflow-y-auto">
      {/* conditional section renders */}
    </main>
  </div>
</div>
```

**Files with 100% identical outer shell**: all 6 layout files.

#### `ComingSoon` component — verbatim copy in 6 files

```tsx
// Defined locally (copy-paste) in:
// UserLayout.tsx:14-34, TechnicianLayout.tsx:14-34,
// SectionHeadLayout.tsx:14-29, HODLayout.tsx:12-27,
// ManagerLayout.tsx:11-26, AdminLayout.tsx:26-41
function ComingSoonSection({ section }: { section: string }) {
  return (
    <div className='flex items-center justify-center h-full p-6'>
      <div className='text-center max-w-md p-8 bg-white rounded-lg shadow-sm'>
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>{section} Coming Soon</h2>
        <p className='text-gray-600 mb-6'>
          We're currently working on this feature. It will be available in a future update.
        </p>
        <div className='w-full bg-gray-200 h-2 rounded-full mb-4'>
          <div className='bg-[#0078d4] h-2 rounded-full w-3/4'></div>
        </div>
        <p className='text-sm text-gray-500'>Development in progress: 75% complete</p>
      </div>
    </div>
  );
}
```

**Six identical copies. Immediate extract to `src/components/Common/ComingSoonSection.tsx`.**

#### Dead code: `onSearchChange` stub

All 6 layouts pass either `() => {}` or `(v) => console.log('Search:', v)` to `Header.onSearchChange`. The search input renders but does nothing in production. **Either implement it or remove the prop.**

#### `RoleLayout` unified wrapper

```tsx
// src/components/Common/RoleLayout.tsx
interface RoleLayoutProps {
  sidebar: ReactNode;
  title: string;
  currentUser?: User | null;
  loading?: boolean;
  children: ReactNode;
}
export function RoleLayout({ sidebar, title, currentUser, loading, children }: RoleLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {loading && <FullScreenLoading message="Loading your dashboard..." />}
      {sidebar}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} searchPlaceholder="Search..."
          currentUser={currentUser} onSearchChange={() => {}} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

**Savings: ~205 lines (layout shell + ComingSoon × 6).**

---

### 3.8 Modals & Detail Sheets

#### Shared modals (already unified — no action needed)

| Component | Used By | Status |
|-----------|---------|--------|
| `TicketDetailModal.tsx` | All 6 dashboards | ✅ Unified |
| `TicketCreationWizard.tsx` | User + Admin | ✅ Unified |
| `ApproveRejectActions.tsx` | Ticket detail modal | ✅ Unified |

#### Admin detail sheets — 78% duplication

`TechnicianDetails.tsx` (295), `SectionDetails.tsx` (230), `FacilityDetails.tsx` (268) — **793 total lines, 620 lines duplicated**.

All three share:
- Identical `<Sheet>` skeleton with `<SheetHeader>`, `<ScrollArea>`, `<SheetContent>`
- Identical `mode: 'view' | 'edit'` toggle pattern
- Identical save handler with identical error handling:

```tsx
// 100% identical across all three (TechnicianDetails:108-120, SectionDetails:67-79, FacilityDetails:78-90)
if (err?.response?.data) {
  const data = err.response.data;
  Object.keys(data).forEach((key) => {
    const val = data[key];
    const message = Array.isArray(val) ? val.join(' ') : String(val);
    toast.error(`${key}: ${message}`);
  });
} else {
  toast.error('Failed to update entity');
}
```

- Identical "Profile Info" table rows structure:

```tsx
// 100% identical markup, only label + value differ
<div className='bg-white border rounded-lg divide-y'>
  <div className='px-6 py-4 flex items-center justify-between'>
    <span className='text-sm font-medium text-gray-600'>Label</span>
    <span className='text-sm text-gray-900'>{entity.field}</span>
  </div>
</div>
```

#### `UnifiedDetailsSheet` component

```tsx
// src/components/Common/UnifiedDetailsSheet.tsx
interface DetailRow { label: string; value: ReactNode; }
interface DetailSection { title: string; rows: DetailRow[]; }
interface EditField {
  name: string; label: string;
  type: 'text' | 'textarea' | 'select' | 'multi-select';
  value: string | number | string[];
  placeholder?: string;
  options?: { label: string; value: string | number }[];
}

interface UnifiedDetailsSheetProps<T> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entity: T | null;
  title: string;
  description: string;
  profileSections: DetailSection[];
  editFields: EditField[];
  onSave: (entity: T, values: Record<string, unknown>) => Promise<void>;
  onUpdated?: () => void;
}
```

After refactoring, `TechnicianDetails`, `SectionDetails`, `FacilityDetails` become ~40-line config+render wrappers instead of ~260-line duplicated sheets.

**Savings: ~483 lines (61% reduction across 3 files).**

---

## 4. Cross-Role Purpose Duplication

This section covers a separate class of duplication from §3: cases where the **same logical feature or page** has been implemented from scratch per dashboard, rather than sharing one parameterized component. The defining characteristic is that different dashboard authors solved the same problem independently.

### 4.1 Technicians List View

The most severe instance. Three dashboards independently implement a "show technicians in my scope" feature.

| Dashboard | File | Lines | UI Style | Scope Filter |
|-----------|------|-------|----------|-------------|
| HOD | `HODDashboard/HODTechnicians.tsx` | 54 | Simple divider list | `campus_department_id` |
| Section Head | `SectionHeadDashboard/SectionHeadTechnicians.tsx` | 58 | Simple divider list | `section_ids` (comma-joined) |
| Admin | `AdminDashboard/Technicians/TechniciansTable.tsx` | 494 | Full React-table | All technicians |

#### HOD vs SectionHead duplication evidence

Both HOD (lines 32–42) and SectionHead (lines 36–46) render the same card layout — blue initial-circle avatar, name, username — with identical markup:

```tsx
// HODTechnicians.tsx:36-50
{technicians.map(tech => (
  <div key={tech.id} className="flex items-center gap-4 p-4 border-b last:border-0">
    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
      {tech.first_name?.[0]?.toUpperCase() ?? tech.username[0].toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {tech.first_name} {tech.last_name}
      </p>
      <p className="text-xs text-gray-500 truncate">{tech.username}</p>
    </div>
    <Badge variant="outline" className="text-xs">{tech.role}</Badge>
  </div>
))}

// SectionHeadTechnicians.tsx:40-54 — character-for-character identical
```

The only difference is the `useTechnicians()` call parameter — `campus_department_id` vs `section_ids`.

#### Proposed unified component

```tsx
// src/components/Common/TechnicianListView.tsx
type TechScope =
  | { type: 'campus_department'; campusDepartmentId: number }
  | { type: 'sections'; sectionIds: string }
  | { type: 'global' };

interface TechnicianListViewProps {
  scope: TechScope;
  variant?: 'simple' | 'table';  // simple = HOD/SectionHead; table = Admin
  canCreate?: boolean;            // Admin only
  canEdit?: boolean;              // Admin only
}

export function TechnicianListView({ scope, variant = 'simple', canCreate, canEdit }: TechnicianListViewProps) {
  const filters =
    scope.type === 'campus_department' ? { campus_department_id: scope.campusDepartmentId } :
    scope.type === 'sections' ? { section_ids: scope.sectionIds } :
    undefined;

  const { technicians, loading } = useTechnicians(filters);

  if (variant === 'table') {
    return <TechniciansTable technicians={technicians} loading={loading}
                             canCreate={canCreate} canEdit={canEdit} />;
  }
  return <TechniciansSimpleList technicians={technicians} loading={loading} />;
}
```

**Calling sites after refactor:**
```tsx
// HODTechnicians.tsx (collapses to ~10 lines)
const { data } = useHODDashboard();
return <TechnicianListView scope={{ type: 'campus_department', campusDepartmentId: data?.campus_department?.id }} />;

// SectionHeadTechnicians.tsx (collapses to ~10 lines)
const { data } = useSectionHeadDashboard();
const sectionIds = data?.sections.map(s => s.id).join(',') ?? '';
return <TechnicianListView scope={{ type: 'sections', sectionIds }} />;

// Admin TechniciansPage.tsx
return <TechnicianListView scope={{ type: 'global' }} variant="table" canCreate canEdit />;
```

**Savings: ~250 lines** (HOD: 40, SectionHead: 44, Admin table wrapper: 166 simplified).

---

### 4.2 Sections Overview

Three dashboards independently implement a "show sections in my scope" view.

| Dashboard | File | Lines | UI Style | Scope |
|-----------|------|-------|----------|-------|
| HOD | `HODDashboard/HODSections.tsx` | 95 | shadcn Table | Campus department |
| Section Head | `SectionHeadDashboard.tsx` lines 26–50 | ~25 (inline) | ChartCard divider list | Assigned sections |
| Admin | `AdminDashboard/Sections/SectionsTable.tsx` | ~400 | React-table, full CRUD | Global |

#### HOD vs SectionHead evidence

Both show section name, technician count, open/total ticket counts. The data keys are the same (`s.section.name`, `s.technician_count`, `s.open`, `s.total`). HOD uses a shadcn `<Table>`; SectionHead uses an inline divider list inside a `<ChartCard>` — different presentation, identical data and purpose.

```tsx
// HODSections.tsx:50-75 — Table row
<TableRow key={s.section.id}>
  <TableCell className="font-medium">{s.section.name}</TableCell>
  <TableCell><Badge variant="outline">{s.section.section_type ?? '—'}</Badge></TableCell>
  <TableCell className="text-right">{s.technician_count}</TableCell>
  <TableCell className="text-right text-orange-600 font-medium">{s.open}</TableCell>
  <TableCell className="text-right">{s.total}</TableCell>
</TableRow>

// SectionHeadDashboard.tsx:33-44 — Divider list showing same metrics
<div key={s.section.id} className="py-3 flex items-center justify-between">
  <div>
    <p className="text-sm font-medium">{s.section.name}</p>
    <p className="text-xs text-gray-500">{s.technician_count} technician(s)</p>
  </div>
  <div className="flex gap-3 text-sm">
    <span className="text-orange-600 font-medium">{s.open} open</span>
    <span className="text-gray-600">{s.total} total</span>
  </div>
</div>
```

#### Proposed unified component

```tsx
// src/components/Common/SectionsView.tsx
interface SectionsViewProps {
  sections: SectionStat[];       // { section: {id, name, section_type}, technician_count, open, total }
  loading: boolean;
  variant?: 'list' | 'table' | 'advanced';
  canEdit?: boolean;             // Admin only — shows edit/create buttons
}
```

**Savings: ~120 lines** (HOD + SectionHead inline section collapsed; Admin table simplified).

---

### 4.3 Technician Performance List

HOD and SectionHead both embed an identical "technician workload" list inside a `<ChartCard>` on their main dashboard page.

| Dashboard | Location | Lines |
|-----------|----------|-------|
| HOD | `HODDashboard.tsx` lines 73–96 | ~24 |
| Section Head | `SectionHeadDashboard.tsx` lines 52–75 | ~24 |

Both iterate `data.technician_workload` and render name, username, `total_assigned`, `resolved` counts in an identical layout:

```tsx
// HODDashboard.tsx:82-92
{data.technician_workload.map(tw => (
  <div key={tw.technician.id} className="py-3 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-800">{tw.technician.name}</p>
      <p className="text-xs text-gray-500">{tw.technician.username}</p>
    </div>
    <div className="flex items-center gap-4 text-sm">
      <span className="text-[#0078d4] font-medium">{tw.total_assigned} assigned</span>
      <span className="text-[#107c10] font-medium">{tw.resolved} resolved</span>
    </div>
  </div>
))}

// SectionHeadDashboard.tsx:59-69 — identical (color values, layout, data keys)
```

#### Proposed unified component

```tsx
// src/components/Common/TechnicianWorkloadList.tsx
interface TechnicianWorkloadListProps {
  workload: { technician: { id: number; name: string; username: string }; total_assigned: number; resolved: number }[];
  loading?: boolean;
  title?: string;
  description?: string;
}
```

**Savings: ~40 lines.**

---

### 4.4 Campus / Section Breakdown Table

`ManagerAnalytics.tsx` and `OrganisationAnalytics.tsx` both implement a campus performance table with near-identical markup and identical SLA color logic.

| File | Lines (table section) | Columns |
|------|----------------------|---------|
| `ManagerAnalytics.tsx` lines 137–167 | ~30 | Campus, Total, Open, SLA%, Avg Hours |
| `OrganisationAnalytics.tsx` lines 93–126 | ~34 | Campus, Total, Open, SLA%, Avg Hours |

**Identical logic:**
```tsx
// Both files apply this identical SLA coloring:
const slaColor = sla >= 80 ? 'text-green-600' : sla >= 60 ? 'text-yellow-600' : 'text-red-600';
// ManagerAnalytics.tsx:153 vs OrganisationAnalytics.tsx:109 — character-for-character
```

Both render the same `<Badge>` for campus code, same `<TableCell>` layout, same hover states.

#### Proposed unified component

```tsx
// src/components/Common/CampusBreakdownTable.tsx
interface CampusMetric {
  campus: { id: number; name: string; code: string };
  total: number; open: number;
  sla_compliance?: number;
  avg_resolution_hours?: number;
}

interface CampusBreakdownTableProps {
  campuses: CampusMetric[];
  loading?: boolean;
  showAvgHours?: boolean;   // Manager: yes; Admin org view: yes
}
```

**Savings: ~50 lines.**

---

### 4.5 Analytics & Reports Pages

Four dashboards have an "analytics / reports" section, each implemented from scratch:

| Dashboard | File | Scope | Charts | Download |
|-----------|------|-------|--------|---------|
| Technician | `TechReport.tsx` (444 lines) | Personal stats | None (stat cards only) | ✅ Excel |
| Manager | `ManagerAnalytics.tsx` (~280 lines) | Department | Bar + tables | ❌ |
| Admin | `OrganisationAnalytics.tsx` (~250 lines) | Organisation | Bar + tables | ❌ |
| Admin | `ReportsPageEnhanced.tsx` (~400 lines) | Multi-type reports | Bar + Line + Pie | ✅ Excel |

**Shared patterns within this group:**

1. **Date range selector** — `ManagerAnalytics` uses a plain `<select>` for days (7/30/90); `ChartsSection` uses shadcn `<DropdownMenu>` for week/month. Same purpose, two implementations.

2. **Stat cards at top of analytics page** — All four render 3–5 stat cards. `TechReport` uses inline `<Card>` (wrong), the others use `StatCard` (correct).

3. **Campus breakdown table** — both Manager and Admin Organisation views (§4.4 above).

4. **"Top technicians" list** — `TechnicianPerformanceReport.tsx` (Admin) and `ManagerAnalytics.tsx` both show a ranked technician table with assigned/resolved/avg-hours columns. These are 80% identical.

#### Proposed unification

A shared `<TimeframeSelector>` component to standardise the days/week/month picker:

```tsx
// src/components/Common/TimeframeSelector.tsx
interface TimeframeSelectorProps {
  value: number | string;
  options: { label: string; value: number | string }[];
  onChange: (value: number | string) => void;
  variant?: 'select' | 'dropdown';  // select for simple; dropdown for shadcn
}
```

The `TechnicianPerformanceTable` pattern from `TechnicianPerformanceReport` and `ManagerAnalytics` should become one shared component:

```tsx
// src/components/Common/TechnicianPerformanceTable.tsx
interface TechnicianPerformanceTableProps {
  technicians: TechnicianPerformanceStat[];
  loading?: boolean;
  showAvgResolution?: boolean;
}
```

**Savings: ~150 lines** across the analytics group.

---

### 4.6 Ticket Table Pages

`RoleTicketTablePage` already unifies HOD and SectionHead ticket views. But Manager and Technician still re-implement the same setup inline instead of using the wrapper.

| Dashboard | File | Uses `RoleTicketTablePage`? |
|-----------|------|---------------------------|
| HOD | `HODTickets.tsx` | ✅ Yes |
| Section Head | `SectionHeadTickets.tsx` | ✅ Yes |
| Manager | `ManagerTickets.tsx` | ❌ No — duplicates setup |
| Technician | `TechTickets.tsx` | ❌ No — duplicates setup |

`ManagerTickets.tsx` (lines 13–18) manually sets up `useTicketTable`, creates columns, renders `DataTable` — the exact same pattern `RoleTicketTablePage` already encapsulates. It should be a 5-line wrapper.

#### Fix

Extend `RoleTicketTablePage` to accept all roles:

```tsx
// RoleTicketTablePage.tsx — add 'manager' | 'technician' | 'admin' to accepted roles
type SupportedRole = 'hod' | 'head_of_section' | 'manager' | 'technician' | 'admin';
```

Then `ManagerTickets.tsx` becomes:
```tsx
export default function ManagerTickets() {
  const { userData } = useCurrentUser();
  return <RoleTicketTablePage role="manager" userId={userData?.id} />;
}
```

**Savings: ~60 lines** (Manager + Technician simplified wrapper setup).

---

### 4.7 What Is Correctly Unified

These features were done right — no action needed:

| Feature | Shared Component | Used By |
|---------|-----------------|---------|
| Ticket detail view | `TicketDetailModal` | All 6 dashboards |
| Ticket creation | `TicketCreationWizard` | User + Admin |
| Approve/reject actions | `ApproveRejectActions` | Inside `TicketDetailModal` |
| Data table shell | `DataTable` | All 6 dashboards |
| Column/filter/visibility factories | `createTicketTable*` | All 6 dashboards |
| Stat card primitive | `StatCard` + `RoleStatsGrid` | 4 of 6 dashboards (Admin/Manager bypass — fix needed) |
| Chart card wrapper | `ChartCard` | HOD, SectionHead, Manager, Admin |
| NavButton | `NavButton` | All 6 sidebars |

---

### Cross-Role Purpose Duplication Summary

| # | Feature | Affected Dashboards | Severity | Est. Savings |
|---|---------|--------------------|---------:|-------------:|
| 1 | Technicians list view | HOD, SectionHead, Admin | **Critical** | ~250 lines |
| 2 | Sections overview | HOD, SectionHead, Admin | **High** | ~120 lines |
| 3 | Technician workload list | HOD, SectionHead | **Medium** | ~40 lines |
| 4 | Campus breakdown table | Manager, Admin | **Medium** | ~50 lines |
| 5 | Analytics/reports pages | Tech, Manager, Admin | **High** | ~150 lines |
| 6 | Ticket table page setup | Manager, Technician | **Medium** | ~60 lines |
| **Total** | | | | **~670 lines** |

---

## 5. Component Reusability Matrix

| Component | User | Tech | HOS | HOD | Mgr | Admin | Status | Priority |
|-----------|:----:|:----:|:---:|:---:|:---:|:-----:|--------|----------|
| `DataTable` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✅ Unified | — |
| `TicketDetailModal` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✅ Unified | — |
| `TicketCreationWizard` | ✓ | — | — | — | — | ✓ | ✅ Unified | — |
| `Header` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✅ Unified | — |
| `ChartCard` wrapper | — | — | ✓ | ✓ | ✓ | ✓ | ✅ Unified | — |
| `RoleTicketTablePage` | — | — | ✓ | ✓ | — | — | ✅ Unified | — |
| `NavButton` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✅ Unified | — |
| `StatCard` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠️ Not used by Admin/Mgr directly | HIGH |
| `RoleStatsGrid` | ✓ | — | ✓ | ✓ | — | — | ⚠️ Admin/Mgr/TechReport bypass it | HIGH |
| Bar chart | — | — | ✓ | ✓ | ✓ | ✓ | 🔴 4× copy-paste | HIGH |
| Pie chart | — | — | ✓ | ✓ | — | ✓ | 🔴 3× copy-paste | HIGH |
| Dashboard context providers | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 🔴 6× identical boilerplate | CRITICAL |
| Analytics hooks | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 🔴 5× identical structure | HIGH |
| Quick filter (with counts) | — | ✓ | — | — | — | ✓ | 🔴 2× near-duplicate | MEDIUM |
| Sidebar JSX | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 🔴 6× identical shell | HIGH |
| Layout shell | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 🔴 6× identical shell | HIGH |
| `ComingSoon` component | ✓ | ✓ | ✓ | ✓ | — | ✓ | 🔴 6× verbatim copy | CRITICAL |
| Admin detail sheets | — | — | — | — | — | ✓ | 🔴 3× 78% identical | HIGH |
| `useTicketTable` hook | all | all | all | all | all | all | 🔴 459-line monolith | CRITICAL |
| **Cross-role purpose duplicates** | | | | | | | | |
| Technician list view | — | — | ✓ | ✓ | — | ✓ | 🔴 3 separate implementations | CRITICAL |
| Sections overview | — | — | ✓ | ✓ | — | ✓ | 🔴 3 separate implementations | HIGH |
| Tech workload list | — | — | ✓ | ✓ | — | — | 🔴 2× copy-paste | MEDIUM |
| Campus breakdown table | — | — | — | — | ✓ | ✓ | 🔴 2× 90% identical | MEDIUM |
| Ticket table page | — | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠️ Manager/Tech bypass wrapper | MEDIUM |
| `RoleTicketTablePage` (ticket wrapper) | — | — | ✓ | ✓ | — | — | ⚠️ Extend to Manager + Tech | MEDIUM |

---

## 6. State Management Architecture

### Current problems in `useTicketTable.ts` (459 lines)

Single hook mixes 6 separate concerns, consumed by 8 components. Any change risks all 8:

```
Concern 1: Data fetching (useTickets, pagination params)
Concern 2: Filter state (statusFilter, sectionFilter, etc.)
Concern 3: Sorting
Concern 4: Row selection
Concern 5: Dialog open/selectedTicket state
Concern 6: Mutation handlers (updateTicket, refetch)
```

### Current problems in context providers

Six providers (AdminDashboard, ManagerDashboard, HODDashboard, SectionHeadDashboard, TechnicianDashboard, UserDashboard) are ~87% identical — same `useState`, `useCallback`, `useEffect`, `useMemo` pattern, only the service function and `days` param differ.

### Proposed architecture

```
┌── Server State (TanStack Query) ────────────────────────────────┐
│  Replaces all useState/useEffect/refetch data-fetching hooks    │
│                                                                  │
│  useQuery(['tickets', params])           → ticket lists          │
│  useQuery(['ticket', id])                → ticket detail         │
│  useQuery(['analytics', role, days])     → dashboard stats       │
│  useQuery(['sections'])                  → reference data        │
│  useQuery(['dashboard', role, days])     → BFF dashboard data    │
│                                                                  │
│  useMutation → updateTicket (optimistic update)                  │
│  useMutation → escalateTicket                                    │
│  useMutation → createTicket                                      │
└──────────────────────────────────────────────────────────────────┘

┌── Client State (Zustand) ───────────────────────────────────────┐
│  UI-only state — never API data                                  │
│                                                                  │
│  ticketUIStore:                                                  │
│    activeFilter: string                                          │
│    selectedTicketId: number | null                               │
│    isDialogOpen: boolean                                         │
│    columnVisibility: Record<string, boolean>  (persisted)        │
└──────────────────────────────────────────────────────────────────┘

┌── Form State (React Hook Form) ─────────────────────────────────┐
│  Unchanged — already correct                                     │
└──────────────────────────────────────────────────────────────────┘
```

### `createDashboardContext` factory (replacing 6 × ~115 line providers)

```tsx
// src/contexts/createDashboardContext.ts
export function createDashboardContext<T>(
  displayName: string,
  fetchFn: (days: number) => Promise<T>,
) {
  const Context = createContext<DashboardContextValue<T> | null>(null);

  function Provider({ children, initialDays = 30 }: PropsWithChildren<{ initialDays?: number }>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(initialDays);

    const fetchDashboard = useCallback(async () => {
      try {
        setLoading(true);
        setData(await fetchFn(days));
        setError(null);
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }, [days]);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    const value = useMemo(
      () => ({ data, loading, error, days, setDays, refetch: fetchDashboard }),
      [data, loading, error, days, fetchDashboard],
    );
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext() {
    const ctx = React.useContext(Context);
    if (!ctx) throw new Error(`use${displayName}Dashboard must be inside provider`);
    return ctx;
  }
  return { Provider, useContext };
}

// All 6 providers become one-liners:
export const { Provider: AdminDashboardProvider, useContext: useAdminDashboard } =
  createDashboardContext('Admin', getAdminDashboard);
export const { Provider: ManagerDashboardProvider, useContext: useManagerDashboard } =
  createDashboardContext('Manager', getManagerDashboard);
// ... HOD, SectionHead, Technician, User
```

**Savings: ~500 lines.**

### TanStack Query optimistic update for ticket mutations

```tsx
const updateTicketMutation = useMutation({
  mutationFn: ({ id, data }: { id: number; data: Partial<UpdateTicketPayload> }) =>
    ticketsService.updateTicket(id, data),
  onMutate: async ({ id, data }) => {
    await queryClient.cancelQueries({ queryKey: ['ticket', id] });
    const previous = queryClient.getQueryData(['ticket', id]);
    queryClient.setQueryData(['ticket', id], (old: Ticket) => ({ ...old, ...data }));
    return { previous };
  },
  onError: (_, { id }, ctx) => {
    queryClient.setQueryData(['ticket', id], ctx?.previous);
    toast.error('Update failed');
  },
  onSettled: (_, __, { id }) => {
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
  },
});
```

### `useTicketTable` decomposition

```
hooks/tickets/
  useTicketData.ts      ← TanStack Query fetch + pagination
  useTicketFilters.ts   ← filter state → Zustand ticketUIStore
  useTicketColumns.ts   ← column definitions + visibility (role-aware)
  useTicketActions.ts   ← mutations: update, escalate, close, assign
  index.ts              ← re-exports (backwards-compatible if needed)
```

---

## 7. Backend API Constraints

Critical constraints from the Django backend that affect frontend architecture decisions.

> **Backend location**: `/django_resolver/` — a separate repository from the frontend (`/Resolver/client/`). The backend is a Django REST Framework app with a single app called `tickets`.

### Verified API Endpoint List

The full backend URL surface (from `tickets/api/urls.py`):

```
# Auth
POST   /api/auth/login/
POST   /api/auth/logout/
GET    /api/auth/profile/          ← used by UserDataContext
POST   /api/auth/register/
GET    /api/auth/check-method/

# Role dashboards (all verified to exist)
GET    /api/admin/me/dashboard/
GET    /api/technicians/me/dashboard/
GET    /api/hod/me/dashboard/
GET    /api/section-head/me/dashboard/
GET    /api/manager/me/dashboard/
GET    /api/user/me/dashboard/

# Tickets
GET    /api/tickets/               ← list (TicketListSerializer — no available_technicians)
POST   /api/tickets/               ← NOT the creation endpoint to use (no section auto-resolution)
POST   /api/tickets/create/        ← USE THIS — TicketCreateSerializer, accepts department_id
GET    /api/tickets/<id>/          ← detail (TicketSerializer — includes available_technicians)
PATCH  /api/tickets/<id>/
POST   /api/tickets/<id>/escalate/
POST   /api/tickets/<id>/close/
POST   /api/tickets/<id>/approve/
POST   /api/tickets/<id>/reject/
POST   /api/tickets/bulk-status-update/   ← backend exists, NO frontend UI yet

# Org structure
GET/POST /api/campuses/
GET/PATCH/DELETE /api/campuses/<id>/
GET/POST /api/departments/
GET/POST /api/campus-departments/
POST /api/campus-departments/<id>/assign-hod/
GET/POST /api/sections/
POST /api/sections/<id>/assign-hos/
GET/POST /api/facilities/

# Users / Technicians
GET    /api/users/
GET    /api/users/<id>/
GET    /api/technicians/
GET    /api/sections/<id>/technicians/
POST   /api/sections/<id>/add-technician/
GET    /api/assignable-users/

# Analytics
GET    /api/analytics/tickets/
GET    /api/analytics/admin-dashboard/
GET    /api/analytics/technicians/
GET    /api/analytics/manager/
GET    /api/analytics/hod/
GET    /api/analytics/section-head/

# Reports
POST   /api/reports/generate/
GET    /api/reports/types/

# Service Catalogue
GET    /api/service-catalogue/section-types/
GET    /api/service-catalogue/service-categories/
GET    /api/service-catalogue/service-items/
GET    /api/section-types/<id>/categories/
GET    /api/categories/<id>/items/

# Comments / Feedback
GET/POST /api/tickets/<id>/comments/
GET/POST /api/tickets/<id>/feedback/
```

### Ticket Field Alignment (Verified)

| Frontend Field | List Serializer | Detail Serializer | Notes |
|----------------|----------------|-------------------|-------|
| `id`, `ticket_no`, `title`, `description` | ✅ | ✅ | — |
| `status`, `priority` | ✅ | ✅ | — |
| `section` (NestedRef + `campus_code`, `department_code`) | ✅ | ✅ | `NestedSectionSerializer` confirmed |
| `facility` | ✅ | ✅ | — |
| `raised_by: string` | ✅ formatted full name | ✅ | **Full name, not username** — frontend comment says "username string" but it's actually `first_name + last_name` |
| `assigned_to` | ✅ | ✅ | — |
| `pending_reason`, `pending_comment` | ✅ | ✅ | — |
| `escalation_level` | ✅ | ✅ | — |
| `next_escalation_due` | ✅ | ✅ | — |
| `form_data` | ✅ | ✅ | — |
| `comments`, `feedback` | ❌ | ✅ | List omits them (intentional optimisation) |
| `available_technicians` | ❌ | ✅ | **Frontend `Ticket` type missing this field** |
| `escalated_to`, `escalated_at`, `escalation_reason` | ❌ | ✅ | **Frontend type missing all three** |
| `is_due_for_escalation` | ❌ | ✅ | **Frontend type missing — different from `is_overdue`** |
| `organizational_path` | ❌ | ✅ | **Frontend type missing** |
| `location_detail` | ❌ | ✅ | **Frontend type missing** |
| `is_overdue` | ❌ | ❌ | Model `@property` — not in either serializer. Filterable via `?is_overdue=true` query param. Phase 4. |

### Constraint Table

| Constraint | Rule | Verified |
|-----------|------|---------|
| Ticket creation endpoint | Use `POST /tickets/create/` — accepts `department_id` and auto-resolves section | ✅ |
| `POST /tickets/` | Still works but does NOT auto-resolve section from department | ✅ |
| Manager role scope | `manager` sees analytics and cross-campus ticket list; write operations gated by permission classes | ✅ |
| Escalation clock | Starts at `assigned_at`, not `created_at` | ✅ |
| Token auth | DRF `TokenAuthentication`, no expiry, no refresh token flow | ✅ |
| Analytics cache | Backend uses `get_cached()` wrapper — 5 min TTL confirmed | ✅ |
| `is_overdue` | Model `@property` only. Not in list or detail serializer. `?is_overdue=true` filter param accepted at the view level. Phase 4. | ✅ |
| `available_technicians` | Only in full `TicketSerializer` (detail). Gated: only returned for `head_of_section`, `hod`, `admin` roles | ✅ |
| `raised_by` | Returns formatted display name (`first_name + last_name`), not raw username | ✅ — frontend comment is misleading |
| Pagination | All list endpoints: `{ count, next, previous, results }`. Default page_size: 25. | ✅ |
| FK write convention | `_id` suffix on write (`section_id`, `facility_id`, `assigned_to_id`). Nested on read. | ✅ |
| SharedDataContext `page_size` | `page_size=500` for users; `page_size=1000` for sections (via `sectionsService.ts`) | ✅ — section fetch is more aggressive than documented |
| Bulk update UI | Backend `POST /tickets/bulk-status-update/` exists; frontend has zero UI for it | ✅ — product gap |
| Global search | Backend supports `?search=` on tickets via DRF SearchFilter; frontend header search is a stub | ✅ — product gap |

---

## 8. Deep Codebase Audit

This section documents findings from a second-pass forensic audit covering Admin CRUD pages, the API services layer, micro-pattern duplication, type system gaps, constants, and a grep-based whole-codebase scan.

---

### 8.1 Admin CRUD Pattern Duplication

The Admin dashboard has five resource management pages (Campuses, Departments, Sections, Facilities, Technicians). Each independently implements the same four-layer pattern (Page → Table → Form → Details), producing ~1,700–2,000 lines of structural duplication.

#### Table container boilerplate — 5× identical (~600 lines)

Every table page renders the same Card + CardHeader + Search input + Columns visibility dropdown + Pagination controls:

```tsx
// CampusesPage.tsx:164-177 — identical in DepartmentsPage, SectionsTable, FacilitiesTable, TechniciansTable
<div className="flex-1 overflow-y-auto p-4 bg-gray-50">
  <Card className="w-full pt-7">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="flex items-center">
        <Icon className="h-6 w-6 mr-2" /> {title}
      </CardTitle>
      <Button size="sm" className="bg-[#0078d4] hover:bg-[#106ebe] flex items-center gap-1"
        onClick={openForm}>
        <Plus className="h-4 w-4" /> Add {resource}
      </Button>
    </CardHeader>
    <CardContent>
      {/* Search + Columns dropdown — identical across all 5 */}
      {/* Table rows — only column names differ */}
      {/* Pagination — [5,10,15,20] page size select — identical */}
    </CardContent>
  </Card>
</div>
```

**Proposed abstraction**: `<AdminResourceTable>` wrapper component accepting `icon`, `title`, `addLabel`, `onAdd`, and `children` (the `<Table>` rows).

**Savings: ~500 lines.**

#### Sortable column header — 15+ identical column definitions

Every resource table defines sortable headers with the same markup:

```tsx
// CampusesPage, DepartmentsPage, TechniciansTable — identical:
header: ({ column }) => (
  <div className="flex items-center space-x-1">
    <span>Name</span>
    <Button variant="ghost" onClick={() => column.toggleSorting()} className="p-0 h-4 w-4">
      <ChevronDown className="h-3 w-3" />
    </Button>
  </div>
),
```

**Fix**: `useSortableColumn(label)` hook that returns this header renderer. **Savings: ~150 lines.**

#### DRF error handler — 8× verbatim copy

The same error-handling block appears in every form submit handler and every detail sheet save handler:

```tsx
// Appears in: SectionForm, TechnicianForm, FacilityDetails, TechnicianDetails,
//             SectionDetails, CampusesPage, DepartmentsPage — identical body:
const err = error as { response?: { data?: Record<string, unknown> } };
if (err?.response?.data) {
  Object.keys(err.response.data).forEach((key) => {
    const val = err.response.data[key];
    const message = Array.isArray(val) ? val.join(' ') : String(val);
    toast.error(`${key}: ${message}`);
  });
} else {
  toast.error('Failed to update');
}
```

**Fix**: `handleDRFError(error, { setError?, fallbackMessage? })` utility in `utils/handleDRFError.ts`.

**Savings: ~130 lines (8 × ~16 lines each).**

#### Page fetch+state boilerplate — `useCRUDPage` opportunity

`CampusesPage` and `DepartmentsPage` each define 10–16 `useState` calls + a `fetchData` async function + `useEffect(() => { fetchData(); }, [])`. This is the exact pattern `useCRUDPage<T>(fetcher)` would encapsulate.

`SectionsTable`, `FacilitiesTable`, `TechniciansTable` correctly avoid this by reading from `useSharedData()`. **Campuses and Departments should do the same** once `campusesService` and `departmentsService` are added to `SharedDataContext`.

**Savings: ~80 lines + 2 fewer API calls per page load.**

#### Inconsistent form validation

- **Campuses/Departments**: raw `useState` per field, no validation schema, no `react-hook-form`
- **Sections/Facilities/Technicians**: `react-hook-form` + Zod schemas from `utils/entityValidation.ts`

**Fix**: Migrate Campuses/Departments forms to `react-hook-form` + Zod. Consistency win, no line savings.

---

### 8.2 API Services Layer Issues

#### Fully redundant service files (delete immediately)

`sectionsService.ts` and `facilitiesService.ts` are complete duplicates of functions already in `organizationsService.ts`:

```ts
// sectionsService.ts:6-13 — calls /sections/ with page_size:1000
// organizationsService.ts:91-95 — calls /sections/ with optional params
// Both used in codebase — SharedDataContext uses organizationsService; SectionForm uses sectionsService
```

**Fix**: Delete `sectionsService.ts` and `facilitiesService.ts`. Update all imports to `organizationsService`. **Savings: ~76 lines.**

#### `techniciansService` duplicates `usersService`

```ts
// techniciansService.ts:19-29
getTechnicianById: async (id) => apiClient.get(`/users/${id}/`),   // = usersService.getUserById
updateTechnician: async (id, data) => apiClient.patch(`/users/${id}/`, data), // = usersService.updateUser
```

**Fix**: Remove the two duplicate methods. **Savings: ~8 lines.**

#### Service files invisible to `index.ts` — 8 files total (not 5)

A forensic audit found **8 service files** missing from `api/services/index.ts`, not 5 as originally counted. The three additional files are `sectionsService.ts`, `facilitiesService.ts`, and `catalogueService.ts`.

| Missing File | LOC | Exports |
|---|---|---|
| `hodService.ts` | 15 | `getHODDashboard` |
| `managerService.ts` | 15 | `getManagerDashboard` |
| `sectionHeadService.ts` | 19 | `getSectionHeadDashboard` |
| `technicianService.ts` | 13 | `getTechnicianDashboard` |
| `userDashboardService.ts` | 14 | `getUserDashboard` |
| `sectionsService.ts` | 39 | `getSections`, 4 CRUD ops |
| `facilitiesService.ts` | 35 | `getFacilities`, 4 CRUD ops |
| `catalogueService.ts` | 62 | 12 catalogue CRUD functions |

**Fix**: Consolidate the 5 dashboard fetchers into `dashboardService.ts` (delete the individual files). Add `sectionsService`, `facilitiesService`, and `catalogueService` to the barrel.

```ts
// api/services/dashboardService.ts
export const getAdminDashboard = (days = 30) => apiClient.get(`/admin/me/dashboard/?days=${days}`);
export const getManagerDashboard = (days = 30) => apiClient.get(`/manager/me/dashboard/?days=${days}`);
export const getHODDashboard = (days = 30) => apiClient.get(`/hod/me/dashboard/?days=${days}`);
export const getSectionHeadDashboard = (days = 30) => apiClient.get('/section-head/me/dashboard/', { params: { days } });
export const getTechnicianDashboard = () => apiClient.get('/technicians/me/dashboard/');
export const getUserDashboard = () => apiClient.get('/user/me/dashboard/');
```
**Savings: delete 5 tiny one-function files (~76 lines).**

#### Orphaned root-level hooks

`hooks/useSections.ts` and `hooks/useFacilities.ts` at the root level are **never exported from `hooks/index.ts`** and are superseded by the richer implementations in `hooks/sections/useSections.ts` and `hooks/facilities/useFacilities.ts`.

**Fix**: Delete both root-level files. **Savings: ~30 lines.**

#### `hooks/index.ts` barrel is incomplete

`useCampuses`, `useDepartments`, `useFacilityFloors`, `useFacilityRooms` exist but are not exported. Consumers must import via direct file path.

**Fix**: Add 4 exports to `hooks/index.ts`. **No line savings; fixes API consistency.**

#### `PaginatedResponse<T>` missing — causes 12 `as any` casts

`organizationsService.ts` contains 12 casts of the form `(data as any).results || []` because no `PaginatedResponse<T>` type exists:

```ts
// Fix — add to types/api.types.ts:
export interface PaginatedResponse<T> {
  count: number; next: string | null; previous: string | null; results: T[];
}

// Then in organizationsService.ts:
function extractResults<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}
```

**Eliminates all 12 `as any` casts in one file.**

---

### 8.3 Micro-Pattern Duplication

Small UI patterns repeated across many files with no shared component.

#### Skeleton loading — 4 implementations in 12+ files

| Pattern | Files | Example |
|---------|-------|---------|
| Manual `animate-pulse` divs | 8 | `<div className="h-12 bg-gray-100 rounded animate-pulse" />` |
| shadcn `<Skeleton>` (correct) | 4 | `<Skeleton className="h-12 w-full" />` |
| `Array.from({length}).map(Skeleton)` | 3 | ManagerCampusBreakdown |
| `[1,2,3].map(animate-pulse)` | 5 | SectionHead, HOD dashboards |

The shadcn `<Skeleton>` component already exists in `components/ui/skeleton.tsx` — half the codebase doesn't use it.

**Fix**: Create `<SkeletonList rows={5} height="h-12" />` wrapper. Replace all inline patterns. **Savings: ~100 lines.**

#### Empty state — 4 implementations, no shared component

```tsx
// Pattern A (8 files): centered grey text
<div className="h-[200px] flex items-center justify-center text-gray-500">
  <p>No data available</p>
</div>

// Pattern B (UserDashboard): icon + message
<div className="bg-white border border-dashed rounded-lg p-6 text-center">
  <CheckCircle className="h-8 w-8 text-green-300 mx-auto mb-2" />
  <p className="text-sm text-gray-500">No active requests — all clear!</p>
</div>

// Pattern C (Report components): error icon
<div className="flex items-center justify-center p-8 text-red-600">
  <AlertCircle className="h-5 w-5 mr-2" />
  <span>Failed to load ticket metrics</span>
</div>
```

**Fix**: `<EmptyState variant="default|success|error" message="..." icon={...} />`. **Savings: ~90 lines.**

#### Error display — verbatim in 3 report files

```tsx
// TicketMetricsReport.tsx:43-49
// TechnicianPerformanceReport.tsx:23-29  — character-for-character identical
// SectionPerformanceReport.tsx:22-28     — character-for-character identical
if (error) {
  return (
    <div className="flex items-center justify-center p-8 text-red-600">
      <AlertCircle className="h-5 w-5 mr-2" />
      <span>Failed to load {reportName}</span>
    </div>
  );
}
```

Covered by the `EmptyState` component above (variant="error"). **Savings: ~50 lines.**

#### Date range picker — 2 implementations

`DashboardLayout.tsx` (lines 248–274) and `GenerateReports.tsx` (lines 173–199) implement identical `<Label><Input type="date" /></Label>` grids with only label text and element IDs differing.

**Fix**: `<DateRangePicker startDate onStartChange endDate onEndChange disabled? />`. **Savings: ~40 lines.**

#### Export/download spinner — 3 implementations

Three components independently animate a `border-2 border-white border-t-transparent rounded-full` spinner while a report generates. No `<Spinner>` component exists in the project.

**Fix**: `<LoadingSpinner size="sm|md" />` in `components/ui/`. **Savings: ~50 lines.**

#### Technician workload table — 5 implementations

`TechniciansWorkload.tsx`, `ManagerTechnicianWorkload.tsx`, `TechnicianPerformanceReport.tsx`, plus 2 more — all render a table with identical column color scheme (`#0078d4` / `#107c10` / `#ffaa44`), differing only in which columns are shown.

**Fix**: `<TechnicianWorkloadTable technicians={...} columns="basic|manager|detailed" />`. Already proposed in §4; confirmed here. **Savings: ~120 lines.**

#### List-item-with-badges (`divide-y`) — 8 files

Already documented in §3. HOD and SectionHead versions are character-for-character identical. **Savings: ~250 lines.**

---

### 8.4 Type System Gaps

All gaps below were confirmed by forensic audit of the actual type files.

| Issue | File | Severity | Fix |
|-------|------|----------|-----|
| `AdminAnalyticsData` uses `any` for both fields (`system_overview: any`, `overdue_tickets: any[]`) | `admin.types.ts:26-29` | **Critical** | Replace with `SystemOverview` + `OverdueTicket[]` already in `analytics.types.ts` |
| `AdminDashboardAnalytics` type exists in `analytics.types.ts` but is never referenced | `analytics.types.ts:112` | High | Wire into `AdminDashboard` type, delete dead type |
| `Section` interface defined three times with conflicting `section_type` field (`unknown\|null` vs `SectionType\|null`) | `section.types.ts`, `organisation.ts`, `organisationStructure.ts` | **High** | Consolidate to one canonical `Section` in `section.types.ts`; delete duplicates |
| `Ticket.available_technicians` missing from type | `ticket.types.ts` | High | Backend returns this on detail endpoint for `head_of_section`, `hod`, `admin` roles; add `available_technicians?: AssignableUser[]` |
| `Ticket.escalated_to`, `escalated_at`, `escalation_reason` missing | `ticket.types.ts` | High | Backend detail serializer returns all three; add to `Ticket` interface |
| `Ticket.is_due_for_escalation` missing | `ticket.types.ts` | High | Distinct from `is_overdue` — backend list and detail both include it |
| `Ticket.organizational_path` missing | `ticket.types.ts` | Medium | Backend detail returns `{ campus, department, section }` hierarchy object for management roles |
| `Ticket.location_detail` missing | `ticket.types.ts` | Medium | Backend list and detail both include this free-text field |
| `raised_by` documented as "username string" but backend returns full display name | `ticket.types.ts` comment | Low | Update comment: backend returns `first_name + last_name` (or fallback to `username`) |
| `TICKET_STATUSES` constant missing 3 backend statuses | `constants/tickets.ts` | Medium | Add `PENDING_APPROVAL`, `APPROVED`, `REJECTED` |
| `LoginForm` password min 1 char; `RegisterForm` password min 6 | `Auth/LoginForm.tsx`, `Auth/RegisterForm.tsx` | Medium | Extract shared `authSchemas` to `utils/authValidation.ts` |
| 12 `as any` casts in `organizationsService.ts` | `api/services/organizationsService.ts` | Medium | Add `PaginatedResponse<T>` type + `extractResults<T>()` helper |
| 4 `as any` casts in `DepartmentsPage.tsx` | `AdminDashboard/Departments/DepartmentsPage.tsx` | Medium | Type department + campus objects properly |
| 4 `as any` casts in `TechTickets.tsx` + `TechSectionTickets.tsx` (2 each) | Two technician files | Medium | Type the paginated response properly |
| `constants/features.ts` is referenced in `CLAUDE.md` (`FEATURES.SERVICE_CATALOGUE`) but the file does not exist | — | Medium | Create with all flags defaulting to `false` |

---

### 8.5 Constants & Configuration Issues

#### `STATUS_LABELS` defined 3 times

```ts
// CANONICAL (correct):
// constants/tickets.ts — exported, covers all 9 statuses

// DUPLICATE 1 (wrong):
// shared/TicketDetailModal.tsx:37 — inline const, same 9 entries

// DUPLICATE 2 (wrong + inconsistent):
// SectionHeadDashboard/SectionHeadChartsSection.tsx:10 — 6 entries, 'pending' = 'On Hold' (wrong label)
```

**Fix**: Delete duplicates; import from `constants/tickets.ts`. Fix `SectionHeadChartsSection` label mismatch. **Savings: ~30 lines.**

#### `PRIORITY_BADGE` — single definition (original claim was incorrect)

Forensic audit found only **one definition** of `PRIORITY_BADGE` — in `TicketDetailModal.tsx`. The `CataloguePage.tsx` definition claimed in the original analysis does not exist. No extraction is needed.

> **Correction**: This item is removed from the immediate-wins list. The `constants/colors.ts` extraction is still worthwhile for the 79+ hardcoded hex values, but PRIORITY_BADGE is not a driver.

#### 143 hardcoded hex colors — no theme system

`#0078d4` appears **79 times** across 35+ files. No CSS variable or JavaScript constant.

```ts
// Create: src/theme/colors.ts
export const BRAND = {
  primary:        '#0078d4',
  primaryHover:   '#106ebe',
  success:        '#107c10',
  warning:        '#ca5010',
  accent:         '#ffaa44',
  error:          '#d13438',
  purple:         '#5c2d91',
  lightBlueBg:    '#e5f2fc',
  lightOrangeBg:  '#fcf0e5',
} as const;
```

Also add corresponding CSS variables in `index.css` for Tailwind arbitrary-value usage:
```css
:root {
  --color-primary: #0078d4;
  --color-primary-hover: #106ebe;
  /* ... */
}
```

**Savings: architectural (no line delta, but 143 references consolidated).**

#### 83 hardcoded role strings — no constants (72 was undercounted)

Forensic audit found **83** occurrences of inline role strings (original count of 72 was ~11 short). Role strings appear as bare literals in 25 files including `App.tsx`, `ProtectedRoute.tsx`, `SharedDataContext`, and `useTicketTable`.

```ts
// Create: src/constants/roles.ts
import type { UserRole } from '@/types/user.types';
export const ROLES = {
  ADMIN:           'admin',
  USER:            'user',
  TECHNICIAN:      'technician',
  HEAD_OF_SECTION: 'head_of_section',
  HOD:             'hod',
  MANAGER:         'manager',
} as const satisfies Record<string, UserRole>;

// Role group constants:
export const ASSIGNMENT_ROLES: UserRole[] = [ROLES.ADMIN, ROLES.HOD, ROLES.MANAGER, ROLES.HEAD_OF_SECTION];
export const APPROVAL_ROLES:   UserRole[] = [ROLES.HOD, ROLES.MANAGER, ROLES.ADMIN];
export const ESCALATION_ROLES: UserRole[] = [ROLES.TECHNICIAN, ROLES.HEAD_OF_SECTION, ROLES.HOD, ROLES.ADMIN];
```

**Also extract from `TicketDetailModal.tsx`** where 7 role arrays are defined inline (lines 197, 327, 336, 344, 348).

---

### 8.6 Codebase-Wide Pattern Scan

Summary of grep-based findings not covered above. Counts marked ✅ were verified by forensic re-audit; those marked ⚠️ were corrected.

| Pattern | Count | Action |
|---------|-------|--------|
| `console.log` to remove | **7** ⚠️ (claimed 4) | Delete: `api/config.ts:15-19` (4 lines), `Auth/AuthPage.tsx:9`, `UserLayout.tsx:89`, `TechnicianLayout.tsx:74` |
| `console.error` (acceptable) | 51 ✅ | Keep — error logging is appropriate |
| `as any` total | **22** ⚠️ (claimed 18) | 12 in `organizationsService` (→ `PaginatedResponse<T>`); 4 in `DepartmentsPage`; 2 in `TechTickets.tsx`; 2 in `TechSectionTickets.tsx` |
| `onSearchChange={() => {}}` dead stubs | 4 layouts ✅ + 2 console.log stubs | Either implement global search or remove the `Header` search prop entirely |
| Empty catch blocks (undocumented) | 2 ✅ | `DepartmentsPage.tsx:44, 102` — add `toast.error()` |
| `CataloguePage` with 26 `useState` calls | 1 ✅ | Refactor to `useReducer` |
| `DepartmentsPage` with 16 `useState` calls | 1 ✅ | Consider `useReducer` or `useCRUDPage` hook |
| `CampusesPage` with 15 `useState` calls | 1 ✅ | Same as above |
| Direct `apiClient` calls in components | **4 files** ⚠️ (claimed 1) | `UserDashboard.tsx` (3 calls), `CampusesPage.tsx`, `DepartmentsPage.tsx`, `CataloguePage.tsx` — all bypass the service layer |
| Duplicate component filenames | 0 ✅ | ✅ None found |
| Unused imports spotted | 0 ✅ | ✅ Imports are clean |
| TODO / FIXME / @ts-ignore | 0 ✅ | ✅ None in codebase |
| **Rules of Hooks violation** | **1** (new) | `useTicketTable.ts:~315` wraps `useSharedData()` in `try/catch` — conditional hook call; technically violates React rules even though it currently works |
| **`useMemo` used instead of `useCallback`** | **1 bug** (new) | `useTicketAnalytics.ts:62` — `refetch` is wrapped in `useMemo` but should be `useCallback`; creates a new function reference on every render |
| **Logout/401 path mismatch** | **1 bug** (new) | `useLogout.ts` redirects to `/auth`; `interceptors.ts` redirects to `/login` — these are different routes |
| **Artificial `setTimeout(500ms)` in `useLogout`** | **1** (new) | Exists solely to show the loading spinner; a UX smell that adds 500ms latency to every logout |

#### `CataloguePage` — 26 `useState` calls is the worst offender

Managing categories, items, filters, form state, modal state, and selections all with individual `useState` calls. This is the single component most in need of `useReducer`:

```ts
// Before: 26 useState calls
const [categories, setCategories] = useState([]);
const [items, setItems] = useState([]);
const [selectedCat, setSelectedCat] = useState(null);
const [isCatFormOpen, setIsCatFormOpen] = useState(false);
// ... 22 more

// After: 1 useReducer
const [state, dispatch] = useReducer(catalogueReducer, initialCatalogueState);
```

#### Direct `apiClient` calls in components — 4 files (not 1)

Forensic audit found the service layer violation in **4 component files**, not just `UserDashboard.tsx`:

- `UserDashboard.tsx:120,142,143` — 3 calls to `/tickets/`, `/service-catalogue/section-types/`, `/departments/`
- `CampusesPage.tsx` — direct `apiClient` calls for all campus CRUD operations
- `DepartmentsPage.tsx` — direct `apiClient` calls for all department CRUD operations
- `CataloguePage.tsx` — direct `apiClient` calls for section types, categories, and items

All four violate the service layer contract. `catalogueService`, `organizationsService.campusesService`, `organizationsService.departmentsService`, and `organizationsService.sectionsService` already cover these endpoints. **Move all four to their respective service functions.**

---

## 9. Deduplication & Refactoring Plan

### Immediate wins — zero regression risk (< 1 day total)

| Task | Files | Action | Savings |
|------|-------|--------|---------|
| Delete `Profile.tsx` × 2 | `UserDashboard/Profile.tsx`, `TechnicianDashboard/Profile.tsx` | Delete | 2 lines |
| Extract `ComingSoonSection` | 6 layout files (3 named `ComingSoon`, 3 named `ComingSoonSection`) | Move to `Common/ComingSoonSection.tsx` | ~125 lines |
| Remove 7 `console.log` stubs | `api/config.ts:15-19` (4 lines), `Auth/AuthPage.tsx:9`, `UserLayout.tsx:89`, `TechnicianLayout.tsx:74` | Delete lines | ~10 lines |
| Remove Magic Link dead code | `authService.ts:47-79`, `useAuth.ts:60-79` (comment blocks + dead type exports) | Delete | ~80 lines |
| Delete `sectionsService.ts` | `api/services/sectionsService.ts` | Delete + update imports (watch return type: paginated vs array) | ~40 lines |
| Delete `facilitiesService.ts` | `api/services/facilitiesService.ts` | Delete + update imports | ~36 lines |
| Delete orphaned root hooks | `hooks/useSections.ts`, `hooks/useFacilities.ts` | Delete | ~30 lines |
| Remove duplicate `techniciansService` methods | `techniciansService.ts:19-29` | Delete 2 functions, use `usersService` | ~8 lines |
| Add 8 missing service files to `index.ts` barrel | `hodService`, `managerService`, `sectionHeadService`, `technicianService`, `userDashboardService`, `sectionsService`, `facilitiesService`, `catalogueService` | Add exports | 0 lines (org) |
| Fix direct `apiClient` calls in 4 components | `UserDashboard.tsx:120,142,143`, `CampusesPage.tsx`, `DepartmentsPage.tsx`, `CataloguePage.tsx` | Route through service layer | quality |
| Fix `refetchUser` no-op | `SharedDataContext.tsx:163` | Remove stub or implement | 1 line |
| Fix Manager over-fetching in SharedDataContext | `SharedDataContext.tsx:99` | Scope sections/users fetch to manager's department | performance |
| Fix empty catch blocks | `DepartmentsPage.tsx:44,102` | Add `toast.error()` | quality |
| Align `STATUS_LABELS` to single source | `TicketDetailModal.tsx:37`, `SectionHeadChartsSection.tsx:10` | Import from `constants/tickets.ts`; fix `pending: 'On Hold'` label bug | ~30 lines |
| Add `PENDING_APPROVAL`, `APPROVED`, `REJECTED` to `TICKET_STATUSES` | `constants/tickets.ts` | Add 3 entries | quality |
| Fix logout/401 path mismatch | `useLogout.ts` (→ `/auth`), `interceptors.ts` (→ `/login`) | Align to one path | ~1 line |
| Fix `useTicketAnalytics` `refetch` | `hooks/analytics/useTicketAnalytics.ts:62` | Change `useMemo` → `useCallback` | ~1 line |
| Fix Rules of Hooks violation in `useTicketTable` | `hooks/tickets/useTicketTable.ts:~315` | Refactor `try/catch useSharedData()` — use optional chaining or a `useOptionalSharedData` hook | ~10 lines |
| Create `constants/features.ts` | new file | Create with `SERVICE_CATALOGUE: false`, `ERP_INTEGRATION: false`, `MULTI_ORG: false` | ~10 lines |
| Add missing fields to `Ticket` type | `types/ticket.types.ts` | Add `available_technicians?`, `escalated_to?`, `escalated_at?`, `escalation_reason?`, `is_due_for_escalation`, `organizational_path?`, `location_detail?` | quality |
| Fix `Section` type triplication | `section.types.ts`, `organisation.ts`, `organisationStructure.ts` | Consolidate to one interface; fix `section_type: unknown` | quality |
| Replace `AdminAnalyticsData` `any` fields | `types/admin.types.ts:26-29` | Use `SystemOverview` + `OverdueTicket[]` from `analytics.types.ts` | quality |

### Phase A — Structural consolidation (2–3 days)

| Task | Target | Result | Savings |
|------|--------|--------|---------|
| `createDashboardContext` factory | 6 context files | 6 one-liners + 1 factory | ~500 lines |
| `useRoleAnalytics(role, days)` | 5 analytics hooks | 1 parameterized hook | ~150 lines |
| Refactor Admin `StatsCards` to `RoleStatsGrid` | `AdminDashboard/Dashboard/StatsCards.tsx` | ~10 lines of config | ~50 lines |
| Refactor Manager `ManagerStatsCards` to `RoleStatsGrid` | `ManagerDashboard/ManagerStatsCards.tsx` | ~10 lines of config | ~50 lines |
| Refactor `TechReport` stat cards to `RoleStatsGrid` | `TechnicianDashboard/TechReport.tsx` | Removes inline `<Card>` blocks | ~80 lines |
| Decouple `StatsCards` from `useAdminDashboard()` | `Common/StatsCards.tsx:13` | Props-only, reusable | 0 lines (quality) |

### Phase B — New shared components (3–4 days)

| Task | New File | Replaces | Savings |
|------|----------|---------|---------|
| `UnifiedSidebar` + `SIDEBAR_CONFIG` | `Common/UnifiedSidebar.tsx` | 5 role sidebar files | ~120 lines |
| `RoleLayout` wrapper | `Common/RoleLayout.tsx` | Shell of all 6 layout files | ~205 lines |
| `AppBarChart` component | `Common/Charts/AppBarChart.tsx` | Inline Recharts in Admin/HOD/SectionHead/Manager | ~80 lines |
| `AppPieChart` component | `Common/Charts/AppPieChart.tsx` | Inline Recharts in Admin/HOD/SectionHead | ~50 lines |
| `QuickFilterButtons` (with counts) | `Common/QuickFilterButtons.tsx` | Admin + Tech custom implementations | ~80 lines |
| `UnifiedDetailsSheet` | `Common/UnifiedDetailsSheet.tsx` | TechnicianDetails + SectionDetails + FacilityDetails | ~483 lines |

### Phase B2 — Cross-role purpose unification (2–3 days)

| Task | New File | Replaces | Savings |
|------|----------|---------|---------|
| `TechnicianListView` (scope + variant) | `Common/TechnicianListView.tsx` | HODTechnicians + SectionHeadTechnicians + wraps TechniciansTable | ~250 lines |
| `SectionsView` (scope + variant) | `Common/SectionsView.tsx` | HODSections + SectionHead inline + wraps SectionsTable | ~120 lines |
| `TechnicianWorkloadList` | `Common/TechnicianWorkloadList.tsx` | HODDashboard + SectionHeadDashboard inline lists | ~40 lines |
| `CampusBreakdownTable` | `Common/CampusBreakdownTable.tsx` | ManagerAnalytics + OrganisationAnalytics tables | ~50 lines |
| `TechnicianPerformanceTable` | `Common/TechnicianPerformanceTable.tsx` | TechnicianPerformanceReport + ManagerAnalytics table | ~80 lines |
| `TimeframeSelector` | `Common/TimeframeSelector.tsx` | ManagerAnalytics `<select>` + ChartsSection `<DropdownMenu>` | ~30 lines |
| Extend `RoleTicketTablePage` to all roles | `Common/RoleTicketTablePage.tsx` | ManagerTickets + TechTickets setup | ~60 lines |

### Phase C — State management migration (1 week)

| Task | Action |
|------|--------|
| Install `@tanstack/react-query` + `zustand` | `npm install @tanstack/react-query zustand` |
| Add `QueryClientProvider` | Wrap in `main.tsx` above `UserDataProvider` |
| Create `src/stores/ticketUIStore.ts` | Zustand store for `activeFilter`, `selectedTicketId`, `isDialogOpen`, `columnVisibility` |
| Migrate `useTickets` → `useQuery` | Replace fetch hook with `useQuery(['tickets', params])` |
| Migrate `useUpdateTicket` → `useMutation` | Add optimistic update (see §5) |
| Split `useTicketTable.ts` (459 lines) | Into `useTicketData`, `useTicketFilters`, `useTicketColumns`, `useTicketActions` |
| Migrate SharedDataContext reference data | `useQuery` + `staleTime: Infinity` replaces context fetch |

### Phase D — Polish (Phase 4 parallel)

| Task | Notes |
|------|-------|
| Count badges on `QuickFilterPills` | Show "Open (12)". Source from analytics hook. |
| Clickable stat cards | `StatCard.onClick` → sets `ticketUIStore.activeFilter` |
| `SLAIndicator` component | Already specified in `CLAUDE.md` Phase 4 |
| `AppSidebar` config-driven nav | If `UnifiedSidebar` not yet done |
| Implement or remove Header search | Either build real search or delete the dead prop |

### Phase B3 — Admin CRUD consolidation (2–3 days)

| Task | New File / Action | Replaces | Savings |
|------|------------------|---------|---------|
| `AdminResourceTable` wrapper | `Common/AdminResourceTable.tsx` | Card+Search+Cols+Pagination in 5 tables | ~500 lines |
| `useSortableColumn(label)` hook | `hooks/useSortableColumn.ts` | Sortable header in 15+ column defs | ~150 lines |
| `handleDRFError()` utility | `utils/handleDRFError.ts` | Error handler in 8 form/detail files | ~130 lines |
| `useCRUDPage<T>(fetcher)` hook | `hooks/useCRUDPage.ts` | State boilerplate in CampusesPage + DepartmentsPage | ~80 lines |
| Consolidate 6 dashboard services → 1 | `api/services/dashboardService.ts` | hodService, managerService, sectionHeadService, technicianService, userDashboardService | ~60 lines |
| Add `PaginatedResponse<T>` type | `types/api.types.ts` | 12 `as any` casts in organizationsService | ~12 casts |
| Migrate Campuses/Departments to `useSharedData()` | `CampusesPage`, `DepartmentsPage` | Local fetch + 15 useState calls | ~80 lines |
| Refactor `CataloguePage` to `useReducer` | `AdminDashboard/Catalogue/CataloguePage.tsx` | 26 useState calls | complexity |

### Phase B4 — Micro-patterns (1–2 days)

| Task | New File | Replaces | Savings |
|------|----------|---------|---------|
| `SkeletonList` component | `Common/SkeletonList.tsx` | 4 skeleton implementations in 12 files | ~100 lines |
| `EmptyState` component | `Common/EmptyState.tsx` | 4 empty-state patterns in 12 files | ~90 lines |
| `DateRangePicker` component | `Common/DateRangePicker.tsx` | DashboardLayout + GenerateReports | ~40 lines |
| `LoadingSpinner` component | `components/ui/Spinner.tsx` | 3 inline spinner implementations | ~50 lines |
| Create `src/theme/colors.ts` | `theme/colors.ts` | 143 hardcoded hex occurrences | architectural |
| Create `src/constants/roles.ts` | `constants/roles.ts` | 72 hardcoded role strings | type-safety |

### Phase B5 — Type system fixes (1 day)

| Task | File | Fix |
|------|------|-----|
| `AdminAnalyticsData` uses `any` | `types/admin.types.ts:26-29` | Replace with `SystemOverview` + `OverdueTicket[]` |
| `Section.section_type` is `unknown` | `types/section.types.ts:24` | Define `SectionType` interface |
| Add `available_technicians` to `Ticket` | `types/ticket.types.ts` | Add `available_technicians?: AssignableUser[]` |
| Extract shared auth schemas | `utils/authValidation.ts` | Fix `LoginForm` min-1 vs `RegisterForm` min-6 password conflict |
| `TicketDetailModal` role arrays | `shared/TicketDetailModal.tsx` | Import `ASSIGNMENT_ROLES`, `APPROVAL_ROLES`, `ESCALATION_ROLES` from constants |
| Decompose `TicketDetailModal` (790 lines) | 5 sub-components | Extract `StatusChangeForm`, `AssignmentForm`, `EscalationForm`, `FeedbackForm` |

### Delete list

```
DELETE entire files:
  src/components/UserDashboard/Profile.tsx
  src/components/TechnicianDashboard/Profile.tsx
  src/api/services/sectionsService.ts          (duplicate of organizationsService)
  src/api/services/facilitiesService.ts         (duplicate of organizationsService)
  src/api/services/hodService.ts               (consolidate → dashboardService.ts)
  src/api/services/managerService.ts           (consolidate → dashboardService.ts)
  src/api/services/sectionHeadService.ts       (consolidate → dashboardService.ts)
  src/api/services/technicianService.ts        (consolidate → dashboardService.ts)
  src/api/services/userDashboardService.ts     (consolidate → dashboardService.ts)
  src/hooks/useSections.ts                     (orphaned — subdirectory version is canonical)
  src/hooks/useFacilities.ts                   (orphaned — subdirectory version is canonical)

DELETE code blocks:
  authService.ts:47-79                         (commented magic link)
  useAuth.ts:60-79, 88-91                      (commented magic link)
  api/config.ts:15-19                          (console.log environment/URL)
  Auth/AuthPage.tsx:9                          (console.log stub)
  UserLayout.tsx:89                            (console.log stub)
  TechnicianLayout.tsx:74                      (console.log stub)
  SharedDataContext.tsx:163                    (no-op refetchUser)
  techniciansService.ts:19-29                  (duplicate of usersService)

EXTRACT to Common (removing per-file copies):
  ComingSoonSection                            (from all 6 layout files)
  STATUS_LABELS inline const                   (TicketDetailModal + SectionHeadChartsSection)
  PRIORITY_BADGE inline const                  (TicketDetailModal + CataloguePage)

CONSOLIDATE (replace N files with 1):
  6 sidebar files            → UnifiedSidebar + SIDEBAR_CONFIG
  6 context files            → createDashboardContext factory
  5 analytics hooks          → useRoleAnalytics(role, days)
  3 detail sheet files       → UnifiedDetailsSheet
  5 dashboard service files  → dashboardService.ts
```

---

## 10. Proposed New File Structure

Files to create (additions only — no deletions until Phase A/B complete):

```
src/
├── stores/
│   └── ticketUIStore.ts                    ← Zustand: activeFilter, selectedTicket, dialog state
│
├── contexts/
│   └── createDashboardContext.ts           ← Factory replacing 6 context providers
│
├── hooks/
│   ├── analytics/
│   │   └── useRoleAnalytics.ts             ← Replaces 5 role-specific analytics hooks
│   └── tickets/
│       ├── useTicketData.ts                ← TanStack Query fetch + pagination
│       ├── useTicketFilters.ts             ← Filter state (reads/writes ticketUIStore)
│       ├── useTicketColumns.ts             ← Column definitions + visibility
│       └── useTicketActions.ts             ← Mutations: update, escalate, close
│
└── components/
    └── Common/
        │
        │  ── Structural ───────────────────────────────────────────────────
        ├── ComingSoonSection.tsx            ← Extract from 6 layout files
        ├── RoleLayout.tsx                   ← Unified layout shell
        ├── UnifiedSidebar.tsx               ← Unified sidebar + SIDEBAR_CONFIG
        │
        │  ── Filters ──────────────────────────────────────────────────────
        ├── QuickFilterButtons.tsx           ← Replaces Admin + Tech custom implementations
        │
        │  ── Admin Detail Sheets ────────────────────────────────────────
        ├── UnifiedDetailsSheet.tsx          ← Replaces TechnicianDetails, SectionDetails, FacilityDetails
        │
        │  ── Cross-Role Feature Components ──────────────────────────────
        ├── TechnicianListView.tsx           ← HODTechnicians + SectionHeadTechnicians + Admin wrapper
        ├── SectionsView.tsx                 ← HODSections + SectionHead inline + Admin wrapper
        ├── TechnicianWorkloadList.tsx       ← HOD + SectionHead workload list
        ├── TechnicianPerformanceTable.tsx   ← Manager + Admin performance table
        ├── CampusBreakdownTable.tsx         ← Manager + Admin campus stats table
        ├── TimeframeSelector.tsx            ← Unified days/week/month picker
        ├── SkeletonList.tsx                 ← Replaces 4 skeleton implementations
        ├── EmptyState.tsx                   ← Replaces 4 empty-state patterns
        ├── DateRangePicker.tsx              ← DashboardLayout + GenerateReports
        ├── AdminResourceTable.tsx           ← Admin CRUD table container
        │
        │  ── Charts ────────────────────────────────────────────────────
        └── Charts/
            ├── AppBarChart.tsx              ← Shared Recharts bar chart wrapper
            └── AppPieChart.tsx              ← Shared Recharts pie chart wrapper

├── api/services/
│   └── dashboardService.ts                  ← Replaces 5 role dashboard service files

├── hooks/
│   └── useCRUDPage.ts                       ← Admin page fetch+state boilerplate
│   └── useSortableColumn.ts                 ← Column header builder for CRUD tables

├── theme/
│   └── colors.ts                            ← BRAND color constants (143 hardcoded refs)

├── constants/
│   ├── roles.ts                             ← ROLES + role-group arrays (83 hardcoded refs)
│   └── features.ts                          ← Feature flags (SERVICE_CATALOGUE, ERP_INTEGRATION, MULTI_ORG)

├── types/
│   └── api.types.ts                         ← PaginatedResponse<T>, eliminates 12 `as any`

├── utils/
│   ├── handleDRFError.ts                    ← DRF error handler (3 confirmed copy-paste sites in detail sheets)
│   └── authValidation.ts                    ← Shared Zod schemas for Login + Register

└── components/ui/
    └── Spinner.tsx                          ← LoadingSpinner (3 inline spinner impls)
```

---

## Summary: Total Estimated Recovery

| Phase | Effort | Lines Saved | What it fixes |
|-------|--------|-------------|--------------|
| **Immediate** (zero-risk deletes) | < 1 day | ~380 | Dead files, duplicate services, console.logs, magic link, STATUS_LABELS |
| **Phase A** (context + stats consolidation) | 2–3 days | ~830 | 6 context providers → factory; 3 stat card bypasses |
| **Phase B** (structural shared components) | 3–4 days | ~1,018 | Sidebar, layout, detail sheets, charts, quick filters |
| **Phase B2** (cross-role feature components) | 2–3 days | ~630 | TechnicianListView, SectionsView, workload lists, campus tables |
| **Phase B3** (Admin CRUD consolidation) | 2–3 days | ~1,000 | Table container, column headers, DRF error handler, useCRUDPage |
| **Phase B4** (micro-patterns) | 1–2 days | ~330 | Skeleton, EmptyState, DateRangePicker, Spinner, colors, roles |
| **Phase B5** (type system) | 1 day | — | `any` → proper types, missing fields, auth schema alignment |
| **Phase C** (TanStack Query + Zustand) | 1 week | structural | Replaces `useState/useEffect/refetch` in ~15 hooks |
| **Phase D** (polish + Phase 4 features) | ongoing | — | Filter counts, clickable stats, SLAIndicator, Header search |
| **Total recoverable (Immediate → B4)** | **~12–14 days** | **~4,188 lines** | |

After Immediate + Phases A through B4, the audited surface drops from **~8,000+ lines** (components + hooks + services) to approximately **~3,800 lines** — a **53% reduction** with zero change in functionality.

**What this buys**: Every new role dashboard requires only role-specific data wiring — not re-implementing layout shells, sidebars, context providers, stat cards, charts, tables, or error handlers. The CRUD pattern for any new admin resource (one `AdminResourceTable` + one `handleDRFError` call) drops from ~400 lines to ~80 lines.

---

## 11. Audit Validation Log — Corrections & New Findings

> **Validated 2026-05-19** against actual codebase (grep + full file reads) and live Django backend (`/django_resolver/`).

### 11.1 Corrections to Original Analysis

The following claims in the original analysis were verified as incorrect or imprecise:

| Claim | Original | Actual | Impact |
|-------|----------|--------|--------|
| Sidebar JSX shells are "identical" | Identical | **Similar but not identical** — subtitle presence, quote style, and `FullScreenLoading` wrapper differ | `UnifiedSidebar` still correct; props will need `subtitle?` |
| `PRIORITY_BADGE` defined in 2 places with different values | 2 definitions | **1 definition only** (in `TicketDetailModal.tsx`) | Remove from immediate-wins list; no action needed |
| `as any` cast count | 18 | **22** (+4 in `TechTickets.tsx` and `TechSectionTickets.tsx`) | Add those files to the type-fix list |
| DRF error handler in 8 files | 8 files | **3 files confirmed** (the 3 admin detail sheets) | `handleDRFError` utility still worthwhile but savings are smaller (~50 not ~130 lines) |
| Hardcoded role strings | ~72 occurrences | **83 occurrences** | Update `roles.ts` extraction estimate |
| Dashboard service files missing from barrel | 5 files | **8 files** (`+sectionsService`, `+facilitiesService`, `+catalogueService`) | Add 3 more to the barrel fix |
| Direct `apiClient` calls in components | 1 file (`UserDashboard`) | **4 files** (`+CampusesPage`, `+DepartmentsPage`, `+CataloguePage`) | Larger service layer cleanup needed |
| `console.log` count | 4 | **7 real occurrences** | Delete all 7 |
| ComingSoon naming | All named `ComingSoonSection` | **Two names**: 3 files use `ComingSoon`, 3 use `ComingSoonSection` | Export as `ComingSoonSection` from `Common/`; update all 6 call sites |

### 11.2 New Findings (not in original analysis)

These issues were discovered during forensic validation and are not covered anywhere in the original document:

| Finding | Location | Severity | Recommended Fix |
|---------|----------|----------|-----------------|
| `useTicketTable` wraps `useSharedData()` in `try/catch` — Rules of Hooks violation | `hooks/tickets/useTicketTable.ts:~315` | **High** | Extract a `useOptionalSharedData()` hook that safely returns `null` without `try/catch`; or restructure to always call the hook |
| `useTicketAnalytics` creates `refetch` with `useMemo` instead of `useCallback` | `hooks/analytics/useTicketAnalytics.ts:62` | Medium | Change `useMemo` → `useCallback` — one-line fix |
| Logout path mismatch: `useLogout` → `/auth`; 401 interceptor → `/login` | `hooks/useLogout.ts`, `api/interceptors.ts` | Medium | Align to a single path constant |
| `useLogout` has artificial `setTimeout(500ms)` before redirect | `hooks/useLogout.ts` | Low | Remove — let the navigation happen immediately |
| `Section` interface exists in 3 files with conflicting `section_type` field types | `section.types.ts` (`unknown\|null`), `organisation.ts` (`SectionType\|null`), `organisationStructure.ts` | **High** | Consolidate to `section.types.ts`; update barrel exports |
| 5 fields missing from frontend `Ticket` type that backend returns on detail endpoint | `types/ticket.types.ts` | High | Add: `escalated_to?`, `escalated_at?`, `escalation_reason?`, `is_due_for_escalation`, `organizational_path?`, `location_detail?` |
| `raised_by` is documented as "username string" but backend returns formatted full name | `ticket.types.ts` comment, `CLAUDE.md §8` | Low | Correct the comment; no type change needed (it is a `string`) |
| `constants/features.ts` referenced in `CLAUDE.md` does not exist in the codebase | — | Medium | Create the file; Phase 4 features gated behind it |
| `SharedDataContext` fetches `page_size=1000` for sections (not 500 as documented) | `api/services/sectionsService.ts` | Medium | Document correctly; long-term fix is cursor pagination |
| All data hooks in `SharedDataContext` fire for all roles unconditionally — `user` role triggers large fetches that are discarded | `contexts/SharedDataContext.tsx` | High | Move fetch logic inside the role condition; use TanStack Query with role-scoped query keys in Phase C |
| `useUsers.ts` suppresses a legitimate stale-closure warning with `eslint-disable` | `hooks/users/useUsers.ts:26` | Low | Restructure `fetchUsers` as a `useCallback` or refactor via TanStack Query in Phase C |
| `catalogueService.ts` (62 LOC, 12 functions) is missing from `api/services/index.ts` | `api/services/catalogueService.ts` | Medium | Add to barrel |
| Backend has `POST /tickets/bulk-status-update/` — no frontend UI exists for it | backend `urls.py` | Product gap | Add checkboxes + bulk action bar in Phase B (admin/hod/manager roles) |
| Backend supports `?search=` full-text filter on `/tickets/` — frontend header search is a no-op stub in all 6 dashboards | `api/views/ticket_views.py`, all `*Layout.tsx` | Product gap | Wire `Header.onSearchChange` → `useTicketTable` → `?search=` param |

### 11.3 Backend API — Confirmed Alignment

The Django backend is at `/home/jeremy/Desktop/portfolio/django_resolver/` (separate repo).

**Role strings**: Exact match between frontend `UserRole` and backend `ROLE_CHOICES` — `user`, `technician`, `head_of_section`, `hod`, `manager`, `admin`. No rename needed.

**All 6 dashboard endpoints exist** and are confirmed in `tickets/api/urls.py`.

**`NestedSectionSerializer`** confirmed to return `campus_code` and `department_code` — the CLAUDE.md §20 section display logic is backend-verified.

**`/tickets/create/` endpoint** takes `department_id` + `service_item_id` (optional) + `title` + `description` + `form_data`. The frontend wizard's `createTicketCatalogue` service function correctly targets this endpoint. `POST /tickets/` also exists but does not auto-resolve sections.

**Filter `?is_overdue=true`** accepted by `TicketListCreateView` (confirmed in `ticket_views.py:137`). The frontend's `overdueFilter` boolean maps to this correctly.

**`is_overdue` is NOT a serializer field** — it is a Python `@property` on the `Ticket` model (`tickets/models/tickets.py:464`). It is exposed in analytics responses only (`user_analytics.py:65`). Phase 4 work requires adding it to the serializer or computing it on the frontend from `due_date`.

### 11.4 Evidence-Based Priority Adjustment

Based on validation results, two items are elevated in priority relative to the original plan:

**1. `useTicketTable` Rules of Hooks violation (was: not in plan → now: Phase A blocker)**

The `try/catch` around `useSharedData()` is technically invalid React. It currently works because React's hook tracking doesn't inspect `try/catch` boundaries, but any React DevTools profiler run, future React compiler optimization, or Strict Mode double-invoke could expose the bug. Fix this before Phase A, as the `createDashboardContext` refactor changes how `SharedDataContext` propagates.

**2. Header search (was: Phase D nice-to-have → now: P1 product gap)**

Industry benchmarks (§2) confirm that client-side-only search is not standard for any service desk handling more than a few hundred tickets per role. The backend already supports `?search=`. Wiring it is a one-hook change in `useTicketTable` and a one-prop change in each layout. This should land in Phase B alongside the structural cleanups, not Phase D.

**3. URL-based filter state (was: not in plan → new recommendation)**

Filters reset on page navigation. Industry-standard behavior (Zammad, JSM, Freshservice) preserves filter state in the URL. Using `react-router-dom`'s `useSearchParams` as the source of truth for `statusFilter`, `sectionFilter`, etc. in `useTicketTable` achieves this with no additional dependencies. Add to Phase B2 alongside `TechnicianListView` and `SectionsView`.
