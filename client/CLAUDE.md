# CLAUDE.md — Resolver Frontend

> **Kenya School of Government — Multi-Campus Service Desk System**
> React 19 · TypeScript · Vite · shadcn/ui · Tailwind CSS 4

---

## 1. Project Overview

The Resolver frontend is a role-gated SPA that provides six distinct dashboards — one per user role. It is the only consumer of the Django Resolver REST API. Each role sees a scoped view of tickets: from a regular user's personal ticket list all the way to a manager's cross-campus overview.

**Dev**: `http://localhost:5173`
**Prod**: `https://django-resolver.onrender.com` (backend) — frontend hosted on Vercel.

---

## 2. Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI runtime |
| TypeScript | 6.x | Type safety |
| Vite | 8.x | Build + dev server |
| Tailwind CSS | 4.x | Utility styling |
| shadcn/ui | (component registry) | Pre-built accessible components |
| @radix-ui/* | various | Headless primitives under shadcn |
| react-router-dom | 7.x | Client-side routing |
| axios | 1.x | HTTP client |
| react-hook-form | 7.x | Form state |
| zod | 4.x | Schema validation |
| @tanstack/react-table | 8.x | Data tables |
| recharts | 3.x | Charts |
| sonner | 2.x | Toast notifications |
| lucide-react | 1.x | Icons |
| next-themes | 0.4.x | Dark-mode theme switching |

**No additional UI libraries.** If you need a new component not in shadcn, build it with Radix + Tailwind.

---

## 3. Directory Layout

```
client/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── package.json
├── components.json              # shadcn/ui registry config
└── src/
    ├── main.tsx                 # Entry point — mounts App inside providers
    ├── App.tsx                  # Router with role-based lazy routes
    ├── App.css / index.css      # Global styles + Tailwind base
    ├── api/
    │   ├── client.ts            # Axios instance
    │   ├── config.ts            # Base URL, timeouts
    │   ├── interceptors.ts      # Token injection, 401 redirect
    │   └── services/            # One file per resource
    │       ├── authService.ts
    │       ├── ticketsService.ts
    │       ├── usersService.ts
    │       ├── sectionsService.ts
    │       ├── techniciansService.ts
    │       ├── facilitiesService.ts
    │       ├── organizationsService.ts
    │       ├── analyticsService.ts
    │       ├── reportsService.ts
    │       └── index.ts         # Re-exports
    ├── types/
    │   ├── index.ts             # Re-exports all types
    │   ├── ticket.types.ts
    │   ├── user.types.ts
    │   ├── section.types.ts
    │   ├── facility.types.ts
    │   ├── technician.types.ts
    │   └── analytics.types.ts
    ├── contexts/
    │   ├── UserDataContext.tsx   # Current user profile + refetch
    │   └── SharedDataContext.tsx # Sections, facilities, org data
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useLogout.ts
    │   ├── tickets/
    │   ├── sections/
    │   ├── users/
    │   ├── technicians/
    │   ├── analytics/
    │   └── facilities/
    ├── components/
    │   ├── ui/                  # shadcn-generated primitives
    │   ├── Common/              # Shared non-role components
    │   ├── Auth/                # Login, Register, ProtectedRoute
    │   ├── MainLayout.tsx
    │   ├── AdminDashboard/
    │   ├── UserDashboard/
    │   ├── TechnicianDashboard/
    │   ├── SectionHeadDashboard/
    │   ├── HODDashboard/
    │   └── DirectorDashboard/
    ├── constants/               # Enums, label maps
    ├── lib/                     # cn() utility, misc
    └── utils/                   # Date formatting, ticket helpers
```

---

## 4. Router & Navigation

`src/App.tsx` defines all routes with lazy loading:

```tsx
const AdminLayout    = lazy(() => import('./components/AdminDashboard/AdminLayout'));
const UserLayout     = lazy(() => import('./components/UserDashboard/UserLayout'));
const TechnicianLayout = lazy(() => import('./components/TechnicianDashboard/TechnicianLayout'));
const SectionHeadLayout = lazy(() => import('./components/SectionHeadDashboard/SectionHeadLayout'));
const HODLayout      = lazy(() => import('./components/HODDashboard/HODLayout'));
const DirectorLayout = lazy(() => import('./components/DirectorDashboard/DirectorLayout'));
```

### Route → role mapping

| Path prefix | Required role |
|-------------|--------------|
| `/dashboard/*` | `admin` |
| `/user/*` | `user` |
| `/technician/*` | `technician` |
| `/section-head/*` | `section_head` → **will become `head_of_section`** |
| `/hod/*` | `hod` |
| `/director/*` | `director` → **will become `manager`** |

`/` and all unmatched routes redirect to `/login`.

### Role-based post-login redirect

After login, route based on `user.role`:

```tsx
const ROLE_PATHS: Record<UserRole, string> = {
  admin: '/dashboard',
  user: '/user',
  technician: '/technician',
  section_head: '/section-head',   // update when role renames
  hod: '/hod',
  director: '/director',           // update when role renames
};
```

---

## 5. Auth Flow

**Storage**: Token stored in `localStorage` under key `authToken`. User profile stored under `currentUser`.

**Lifecycle:**

1. `authService.login(credentials)` → POST `/api/auth/login/` → stores token + user
2. `useAuth()` hook initialises auth state from localStorage on mount
3. `UserDataContext` fetches fresh profile from `/api/auth/profile/` after login
4. Axios request interceptor reads token from localStorage and sets `Authorization: Token <token>` on every request
5. Response interceptor: on 401 → call `logout()` → redirect to `/login`

### Key auth files

| File | Purpose |
|------|---------|
| `api/services/authService.ts` | login, logout, register, getCurrentUser |
| `api/interceptors.ts` | Token injection + 401 handling |
| `hooks/useAuth.ts` | Auth state (user, isAuthenticated, isLoading) |
| `hooks/useLogout.ts` | Calls authService.logout() + navigate |
| `contexts/UserDataContext.tsx` | Provides `useCurrentUser()` |
| `components/Auth/ProtectedRoute.tsx` | Role gate wrapper |
| `components/Auth/AuthWrapper.tsx` | Decides redirect post-auth |

---

## 6. Role-Based Dashboards

Each role gets its own layout component with nested routes.

### Dashboard features by role

| Role | Dashboard | Key views |
|------|-----------|-----------|
| `user` | UserDashboard | My tickets, raise ticket, ticket detail |
| `technician` | TechnicianDashboard | Assigned queue, section tickets, update status |
| `head_of_section` | SectionHeadDashboard | Section overview, assign, reassign, escalate |
| `hod` | HODDashboard | Campus overview, department stats, HoS management |
| `manager` | DirectorDashboard | Cross-campus dept view, analytics, approve/reject |
| `admin` | AdminDashboard | Full system, user management, org structure, reports |

### SectionHeadDashboard

`head_of_section` has all technician capabilities **plus** assign/reassign within their section. They see the same ticket queue as technicians in their section but with action buttons for assignment and manual escalation.

### DirectorDashboard

`manager` scope: cross-campus but **own department only**. They can view tickets from any campus where their department exists, approve pending_approval tickets, and reject with reason.

---

## 7. API Layer

### Axios instance (`api/client.ts`)

Single shared instance configured with base URL and timeout. Token attached per request by the request interceptor.

### Base URL selection (`api/config.ts`)

```ts
const MODE = import.meta.env.MODE;
// dev  → VITE_API_URL_DEV  || 'http://localhost:8000/api'
// prod → VITE_API_URL_PROD || 'https://django-resolver.onrender.com/api'
```

### Service pattern

Each service file exports named async functions:

```ts
// ticketsService.ts
export const getTickets = (params?) => apiClient.get('/tickets/', { params });
export const getTicket  = (id: number) => apiClient.get(`/tickets/${id}/`);
export const createTicket = (data: CreateTicketPayload) => apiClient.post('/tickets/', data);
export const updateTicket = (id: number, data: Partial<UpdateTicketPayload>) =>
  apiClient.patch(`/tickets/${id}/`, data);
export const escalateTicket = (id: number, data: EscalatePayload) =>
  apiClient.post(`/tickets/${id}/escalate/`, data);
export const closeTicket = (id: number) =>
  apiClient.post(`/tickets/${id}/close/`);
```

Services never handle errors — callers catch and display via toast.

---

## 8. Type System

All types live in `src/types/`. Import via the barrel:

```ts
import type { Ticket, User, UserRole } from '@/types';
```

### Core types

**`UserRole`** (`user.types.ts`):
```ts
type UserRole = 'user' | 'technician' | 'section_head' | 'hod' | 'director' | 'admin';
```
> Update to `'head_of_section'` and `'manager'` when backend roles are renamed.

**`Ticket`** (`ticket.types.ts`):
```ts
interface Ticket {
  id: number;
  ticket_no: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  section: NestedRef;
  facility: NestedRef;
  raised_by: string;              // username string (not object)
  assigned_to: AssignedUser | null;
  escalation_level?: 0 | 1 | 2;
  next_escalation_due?: string | null;
  pending_reason?: string | null;
  pending_comment?: string | null;
  resolved_at?: string | null;
  form_data?: Record<string, unknown> | null;
  comments?: Comment[];
  feedback?: Feedback;
}
```

**`NestedRef`** (`section.types.ts`):
```ts
interface NestedRef { id: number; name: string; code?: string; }
```

**Write payloads**: use `_id` suffix for FK fields:

```ts
interface CreateTicketPayload {
  title: string;
  description: string;
  section_id: number;
  facility_id: number;
  form_data?: Record<string, unknown>;
}
```

---

## 9. State Management

No global state library. State flows via:

1. **Contexts** — singleton shared data fetched once per session
2. **Custom hooks** — per-view fetching with local `useState` + `useEffect`
3. **react-hook-form** — form-local state only

### Contexts

**`UserDataContext`** — provides `useCurrentUser()`:
```ts
const { userData, loading, refetch } = useCurrentUser();
```

**`SharedDataContext`** — provides org structure (sections, facilities, departments) needed across multiple views. Fetched once on auth.

### Hook pattern

```ts
// hooks/tickets/useTickets.ts
export const useTickets = (params?: TicketFilters) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ticketsService.getTickets(params)
      .then(res => setTickets(res.data.results))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [/* stable dep */]);

  return { tickets, loading, error };
};
```

Always handle all three states (loading / error / data) in the consuming component.

---

## 10. Component Conventions

- One component per file; filename matches exported component name.
- Props interface defined inline or in the same file (not a separate types file unless shared).
- Use `cn()` from `lib/utils.ts` for conditional classNames.
- No inline styles — Tailwind only.
- Event handlers named `handle<Event>` (e.g. `handleSubmit`, `handleRowClick`).
- Loading states: use the spinner in `components/Common/` (or shadcn `Skeleton`).
- Empty states: always render a descriptive empty state, never just null.

### shadcn/ui component usage

Import from `@/components/ui/<component>`:

```tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

