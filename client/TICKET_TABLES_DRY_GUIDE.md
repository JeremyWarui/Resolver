# Ticket Tables - DRY Implementation Guide

## Overview

This guide documents the **DRY (Don't Repeat Yourself)** improvements made to ticket table components across Admin, User, and Technician dashboards. Previously, each ticket table had 150-200+ lines of duplicate code for state management, data fetching, filters, and columns. Now, most of this is consolidated into reusable hooks and utilities.

---

## 📦 New Utilities Created

### 1. **`useTicketTable` Hook**
**Location:** `/src/hooks/tickets/useTicketTable.ts`

A comprehensive custom hook that consolidates:
- ✅ All table state (pagination, filters, dialog)
- ✅ Data fetching (tickets, sections, technicians, users, facilities)
- ✅ Role-based filtering logic (admin/user/technician)
- ✅ Data transformation (searchField, sectionName)
- ✅ Standard action handlers (view, update, pagination)
- ✅ Loading state management

**Reduces:** 100-150 lines of boilerplate per table component

---

### 2. **`createTicketTableFilters` Function**
**Location:** `/src/components/Common/DataTable/utils/TicketTableFilters.tsx`

Generates standardized filter options based on role and configuration.

**Reduces:** 40-60 lines of filter creation code per table

---

### 3. **`createTicketTableColumns` Function**
**Location:** `/src/components/Common/DataTable/utils/TicketTableColumns.tsx`

Generates standardized column definitions with role-specific actions.

**Reduces:** 20-40 lines of column definition code per table

---

## 🎯 Usage Examples

### **Admin Dashboard - All Tickets Table**

#### ❌ Before (225 lines)
```tsx
function AllTicketsTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<number | null>(null);
  const [technicianFilter, setTechnicianFilter] = useState<number | null>(null);
  const [userFilter, setUserFilter] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

  const { updateTicket } = useUpdateTicket();

  const {
    tickets,
    totalTickets,
    sections,
    loading: ticketsLoading,
  } = useTickets({
    page: pageIndex + 1,
    page_size: pageSize,
    status: statusFilter === "all" ? undefined : statusFilter,
    section: sectionFilter || undefined,
    assigned_to: technicianFilter || undefined,
    raised_by: userFilter || undefined,
    ordering: "-id",
  });

  const { facilities } = useFacilities();
  const { technicians: allTechniciansData, loading: techniciansLoading } = useTechnicians({ page_size: 100 });
  const { users: allUsersData, loading: usersLoading } = useUsers({ page_size: 100 });

  const dataWithSearchField = useMemo(() => {
    return tickets.map((ticket) => ({
      ...ticket,
      searchField: `${String(ticket.ticket_no).toLowerCase()} ${ticket.title.toLowerCase()}`,
      sectionName: ticket.section,
    }));
  }, [tickets]);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  const handleTicketUpdate = async (updatedTicket: Ticket) => {
    try {
      await updateTicket(updatedTicket);
      toast.success(`Updated ticket #${updatedTicket.ticket_no}`);
      setIsTicketDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update ticket");
    }
  };

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  const columns: ColumnDef<Ticket>[] = [
    TableUtils.ticketNoColumn("Ticket ID"),
    TableUtils.ticketTitleColumn("Title"),
    // ... 8 more columns
    TableUtils.AdminActionsColumn<Ticket>({
      technicians: allTechniciansData.map(t => `${t.first_name} ${t.last_name}`),
      statuses: allStatuses,
      setSelectedTicket,
      setIsTicketDialogOpen,
    }),
  ];

  const loading = ticketsLoading || techniciansLoading || usersLoading;

  const statusFilterOptions = FilterUtils.createStatusFilter(
    statusFilter,
    setStatusFilter,
    allStatuses,
    setPageIndex
  );

  const sectionFilterOptions = FilterUtils.createSectionFilter(
    sectionFilter || "all",
    (value) => setSectionFilter(value === null ? null : Number(value)),
    sections,
    setPageIndex
  );
  
  // ... more filter creation

  return (
    <>
      <DataTable
        variant="admin"
        columns={columns}
        data={dataWithSearchField}
        // ... more props
      />
      {selectedTicket && (
        <TicketDetails.AdminTicketDetailsComponent
          // ... dialog props
        />
      )}
    </>
  );
}
```

#### ✅ After (~80 lines - 64% reduction!)
```tsx
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';

