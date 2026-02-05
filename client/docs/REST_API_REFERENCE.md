# REST API Quick Reference
**Updated:** February 3, 2026

## API Base URL
```typescript
http://localhost:8000/api
```

## ✨ Recent Optimizations

### **Enhanced Pagination**
- ✅ Backend supports up to 500 items per request  
- ✅ Flexible page sizes: `?page_size=25,50,100,500`
- ✅ Role-optimized defaults for different use cases

### **Performance Improvements**
- ✅ SharedDataContext eliminates duplicate API calls
- ✅ ~65% fewer reference data requests
- ✅ Client-side pagination for better UX

---

## Available Hooks

### 📋 Tickets
```typescript
import { useTickets, useCreateTicket, useUpdateTicket } from '@/hooks/tickets';

// Fetch tickets with flexible pagination
const { tickets, totalTickets, loading, error, refetch } = useTickets({
  page: 1,
  page_size: 500, // NEW: Up to 500 for admin dashboards
  status: 'open',
  section: 5,
  assigned_to: 2,
  ordering: '-updated_at',
  search: 'keyword'
});

// Optimized table hook (recommended for admin views)
import { useTicketTable } from '@/hooks/tickets';
const table = useTicketTable({
  role: 'admin',
  defaultPageSize: 500, // Fetch large dataset for client-side filtering
  ordering: '-updated_at',
});

// Create ticket
const { createTicket, loading, error } = useCreateTicket();
await createTicket({
  title: 'Fix AC',
  description: 'AC not working',
  section_id: 1,
  facility_id: 2,
  location_detail: 'Room 101',
  priority: 'high'
});

// Update ticket
const { updateTicket, loading, error } = useUpdateTicket();
await updateTicket({
  id: 5,
  status: 'resolved',
  assigned_to: 3
});
```

### 👷 Technicians
```typescript
import useTechnicians from '@/hooks/useTechnicians';

const { technicians, totalTechnicians, loading, error, refetch } = useTechnicians({
  page: 1,
  page_size: 10,
  availability: 'available',
  section: 2,
  ordering: 'name',
  search: 'john'
});
```

### 🏢 Facilities
```typescript
import useFacilities from '@/hooks/useFacilities';

const { facilities, loading, error, refetch } = useFacilities();
```

### 📊 Analytics/Stats
```typescript
import useStats from '@/hooks/useStats';

// All stats
const { ticketStats, technicianStats, loading, error, refetch } = useStats({
  user: 1, // optional: filter by user
  fetchTicketStats: true,
  fetchTechnicianStats: true
});

// Ticket stats only
const { ticketStats, loading } = useStats({
  fetchTicketStats: true,
  fetchTechnicianStats: false
});

// Returns:
// ticketStats: { open_tickets, assigned_tickets, resolved_tickets, pending_tickets }
// technicianStats: { available, busy, off_duty, total }
```

### 👤 User Data
```typescript
import useUserData from '@/hooks/useUserData';

const { userData, loading, error, refetch } = useUserData();
// Returns: { id, name, email, role, department }
```

## Direct Service Calls

```typescript
import { ticketsService, techniciansService, facilitiesService, 
         sectionsService, usersService, analyticsService } from '@/api/services';

// Tickets
await ticketsService.getTickets({ page: 1, status: 'open' });
await ticketsService.getTicketById(5);
await ticketsService.createTicket({ title, description, ... });
await ticketsService.updateTicket(5, { status: 'resolved' });
await ticketsService.deleteTicket(5);
await ticketsService.getTicketComments(5);
await ticketsService.addTicketComment(5, 'Great work!');

// Technicians
await techniciansService.getTechnicians({ availability: 'available' });
await techniciansService.getTechnicianById(2);

// Facilities
await facilitiesService.getFacilities();
await facilitiesService.createFacility({ name: 'Building A' });

// Sections
await sectionsService.getSections();

// Users
await usersService.getUsers();
await usersService.getCurrentUser();

// Analytics
await analyticsService.getTicketAnalytics({ user: 1 });
await analyticsService.getTechnicianAnalytics();
await analyticsService.getAdminDashboardAnalytics();
```

## API Response Format

All list endpoints return Django REST Framework pagination:
```typescript
{
  count: 25,                    // Total items
  next: "http://...?page=2",   // Next page URL
  previous: null,               // Previous page URL
  results: [...]                // Array of items
}
```

## Common Patterns

### Pagination
```typescript
const [page, setPage] = useState(1);
const { tickets, totalTickets } = useTickets({ page, page_size: 10 });

// Total pages
const totalPages = Math.ceil(totalTickets / 10);
```

### Filtering
```typescript
const [statusFilter, setStatusFilter] = useState('open');
const { tickets } = useTickets({ status: statusFilter });
```

### Sorting
```typescript
// Ascending
const { tickets } = useTickets({ ordering: 'title' });

// Descending (prefix with -)
const { tickets } = useTickets({ ordering: '-created_at' });
```

### Refetching
```typescript
const { tickets, refetch } = useTickets();

// After creating/updating
await createTicket(...);
refetch(); // Reload the list
```

## Error Handling

All hooks include error states:
```typescript
const { tickets, loading, error } = useTickets();

if (loading) return <Spinner />;
if (error) return <Error message={error.message} />;
return <TicketsList tickets={tickets} />;
```

## Authentication

The API client automatically adds auth tokens from localStorage:
```typescript
// Login
localStorage.setItem('authToken', token);

// Logout
localStorage.removeItem('authToken');
```

## TypeScript Types

All services and hooks are fully typed. Import types from services:
```typescript
import type { Ticket, CreateTicketPayload } from '@/api/services/ticketsService';
import type { Technician } from '@/api/services/techniciansService';
import type { TicketAnalytics } from '@/api/services/analyticsService';
```