To add a new shadcn component:
```bash
npx shadcn add <component-name>
```

This writes the source into `src/components/ui/`. Edit it there if customisation is needed.

---

## 11. Forms (react-hook-form + zod)

Standard form pattern:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({
  title: z.string().min(5, 'At least 5 characters'),
  section_id: z.number({ required_error: 'Required' }),
});

type FormValues = z.infer<typeof schema>;

const MyForm = () => {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await ticketsService.createTicket(values);
    toast.success('Ticket created');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>Submit</Button>
      </form>
    </Form>
  );
};
```

### Dynamic form_schema rendering (Phase 4)

`ServiceItem.form_schema` is a JSON array of field definitions. Render dynamically:

```ts
type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date';

interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}
```

Map `type` to the corresponding shadcn component. Register each field with `form.register(field.name)`.

---

## 12. Tables (@tanstack/react-table)

Use `@tanstack/react-table` v8 for all data tables.

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
```

Define columns as `ColumnDef<RowType>[]`. Access cell value via `row.original`. Use shadcn `Table` primitives for markup:

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
```

**Row click → detail navigation**: use `useNavigate()` in the row `onClick`.

**Status/priority badges**: map status strings to Tailwind variant colours in a constants file, not inline.

---

## 13. Charts (recharts)

Use `recharts` v3 for all analytics visualisations.

Common chart types used:

```tsx
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

