# Resolver Frontend Architecture

> **Last Updated:** February 5, 2026  
> **Version:** 1.0  
> **Tech Stack:** React + TypeScript + Vite + Tailwind CSS 4

## Table of Contents
- [Quick Start](#quick-start)
- [Authentication Flow](#authentication-flow)
- [Data Flow Architecture](#data-flow-architecture)
- [Directory Structure](#directory-structure)
- [Navigation Pattern](#navigation-pattern)
- [Essential Patterns](#essential-patterns)
- [Recent Architecture Changes](#recent-architecture-changes)

---

## Quick Start

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint check
```

**Environment Setup:**
```bash
# .env file
VITE_API_URL=http://localhost:8000/api
```

---

## Authentication Flow

### Complete Authentication Lifecycle

```
1. Login (AuthPage.tsx → LoginForm.tsx)
   ↓
   User enters username + password
   ↓
2. Auth Request (useAuth hook → authService)
   ↓
   POST /api/auth/login { username, password }
   ↓
3. Token Storage (localStorage)
   ↓
   Store: authToken, refreshToken, user object
   ↓
4. Role-Based Redirect
   ↓
   Admin → /dashboard (AdminLayout)
   Technician → /technician (TechnicianLayout)
   User → /user (UserLayout)
   ↓
5. Authenticated Requests (axios interceptors)
   ↓
   Auto-add: Authorization: Bearer <authToken>
   ↓
6. Token Expiry (401 response)
   ↓
   Clear localStorage → Redirect to /auth
```

### Key Authentication Components

- **AuthWrapper.tsx**: Validates auth on mount, redirects if no token
- **ProtectedRoute.tsx**: Guards dashboard routes, requires valid auth
- **useAuth hook**: Provides `login()`, `logout()`, `user` state, token management
- **useLogout hook**: Consolidated logout with loading state and user feedback
- **API Interceptors** (`src/api/interceptors.ts`): Auto-inject Bearer token, handle 401 errors

### User Roles & Permissions

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'technician' | 'user';
  is_active: boolean;
}

// Role determines dashboard access:
// - admin: Full system access (tickets, users, technicians, sections, facilities, reports)
// - technician: Assigned tickets, performance reports, profile
// - user: Create tickets, view own tickets, submit new requests
```

### Authentication State

- Stored in `useAuth` context (accessible via `const { user, isAuthenticated, login, logout } = useAuth()`)
- Persisted in localStorage for page refresh resilience
- Cleared on 401 errors or manual logout

---

## Data Flow Architecture

### Unidirectional Data Flow

```
UI Component
    ↓ (user action)
Custom Hook (useTickets, useCreateTicket, etc.)
    ↓ (API call)
Service Layer (ticketsService, usersService, etc.)
    ↓ (HTTP request)
API Client (axios with interceptors)
    ↓
Django REST API Backend
    ↓ (JSON response)
API Client
    ↓ (parsed data)
Service Layer
    ↓ (typed data)
Custom Hook (state update)
    ↓ (re-render)
UI Component (displays new data)
```

### Data Flow Patterns

#### 1. Read Operations (GET)

```tsx
// Component
const { tickets, loading, error } = useTickets({ status: 'open' });

// Hook (useTickets.ts)
const fetchTickets = async () => {
  const data = await ticketsService.getTickets(params);
  setTickets(data.results);
};

// Service (ticketsService.ts)
getTickets: (params) => apiClient.get('/tickets/', { params })

// API Client (client.ts)
axios.get(url) with Authorization header
```

#### 2. Write Operations (POST/PATCH/DELETE)

```tsx
// Component
const { createTicket, loading } = useCreateTicket();
await createTicket(ticketData);
toast.success('Ticket created!'); // Component handles feedback

// Hook (useCreateTicket.ts)
const createTicket = async (data) => {
  const ticket = await ticketsService.createTicket(data);
  return ticket; // No toast in hook
};

// Service (ticketsService.ts)
createTicket: (data) => apiClient.post('/tickets/', data)
```

### Shared Data Context

- `SharedDataContext` provides sections, facilities, technicians to AdminDashboard
- Fetched once on mount, shared across all admin pages
- Reduces duplicate API calls for reference data

### Client-Side Filtering

- QuickFilter buttons filter locally (no API calls)
- DataTable pagination/sorting can be client-side or server-side
- Admin dashboard fetches all tickets (page_size: 1000), filters client-side for instant UX

---

## Directory Structure

### `src/components/` - UI Components

#### `AdminDashboard/` - Admin-specific views

- **AdminLayout.tsx**: Main layout with sidebar navigation, section state management
- **Dashboard/**: Overview stats, recent tickets, system metrics
- **TicketsPage/**: Ticket management (all tickets, Quick Filters, DataTable)
- **Technicians/**: Technician CRUD, performance tracking
- **Sections/**: Section/category management
- **Facilities/**: Facility management
- **Reports/**: Analytics dashboard (ReportsPageEnhanced, ticket metrics, technician performance, exports)

**Contributions:**
- Full system administration
- User/technician management
- Ticket assignment and oversight
- Performance analytics and reporting
- System configuration

#### `UserDashboard/` - End-user views

- **UserLayout.tsx**: Layout with user sidebar, section state for 'dashboard', 'userTickets', 'submitTicket', 'settings'
- **UserDashboard.tsx**: Welcome screen, ticket stats, recent tickets overview
- **UserTickets.tsx**: User's own tickets (filtered by raised_by)
- **PostedTicketsTable.tsx**: Reusable table for user ticket views
- **CreateTicket.tsx**: Ticket creation dialog (react-hook-form + zod validation)
- **UserTicketDetailsSidebar.tsx**: View ticket details, add comments
- **Profile.tsx**: User profile settings
- **UserSideBar.tsx**: Navigation sidebar (Dashboard, My Tickets, New Ticket, Settings)

**Contributions:**
- Ticket submission and tracking
- View own ticket status and history
- Add comments to tickets
- Profile management

#### `TechnicianDashboard/` - Technician-specific views

- **TechnicianLayout.tsx**: Layout with tech sidebar, section state for 'dashboard', 'assignedTickets', 'report', 'settings'
- **TechTicketsPage.tsx**: All assigned tickets with Quick Filters (assigned, in_progress, pending, resolved)
- **TechnicianStatsCards.tsx**: Workload stats (assigned, in progress, pending, resolved counts)
- **QuickFilterButtons.tsx**: Instant client-side status filtering
- **TechReport.tsx**: Technician performance reports
- **Profile.tsx**: Technician profile settings
- **TechSideBar.tsx**: Navigation sidebar (Dashboard, My Tickets, Reports, Settings)

**Contributions:**
- Ticket resolution workflow
- Status updates (assigned → in_progress → pending/resolved)
- Workload management
- Performance tracking

**Pattern:** Single page with client-side Quick Filters (no separate pages per status)

#### `Common/` - Shared components across all dashboards

- **Header.tsx**: Top bar with search, notifications, user profile dropdown, logout
- **Sidebar.tsx**: Admin sidebar navigation
- **DataTable/**: Complete table infrastructure (DataTable.tsx, column configs, filters, pagination)
- **StatCard.tsx**: Reusable metric display cards
- **StatsCards.tsx**: Grid of stat cards
- **StatusSelect.tsx**: Ticket status dropdown
- **TechnicianSelect.tsx**: Technician assignment dropdown
- **FullScreenLoading.tsx**: Full-screen loading spinner overlay (login/logout)
- **NavButton.tsx**: Sidebar navigation button component

**Contributions:**
- Consistent UI patterns across dashboards
- Reusable table system (eliminates code duplication)
- Shared navigation and header components
- Loading states and user feedback

#### `Auth/` - Authentication flows

- **AuthPage.tsx**: Main auth page with login/register tabs
- **LoginForm.tsx**: Login form (username + password, zod validation)
- **RegisterForm.tsx**: User registration form
- **AuthWrapper.tsx**: Auth guard, validates token on mount
- **ProtectedRoute.tsx**: Route-level auth protection
- **MagicLinkHandler.tsx**: Magic link authentication (if implemented)

**Contributions:**
- User authentication (login/register)
- Token validation and storage
- Protected route access control

#### `ui/` - shadcn/ui primitives

- **button.tsx, card.tsx, dialog.tsx, form.tsx, input.tsx, select.tsx**, etc.
- Pre-styled, accessible components from shadcn/ui
- Consistent design system with Tailwind CSS

### `src/hooks/` - Custom React Hooks

#### Domain Hooks (grouped by entity)

- **`tickets/`**: useTickets, useCreateTicket, useUpdateTicket, useDeleteTicket, useTicketComments, useTicketTable
- **`users/`**: useUsers, useUserData, useCreateUser, useUpdateUser
- **`technicians/`**: useTechnicians, useTechnicianStats
- **`sections/`**: useSections, useCreateSection, useUpdateSection
- **`facilities/`**: useFacilities, useCreateFacility, useUpdateFacility
- **`analytics/`**: useTicketAnalytics, useTechnicianAnalytics, useAdminAnalytics, useStats

#### Core Hooks

- **useAuth.ts**: Authentication state, login/logout functions
- **useLogout.ts**: Logout with loading state (500ms delay, toast feedback)

**Contributions:**
- Encapsulate API calls and loading/error states
- Provide typed data to components
- Centralize business logic
- Enable data reusability across components

**Pattern:**
```typescript
// Data fetching hook
export const useTickets = (params?: TicketsParams) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchTickets();
  }, [params]);
  
  return { tickets, loading, error, refetch: fetchTickets };
};

// Mutation hook
export const useCreateTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createTicket = async (data: CreateTicketPayload) => {
    setLoading(true);
    const ticket = await ticketsService.createTicket(data);
    setLoading(false);
    return ticket; // Component handles toast
  };
  
  return { createTicket, loading, error };
};
```

### `src/api/` - API Integration Layer

#### `services/` - Backend endpoint wrappers

- **ticketsService.ts**: CRUD operations for tickets, comments, filters
- **usersService.ts**: User management endpoints
- **techniciansService.ts**: Technician data and stats
- **sectionsService.ts**: Section/category management
- **facilitiesService.ts**: Facility management
- **analyticsService.ts**: Analytics and reporting data
- **reportsService.ts**: Report generation and exports
- **authService.ts**: Login, logout, token refresh

**Pattern:**
```typescript
const ticketsService = {
  getTickets: (params?: TicketsParams) => 
    apiClient.get<TicketsResponse>('/tickets/', { params }),
  
  createTicket: (data: CreateTicketPayload) => 
    apiClient.post<Ticket>('/tickets/', data),
  
  updateTicket: (id: number, data: UpdateTicketPayload) => 
    apiClient.patch<Ticket>(`/tickets/${id}/`, data),
  
  deleteTicket: (id: number) => 
    apiClient.delete(`/tickets/${id}/`),
};
```

#### Core Files

- **client.ts**: Axios instance with base configuration
- **config.ts**: API URL and global settings (from VITE_API_URL env var)
- **interceptors.ts**: Request/response interceptors (auto-inject Bearer token, handle 401 errors)

**Contributions:**
- Type-safe API calls
- Centralized error handling
- Automatic authentication header injection
- Request/response transformation

### `src/types/` - TypeScript Type Definitions

- **ticket.types.ts**: Ticket, CreateTicketPayload, UpdateTicketPayload, TicketsResponse, Comment
- **user.types.ts**: User, UserRole, CreateUserPayload, UpdateUserPayload
- **technician.types.ts**: Technician, TechnicianStats
- **section.types.ts**: Section, CreateSectionPayload
- **facility.types.ts**: Facility, CreateFacilityPayload
- **analytics.types.ts**: TicketAnalytics, TechnicianAnalytics, AdminStats

**Contributions:**
- Match Django REST serializers exactly
- Type safety across the app
- IntelliSense and autocomplete
- Compile-time error detection

**Critical Pattern - Read/Write Fields:**
```typescript
interface Ticket {
  // Write-only (POST/PATCH)
  section_id?: number;
  assigned_to_id?: number;
  facility_id?: number;
  
  // Read-only (GET)
  section: string;               // section name
  assigned_to_name?: string | null;  // "FirstName LastName" (optimized)
  facility: string;              // facility name
  raised_by: string;             // username
  
  // Both
  id: number;
  title: string;
  status: TicketStatus;
  // ... other fields
}
```

### `src/contexts/` - React Context Providers

- **SharedDataContext.tsx**: Provides sections, facilities, technicians to AdminDashboard
  - Fetched once on mount
  - Shared across all admin pages
  - Eliminates duplicate API calls for reference data

**Usage:**
```tsx
// AdminLayout.tsx
<SharedDataProvider>
  <AdminLayoutContent />
</SharedDataProvider>

// Any admin component
const { sections, facilities, technicians, loading } = useSharedData();
```

### `src/utils/` - Utility Functions

- **cn.ts**: Class name utility (clsx + tailwind-merge)
- **date.ts**: Date formatting and parsing utilities
- **ticketHelpers.ts**: Ticket-related helpers (extractWritableFields, status badges, overdue detection)
- **ticketValidation.ts**: Ticket validation logic
- **entityValidation.ts**: General entity validation

**Contributions:**
- Reusable helper functions
- Type-safe utilities
- Consistent formatting across app

### `src/constants/` - Application Constants

- **tickets.ts**: Ticket status options, priority levels, default filters

**Contributions:**
- Single source of truth for static data
- Type-safe constants
- Easy to update system-wide values

---

## Navigation Pattern

### Section-Based State (NOT React Router nested routes)

**CRITICAL:** App uses state-based section switching inside layouts, NOT React Router nested routes.

```tsx
// ✅ Correct: AdminLayout pattern (also in UserLayout, TechnicianLayout)
function AdminLayout() {
  const [activeSection, setActiveSection] = useState<Section["id"]>("dashboard");
  
  return (
    <div className="flex h-screen">
      <SideBar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col">
        <Header title={getSectionTitle(activeSection)} />
        <main className="flex-1 overflow-y-auto">
          {activeSection === "dashboard" && <MainContent />}
          {activeSection === "tickets" && <TicketsPage />}
          {activeSection === "reports" && <ReportsPage />}
          {/* ... other sections ... */}
        </main>
      </div>
    </div>
  );
}

// ❌ Wrong: Don't use <Routes>/<Route> inside layout components
// React Router is only used for top-level role selection (/dashboard, /user, /technician)
```

**When adding new pages:** Add to the section state conditional rendering, NOT as routes.

---

## Essential Patterns

### 1. Path Aliases (Always Use @/)

```typescript
// ✅ Correct
import { useTickets } from '@/hooks/tickets';
import type { Ticket } from '@/types';

// ❌ Wrong
import { useTickets } from '../../hooks/tickets';
```

### 2. DataTable System (Never Recreate Tables)

```tsx
// ✅ Use existing DataTable infrastructure
import { DataTable } from '@/components/Common/DataTable/DataTable';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';

const columns = createTicketTableColumns({ role: 'admin', technicians, setSelectedTicket });
<DataTable columns={columns} data={tableData} filters={filterOptions} />

// ❌ Don't build custom tables with <Table>, <TableRow>, manual pagination
```

### 3. Forms (react-hook-form + zod + shadcn/ui)

```tsx
// ✅ Standard form pattern
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { title: '' },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="title" render={({ field }) => (
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>
```

### 4. Styling (Tailwind CSS 4 + shadcn/ui)

```tsx
// ✅ Use cn() for conditional classes
import { cn } from '@/utils/cn';
<div className={cn("base-class", isActive && "active-class")} />

// ✅ Dark mode with class variant
<Button className="bg-primary dark:bg-primary-dark" />

// Spacing standards (Reports pages)
<CardHeader className="pb-6 pt-6">  // Consistent padding
<CardContent className="px-6 pb-6">
```

### 5. API Types (Django Serializer Alignment)

```typescript
// ✅ Read/Write pattern for related fields
interface Ticket {
  section_id?: number;      // write-only (POST/PATCH)
  section: string;          // read-only (GET) - section name
  assigned_to_id?: number;  // write-only
  assigned_to: AssignedUser | null; // read-only - full user object (DEPRECATED)
  assigned_to_name?: string | null; // read-only - "FirstName LastName" (optimized - no extra query)
  raised_by: string; // read-only - username
}

// IMPORTANT: Backend Optimization (Nov 2025)
// - assigned_to now returns simple string "FirstName LastName" instead of full user object
// - This eliminates N+1 queries and improves performance by 66x (4.7s → 0.07s)
// - Backend added indexes on: status, updated_at, assigned_to, composite (status + updated_at)
// - Always use assigned_to_name first, fall back to assigned_to object for backward compatibility
```

### 6. Error Handling & User Feedback

```tsx
// ✅ Use toast for all user feedback
import { toast } from 'sonner';
toast.success('Ticket created successfully');
toast.error('Failed to update ticket');

// Ensure <Toaster /> in App.tsx (already present)
```

---

## Recent Architecture Changes

### User Authentication & Loading States (Feb 2026)

**Full-Screen Loading Pattern:**
All dashboards now use `FullScreenLoading` component for consistent loading UX:

**Component:**
```tsx
// src/components/Common/FullScreenLoading.tsx
<div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="flex flex-col items-center gap-4">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="text-lg font-medium text-gray-700">{message}</p>
  </div>
</div>
```

**Usage Locations:**

1. **Login Loading** - All dashboard layouts show spinner while fetching initial data:
   ```tsx
   // AdminLayout.tsx, UserLayout.tsx, TechnicianLayout.tsx
   const { userData, loading: userLoading } = useUserData();
   
   return (
     <>
       {userLoading && <FullScreenLoading message="Loading your dashboard..." />}
       {/* Dashboard content */}
     </>
   );
   ```

2. **Logout Loading** - Consolidated logout with visual feedback:
   ```tsx
   // useLogout hook returns loading state
   const { handleLogout, isLoading } = useLogout();
   
   // 500ms delay ensures spinner is visible before redirect
   const handleLogout = async () => {
     setIsLoading(true);
     await logout();
     toast.success('Logged out successfully');
     await new Promise(resolve => setTimeout(resolve, 500));
     window.location.href = '/auth';
   };
   ```

**Logout Hook Consolidation:**
- **useLogout.ts**: Custom hook eliminates 100+ lines of duplicate code
- Returns `{ handleLogout, isLoading }` for component use
- Used in 4 locations: AdminSidebar, UserSideBar, TechSideBar, Header
- All sidebars and header show FullScreenLoading during logout

**Benefits:**
- Consistent loading experience across all dashboards
- Visual feedback for async operations (login/logout)
- Consolidated logout logic reduces duplication
- Better UX with visible state transitions

### User Dashboard Cleanup (Feb 2026)

**Removed Components:**
- **PostedTickets.tsx**: Deprecated feature, not actively used
- **RegisterForm-old.tsx**: Old registration form, replaced by RegisterForm.tsx

**Updated Section Types:**
- Removed `'postedTickets'` from Section union type in UserSideBar and related components
- Simplified to: `'dashboard' | 'userTickets' | 'submitTicket' | 'settings'`

**Active User Dashboard Structure:**
```
UserDashboard/
├── UserLayout.tsx          # Main layout with section state
├── UserDashboard.tsx       # Welcome screen with stats
├── UserTickets.tsx         # User's own tickets (filtered by raised_by)
├── PostedTicketsTable.tsx  # Reusable table for ticket views
├── CreateTicket.tsx        # Ticket creation dialog
├── UserTicketDetailsSidebar.tsx  # View/comment on tickets
├── Profile.tsx             # User profile settings
└── UserSideBar.tsx         # Navigation sidebar
```

**Navigation Sections:**
- Dashboard: Overview with stats and recent tickets
- My Tickets: All tickets raised by current user
- New Ticket: Opens CreateTicket dialog (modal, not separate page)
- Settings: Profile management (coming soon)

### Ticket Queue Deprecation (Nov 2025)

The standalone Ticket Queue page has been **deprecated and removed** due to 90%+ functional overlap with the main Tickets page. All queue functionality is now integrated into the enhanced Tickets page:

**What was removed:**
- `/dashboard/queue` route
- `TicketQueuePage.tsx`, `OverdueTicketsTable.tsx`, `UnassignedTicketsTable.tsx`
- Separate navigation menu item

**New unified approach:**
1. **Quick Filter Buttons** (`QuickFilterButtons.tsx`): One-click filters for All, Open, Unassigned, Overdue, In Progress, Resolved
2. **Priority Stats Widget** (`PriorityStatsWidget.tsx`): Dashboard widget showing overdue/unassigned counts with click-to-filter
3. **Enhanced TicketDetails**: Admin dialog now includes technician assignment and status update in edit tab
4. **Client-side overdue detection**: Tickets older than 7 days in active states (open/assigned/in_progress) are flagged as overdue

### Technician Dashboard Pattern (Nov 2025)

Technicians use a **single-page with Quick Filters** pattern (not multiple status-based pages):

**Architecture:**
- Single `TechTicketsPage.tsx` with client-side filtering
- `QuickFilterButtons.tsx` for instant status switching (all, assigned, in_progress, pending, resolved)
- `TechnicianStatsCards.tsx` showing counts with click-to-filter
- Client-side filtering via `useMemo` = ZERO extra API calls

**Why single page:**
- Same DB query (`assigned_to={techId}`) regardless of status filter
- Client-side filtering is instant (no loading states)
- Reduces code duplication by ~750 lines
- Better UX - no page navigation required

### Performance Optimizations (Nov 2025)

**Backend Performance (66x Improvement):**
- Django added database indexes on `status`, `updated_at`, `assigned_to`, and composite `(status, updated_at)`
- List view serialization simplified: removed full `assigned_to` UserSerializer object
- New `assigned_to_name` field returns "FirstName LastName" string (no extra query)
- Result: 4.7s → 0.07s for ticket list requests

**Frontend Performance Strategy:**
- **Fetch ALL tickets once**: Use `page_size: 1000` to load complete dataset
- **Client-side filtering**: QuickFilter buttons use `useMemo` for instant filtering (no API calls)
- **Client-side pagination**: DataTable with `manualPagination={false}`
- **Single data source**: All counts and filters computed from same dataset

**Admin Dashboard Pattern:**
```tsx
// Fetch ALL tickets once (backend is 66x faster!)
const table = useTicketTable({
  role: 'admin',
  defaultPageSize: 1000, // Get complete dataset
  defaultStatusFilter: 'all', // No backend filtering
  ordering: '-updated_at',
});

// Instant client-side filtering (no API calls)
const filteredTickets = useMemo(() => {
  switch (activeQuickFilter) {
    case 'all': return table.tickets;
    case 'open': return table.tickets.filter(t => t.status === 'open');
    case 'unassigned': return table.tickets.filter(t => !t.assigned_to_name);
    // ... other filters
  }
}, [table.tickets, activeQuickFilter]);

// Client-side pagination of filtered results
<DataTable 
  data={filteredTableData}
  totalItems={filteredTickets.length}
  manualPagination={false}
/>
```

**Why This Works:**
- Backend indexes make fetching 1000 tickets fast (~0.07s)
- Client-side filtering is instant (pure JavaScript)
- No loading spinners when clicking QuickFilter buttons
- Users see complete picture of all tickets

---

## Related Documentation

- **API Reference**: See [`REST_API_REFERENCE.md`](./REST_API_REFERENCE.md)
- **Backend Alignment**: See [`BACKEND_ALIGNMENT_REPORT.md`](./BACKEND_ALIGNMENT_REPORT.md)
- **Reports System**: See [`REPORTS_PAGE_DESIGN.md`](./REPORTS_PAGE_DESIGN.md)
- **Deployment**: See [`README.deployment.md`](./README.deployment.md)
- **Coding Patterns**: See `.github/copilot-instructions.md` for detailed patterns

---

**For additional help or questions, refer to the main README.md or the comprehensive Copilot instructions.**