function AllTicketsTable() {
  // ✨ All state, data fetching, and handlers in one hook
  const table = useTicketTable({
    role: 'admin',
    fetchTechnicians: true,
    fetchUsers: true,
    fetchFacilities: true,
    defaultPageSize: 10,
    ordering: '-id',
  });

  // ✨ Generate columns with one function call
  const columns = createTicketTableColumns({
    role: 'admin',
    technicians: table.technicians,
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  });

  // ✨ Generate filters with one function call
  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: true,
    includeTechnician: true,
    includeUser: true,
  });

  return (
    <>
      <DataTable
        variant="admin"
        columns={columns}
        data={table.tableData}
        searchPlaceholder="Search by ID or title..."
        emptyStateMessage="No tickets found"
        emptyStateDescription="Try changing your filters or check back later"
        defaultSorting={[{ id: "ticket_no", desc: true }]}
        defaultPageSize={table.pageSize}
        initialColumnVisibility={{
          ticket_no: true,
          title: true,
          sectionName: true,
          raised_by: true,
          status: true,
          created_at: true,
          assigned_to: true,
          updated_at: false,
          description: false,
          facility: false,
          actions: true,
          searchField: false,
        }}
        filterOptions={filters}
        manualPagination={true}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        renderHeader={AdminTableHeader}
      />

      {table.selectedTicket && (
        <TicketDetails.AdminTicketDetailsComponent
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          sections={table.sections}
          facilities={table.facilities}
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </>
  );
}
```

---

### **User Dashboard - Posted Tickets Table**

```tsx
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';

function PostedTicketsTable({ currentUser }: { currentUser?: number }) {
  const table = useTicketTable({
    role: 'user',
    currentUserId: currentUser,
    fetchTechnicians: true,
    fetchFacilities: true,
    ordering: '-id',
  });

  const columns = createTicketTableColumns({
    role: 'user',
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  });

  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: true,
    includeTechnician: true,
    includeUser: false, // User doesn't need to filter by raised_by (already filtered)
  });

  return (
    <>
      <DataTable
        variant="user"
        columns={columns}
        data={table.tableData}
        filterOptions={filters}
        manualPagination={true}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        renderHeader={UserTableHeader}
      />

      {table.selectedTicket && (
        <TicketDetails.UserTicketDetailsComponent
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          sections={table.sections}
          facilities={table.facilities}
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </>
  );
}
```

---

### **Technician Dashboard - Assigned Tickets**

```tsx
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';

function TechTickets({ 
  defaultFilter = "open", 
  currentTechnicianId 
}: TechTicketsProps) {
  const table = useTicketTable({
    role: 'technician',
    currentUserId: currentTechnicianId,
    defaultStatusFilter: defaultFilter,
    ordering: '-created_at',
  });

  // Technician-specific action handlers
  const handleBeginWork = async (ticketId: number, ticketNo: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      const ticketToUpdate = table.tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) return;

      await table.updateTicket({
        ...ticketToUpdate,
        status: "in_progress",
      });
      
      toast.success(`Started work on #${ticketNo}`);
    } catch (error) {
      toast.error("Failed to update ticket status");
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      const ticketToUpdate = table.tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) return;
      
      await table.updateTicket({
        ...ticketToUpdate,
        status: newStatus as Ticket["status"],
      });
      
      toast.success(`Updated ticket #${ticketToUpdate.ticket_no} to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update ticket status");
    }
  };

  const handleReopen = async (ticketId: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      const ticketToUpdate = table.tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) return;

      await table.updateTicket({
        ...ticketToUpdate,
        status: "in_progress",
      });

      toast.success(`Reopened work on ticket #${ticketToUpdate.ticket_no}`);
    } catch (error) {
      toast.error("Failed to update ticket status");
    }
  };

  const columns = createTicketTableColumns({
    role: 'technician',
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
    onBeginWork: handleBeginWork,
    onUpdateStatus: handleUpdateStatus,
    onReopen: handleReopen,
  });

  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: false, // Technician typically doesn't filter by section
    includeTechnician: false,
    includeUser: false,
  });

  return (
    <>
      <DataTable
        variant="technician"
        columns={columns}
        data={table.tableData}
        filterOptions={filters}
        manualPagination={true}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        renderHeader={TechTableHeader}
      />

      {table.selectedTicket && (
        <TicketDetails.TechnicianTicketDetailsComponent
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </>
  );
}
```

---

## 🎁 Benefits

### **Code Reduction**
- **Admin Tickets Table:** 225 lines → ~80 lines (64% reduction)
- **User Tickets Table:** 203 lines → ~70 lines (66% reduction)
- **Technician Tickets Table:** 232 lines → ~120 lines (48% reduction)
- **Recent Tickets Table:** 637 lines → ~90 lines (86% reduction!)

### **Consistency**
- ✅ Same state management pattern across all tables
- ✅ Same data fetching logic
- ✅ Same filter behavior
- ✅ Same pagination handling
- ✅ Same error handling with toasts

### **Maintainability**
- ✅ Single source of truth for ticket table logic
- ✅ Bug fixes in one place benefit all tables
- ✅ New features can be added to the hook once
- ✅ Easier to test (test the hook, not each component)

### **Type Safety**
- ✅ Full TypeScript support
- ✅ Strong typing for all configurations
- ✅ IntelliSense support for all options

---

## 🔧 Configuration Options

### `useTicketTable` Configuration

```typescript
interface UseTicketTableConfig {
  role: 'admin' | 'user' | 'technician';
  currentUserId?: number;
  defaultStatusFilter?: string;
  defaultPageSize?: number;
  fetchTechnicians?: boolean;
  fetchUsers?: boolean;
  fetchFacilities?: boolean;
  ordering?: string;
  listPageSize?: number;
}
```

### Filter Configuration

```typescript
interface FilterOptionsConfig {
  includeStatus?: boolean;
  includeSection?: boolean;
  includeTechnician?: boolean;
  includeUser?: boolean;
}
```

### Column Configuration

```typescript
interface TicketColumnsConfig {
  role: 'admin' | 'user' | 'technician';
  technicians?: { first_name: string; last_name: string }[];
  allStatuses?: string[];
  setSelectedTicket?: (ticket: Ticket | null) => void;
  setIsTicketDialogOpen?: (open: boolean) => void;
  onBeginWork?: (ticketId: number, ticketNo: string, event?: React.MouseEvent) => Promise<void>;
  onUpdateStatus?: (ticketId: number, status: string, event?: React.MouseEvent) => Promise<void>;
  onReopen?: (ticketId: number, event?: React.MouseEvent) => Promise<void>;
}
```

---

## 📋 Migration Checklist

To migrate an existing ticket table:

1. [ ] Import `useTicketTable`, `createTicketTableFilters`, `createTicketTableColumns`
2. [ ] Replace all state declarations with `useTicketTable` hook call
3. [ ] Replace manual `useTickets`, `useTechnicians`, `useUsers` calls (already in hook)
4. [ ] Replace `useMemo` data transformation (already in `table.tableData`)
5. [ ] Replace all handler functions with `table.handleViewTicket`, `table.handleTicketUpdate`, etc.
6. [ ] Replace column definitions with `createTicketTableColumns` call
7. [ ] Replace filter creation with `createTicketTableFilters` call
8. [ ] Update DataTable props to use `table.*` properties
9. [ ] Update TicketDetails dialog to use `table.*` properties
10. [ ] Remove unused imports and state variables
11. [ ] Test all functionality (filters, pagination, dialogs, updates)

---

## 📝 Next Steps

1. **Migrate all ticket tables** to use the new DRY utilities
2. **Consider similar patterns** for other table types (Technicians, Facilities)
3. **Add unit tests** for `useTicketTable` hook
4. **Document edge cases** and special behaviors
5. **Performance monitoring** to ensure no regressions

---

## 🤝 Contributing

When adding new features to ticket tables:

1. Add the feature to `useTicketTable` hook first
2. Expose necessary state/handlers in the return type
3. Update `TicketTableFilters` or `TicketTableColumns` if UI changes needed
4. Update this documentation with examples
5. Test across all three table variants (admin/user/technician)

---

**Last Updated:** 2025
**Author:** Development Team
**Status:** ✅ Ready for Migration