Always wrap in `<ResponsiveContainer width="100%" height={300}>`.

Colour palette: use the Tailwind CSS variable tokens (e.g. `var(--color-blue-500)`) or a named constant array to keep dashboards consistent.

---

## 14. UI System (shadcn/ui + Tailwind)

### Tailwind v4 notes

Tailwind 4 uses CSS-native configuration (`tailwind.config.ts` is supplementary). The `@tailwindcss/vite` plugin replaces the PostCSS approach.

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()] });
```

### Theme tokens

CSS variables for colours live in `src/index.css` (shadcn standard). Do not hardcode hex values — use Tailwind utilities that resolve to these variables.

### Dark mode

`next-themes` provides `ThemeProvider`. Toggle via `useTheme()` hook:

```tsx
import { useTheme } from 'next-themes';
const { theme, setTheme } = useTheme();
```

All components must respect dark mode by using semantic Tailwind classes (`bg-background`, `text-foreground`, `border-border`) rather than hardcoded colours.

### Icon system

Use `lucide-react` exclusively:

```tsx
import { Ticket, User, Settings, ChevronDown, AlertCircle } from 'lucide-react';
<Ticket className="h-4 w-4" />
```

---

## 15. Toast Notifications

Use `sonner` via the `<Toaster />` mounted in `App.tsx`:

```tsx
import { toast } from 'sonner';

