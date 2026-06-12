# Resolver — Multi-Campus Service Desk Frontend

React frontend for the Kenya School of Government service desk system. Role-scoped dashboards, real-time analytics, Excel report generation, and a full ticket lifecycle UI.

**Stack:** React 18 · TypeScript · Vite · shadcn/ui · Tailwind CSS · Recharts · TanStack Table · React Query

---

## Quick Start

```bash
git clone https://github.com/JeremyWarui/Resolver && cd Resolver/client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev       # http://localhost:5173
```

Requires the Django backend running locally. See [django_resolver](https://github.com/JeremyWarui/django_resolver).

---

## Available Scripts

```bash
npm run dev       # dev server with HMR
npm run build     # TypeScript check + production build
npm run preview   # preview production build
npm run lint      # ESLint
```

---

## Project Structure

```
client/src/
├── features/
│   ├── admin/          — Admin dashboard, tickets, analytics, reports, facilities, sections, audit log
│   ├── manager/        — Manager dashboard, analytics, reports
│   ├── hod/            — HOD dashboard, sections, technicians
│   ├── hos/            — HOS dashboard, technicians, assignment modal
│   ├── technician/     — Technician dashboard, tickets, reports
│   ├── user/           — Requester dashboard, my tickets, ticket creation
│   └── shared/         — RoleDashboardView, RoleAnalyticsView, RoleReportsPage, RoleTicketsPage
├── components/
│   ├── ui/             — shadcn/ui primitives
│   ├── shared/data/    — MetricCard, KPICard, DistributionCharts, ServiceHealthCards,
│   │                     StatCards stack, DataTable, InsightsPanel
│   ├── shared/ticket/  — TicketCreationWizard, TicketDetailModal, StatusBadge, etc.
│   ├── shared/forms/   — FilterPanel, TechnicianPicker, FacilityType forms
│   └── layout/         — MainLayout, RoleLayout, AppSidebar, RoleSwitcher
├── hooks/
│   ├── dashboard/      — useAdminDashboard, useManagerDashboard, useTechnicianDashboard, etc.
│   ├── analytics/      — useAnalytics, usePerformanceTechnicians, usePerformanceSections
│   ├── tickets/        — useTicketFilterOptions, useTicketDetail, useTicketFilters
│   └── catalog/        — useCatalog
├── lib/api/            — typed API clients per domain (tickets, analytics, reports, auth, …)
├── types/              — shared TypeScript interfaces
└── App.tsx
```

---

## Roles & Dashboards

Each role gets a dedicated layout and dashboard. Scope is derived server-side from the JWT; frontend role checks are UI convenience only.

| Role | Dashboard | Analytics | Reports | Tickets |
|------|-----------|-----------|---------|---------|
| Admin | Org-wide overview, facilities, audit log | Full org analytics | All 5 report types | All tickets |
| Manager | Dept overview, campus breakdown | Dept analytics | Lifecycle, tech perf, facilities | Dept tickets |
| HOD | Campus-dept overview, sections | Campus-dept analytics | Same as manager | Campus-dept tickets |
| HOS | Section overview, technician workload | Section analytics | Same as manager | Section tickets |
| Technician | Personal + section context | Own performance | Own performance report | Assigned tickets |
| Requester | My tickets overview | — | — | Own tickets |

Staff users can toggle between their role workspace and the Requester view via the sidebar context switcher.

---

## Key Patterns

**StatCards (dashboards only):** 5-card overview strip on every role homepage (Total / Open / Resolved / Pending / Escalated). Read-only. Never wired to table filters.

**KPI cards (analytics/reports only):** `KPICardGrid` → `KPICard` with trend %. Used on deep-dive analytics pages.

**Filter dropdowns:** Sections / Technicians / Users come from `GET /api/v1/tickets/filter-options/` — scoped by JWT, populated via `useTicketFilterOptions()`.

**Shared role views:** `RoleDashboardView`, `RoleAnalyticsView`, `RoleReportsPage` in `src/features/shared/` are parametrized by `role` prop. Admin and Manager are thin wrappers around these; scope variation is StatCards + endpoint `group_by`.

**Report generation:** `GenerateReports.tsx` reads `useAuth().user.role` to show only relevant report types. Excel files streamed from `/api/v1/reports/generate/`.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Django backend base URL (e.g. `http://localhost:8000/api`) |

---

## Deployment

### Vercel

1. Push to GitHub
2. Import project to Vercel, set root to `client/`
3. Set `VITE_API_URL` environment variable to production backend URL
4. Deploy — automatic on push

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Filter dropdowns empty | Hard-refresh (Ctrl+Shift+R) — React Query staleTime is 5 min |
| CORS errors | Add frontend URL to Django `CORS_ALLOWED_ORIGINS` |
| Auth loop | Clear `localStorage` and re-login |
| Build errors | Run `npm install`, check `npm run build` TypeScript output |

---

## License

MIT