toast.success('Ticket assigned successfully');
toast.error('Failed to load tickets');
toast.warning('SLA breach approaching');
toast.info('Ticket escalated to HoD');
```

`<Toaster richColors position="top-right" />` is already in `App.tsx`. Do not add a second one.

---

## 16. Role Guards

### `ProtectedRoute` component

```tsx
<ProtectedRoute requiredRoles={['admin', 'hod']}>
  <SomeAdminOnlyPage />
</ProtectedRoute>
```

If `user.role` is not in `requiredRoles`, redirect to `/login` (or role's home route if authenticated).

### Inline role checks

```tsx
const { userData } = useCurrentUser();
const canAssign = ['head_of_section', 'hod', 'manager', 'admin'].includes(userData?.role ?? '');
```

Use `userData.role` checks for:
- Showing/hiding action buttons (assign, escalate, approve)
- Conditionally rendering dashboard sections
- Enabling/disabling form fields

Do not duplicate permission logic that the API enforces — guard the UI for UX only. The API is the authoritative permission layer.

---

## 17. Feature Gating by Phase

Features that do not exist yet should be hidden, not shown as disabled. Use a simple constant:

```ts
// constants/features.ts
export const FEATURES = {
  SERVICE_CATALOGUE: false,   // Phase 4
  ERP_INTEGRATION:   false,   // Phase 5/6
  MULTI_ORG:         false,   // Phase 6
} as const;
```

```tsx
{FEATURES.SERVICE_CATALOGUE && <ServiceItemPicker />}
```

When a phase ships, flip the flag and remove the gate.

---

## 18. Building & Deployment

```bash
# Development
npm run dev           # Vite dev server on :5173

# Type check
npx tsc --noEmit

# Lint
npx eslint src/

# Production build
npm run build         # Output to dist/

# Preview prod build
npm run preview
```

**Vercel deployment**: `vercel.json` at project root. All routes rewrite to `index.html` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Environment variables set in Vercel project settings:
- `VITE_API_URL_PROD` — production Django backend URL

---

## 19. Environment Variables

`.env` files at `Resolver/client/`:

```bash
# .env.development (gitignored)
VITE_API_URL_DEV=http://localhost:8000/api

# .env.production (gitignored, set in Vercel)
VITE_API_URL_PROD=https://django-resolver.onrender.com/api
```

All frontend env vars must be prefixed `VITE_` to be exposed to the browser. Access via `import.meta.env.VITE_*`.

---

## 20. Common Pitfalls

**Role string sync**: `UserRole` in `user.types.ts` uses `head_of_section` and `manager` (already aligned with backend). Routes live at `/section-head/*` and `/manager/*`. `DirectorDashboard/` is the folder for the manager dashboard — the folder was not renamed but all internal components use `Manager*` names.

**Token in localStorage**: `authService.getCurrentUser()` reads from `localStorage`. After login, `UserDataContext` fetches a fresh profile from `/api/auth/profile/` — use context data, not localStorage, for rendering user info.

**Axios response shape**: DRF paginated responses are `{ count, next, previous, results }`. Ticket list responses need `.data.results`; detail responses are `.data` directly.

**Form `_id` vs nested object**: API returns nested objects on read (`section: { id, name }`), expects `_id` integers on write (`section_id: 1`). Type payloads accordingly.

**Lazy route fallback**: `<Suspense fallback={<RouteLoading />}>` wraps all lazy routes in `App.tsx`. If you add a new lazy route, ensure it's inside the `<Suspense>` boundary.

**Recharts responsive container**: never set a fixed pixel height on the parent of `<ResponsiveContainer>` — it must have a defined height from the parent's CSS.

**shadcn `Select` controlled**: `<Select>` is not wired to react-hook-form `register` — use `<Controller>` with `onValueChange`:

```tsx
<FormField control={form.control} name="section_id" render={({ field }) => (
  <Select onValueChange={val => field.onChange(Number(val))} value={String(field.value ?? '')}>
    ...
  </Select>
)} />
```

**`cn()` utility**: always use `cn()` from `@/lib/utils` for conditional class merging, never template literals or manual string concatenation.

**TypeScript path alias**: `@/` maps to `src/`. Configured in `tsconfig.app.json` and `vite.config.ts`. Use it for all internal imports.

---

## 21. Future Phases

### Phase 4 — SLA Tracking & Email Notifications (Frontend)

Do not start until the backend Phase 4 items are complete (`is_overdue` fix, `time_remaining` property, `check_sla_breaches` command, all 8 email events).

**1. `SLAIndicator` component**

Create `src/components/Common/SLAIndicator.tsx`:

```tsx
interface SLAIndicatorProps {
  dueDate: string | null       // ISO datetime string from API
  isOverdue: boolean
  status: TicketStatus
  compact?: boolean            // true = chip only; false = full "Due by [date]" label
}
```

Rendering logic:
- No `dueDate`, or status is `resolved`/`closed`/`rejected` → render nothing
- `isOverdue === true` → red chip: "Overdue by X days" (or hours if < 48h)
- Less than 25% of SLA window remaining → amber chip: "Due in X hours"
- More than 25% remaining → green chip: "Due in X days/hours"

Use this component:
- Ticket list rows and table cells → `compact={true}` (chip only)
- Ticket detail modal Column 1 → `compact={false}` (full label)

Calculating 25% threshold: the API returns `time_remaining` as total seconds. SLA window in seconds = `(new Date(dueDate).getTime() - ticket.created_at_ms) / 1000`. If `time_remaining / sla_window < 0.25` → amber.

**2. Overdue filter on ticket lists**

All roles that see more than their own tickets (`head_of_section`, `hod`, `manager`, `admin`) should have an "Overdue" filter tab or filter chip on their ticket list views. Pass `overdue=true` as a query param to `GET /api/tickets/` — the backend `filters.py` already supports this via the `is_overdue` annotation on the queryset.

**3. SLA summary strip on dashboards**

For `head_of_section`, `hod`, `manager`, and `admin` dashboards, add a summary row at the top of the main content area containing four stat cards:
- Total open tickets
- Overdue count — clicking it applies the overdue filter to the ticket list on that dashboard
- SLA compliance rate (from the analytics endpoint — already returned in `sla_compliance` field)
- Average resolution time (from `avg_resolution_hours` in analytics)

Source the data from the existing analytics hooks for each dashboard — do not add new API calls.

---

### Phase 5 — Attachments (Frontend)

Organisation analytics is already complete. Only the attachments UI remains.

Do not start until the backend Phase 5 `Attachment` model, migration, and endpoints are in place.

**1. `AttachmentUploader` component**

Create `src/components/Common/AttachmentUploader.tsx`:

```tsx
interface AttachmentUploaderProps {
  ticketId: number
  existingAttachments: Attachment[]
  onUploadComplete: () => void   // refresh ticket after upload
  disabled?: boolean
}
```

Behaviour:
- Drag-and-drop zone + "Browse files" button
- Show upload progress per file (use `axios` `onUploadProgress`)
- Render existing attachments as a list: filename, file size (human-readable), uploaded by, uploaded at
- Image attachments: show a thumbnail preview; click → open in a new tab
- PDF/DOCX attachments: show a file icon + filename; click → open in a new tab
- Delete button on each attachment (only for uploader or admin; check `uploaded_by.id === userData.id || userData.role === 'admin'`)
- Enforce 5-attachment limit in the UI — disable the drop zone when count reaches 5 and show "Maximum 5 attachments"
- Enforce 10 MB limit per file — reject oversized files before upload with a `toast.error`

**2. Add `Attachment` type to `src/types/`**

Add to `ticket.types.ts` or create `attachment.types.ts`:

```typescript
export interface Attachment {
  id: number;
  filename: string;
  file_size: number;
  content_type: string;
  file_url: string;          // absolute URL served by Django / CDN
  uploaded_by: { id: number; username: string };
  uploaded_at: string;       // ISO datetime
}
```

Add `attachments: Attachment[]` to the `Ticket` interface (detail only — not on `TicketListSerializer`).

**3. Add API service functions**

Add to `src/api/services/ticketsService.ts`:

```typescript
export const getAttachments = (ticketId: number) =>
  apiClient.get<Attachment[]>(`/tickets/${ticketId}/attachments/`);

export const uploadAttachment = (ticketId: number, file: File, onProgress?: (pct: number) => void) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post<Attachment>(`/tickets/${ticketId}/attachments/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
  });
};

export const deleteAttachment = (attachmentId: number) =>
  apiClient.delete(`/attachments/${attachmentId}/`);
```

**4. Integrate into ticket detail modal**

In `TicketDetailModal.tsx` (or equivalent ticket detail view), add the `AttachmentUploader` component in Column 1, below the ticket description and service item fields. Pass `ticketId`, `existingAttachments`, and an `onUploadComplete` callback that re-fetches the ticket.
