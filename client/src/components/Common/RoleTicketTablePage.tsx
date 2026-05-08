import { useMemo, useState } from 'react';
import { ListTodo, FolderOpen, Wrench, CheckCircle } from 'lucide-react';
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/Common/DataTable/DataTable';
import { AdminTableHeader } from '@/components/Common/DataTable/utils/TableHeaders';
import { TicketDetailModal } from '@/components/shared/TicketDetailModal';
import QuickFilterPills from './QuickFilterPills';
import type { ReactNode } from 'react';

const QUICK_FILTERS = [
  { id: 'all',         label: 'All Tickets', icon: ListTodo,    colorClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { id: 'open',        label: 'Open',        icon: FolderOpen,  colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { id: 'in_progress', label: 'In Progress', icon: Wrench,      colorClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { id: 'resolved',    label: 'Resolved',    icon: CheckCircle, colorClass: 'bg-green-100 text-green-700 hover:bg-green-200' },
] as const;

interface RoleTicketTablePageProps {
  role: 'hod' | 'head_of_section';
  userId?: number;
  /** Page header row — title, subtitle, action buttons */
  header: ReactNode;
  /** Stats cards row scoped to the role */
  statsRow: ReactNode;
}

const RoleTicketTablePage = ({ role, userId, header, statsRow }: RoleTicketTablePageProps) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const table = useTicketTable({
    role,
    currentUserId: userId,
    defaultPageSize: 20,
    ordering: '-updated_at',
  });

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    table.setStatusFilter(filter);
    table.setPageIndex(0);
  };

  const columns = useMemo(
    () =>
      createTicketTableColumns({
        role,
        allStatuses: table.allStatuses,
        setSelectedTicket: table.setSelectedTicket,
        setIsTicketDialogOpen: table.setIsTicketDialogOpen,
      }),
    [role, table.allStatuses, table.setSelectedTicket, table.setIsTicketDialogOpen],
  );

  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: true,
    includeTechnician: false,
    includeUser: false,
  });

  const columnVisibility = createTicketColumnVisibility({ role });

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {header}
      {statsRow}

      <QuickFilterPills
        filters={QUICK_FILTERS}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      <DataTable
        variant="admin"
        columns={columns}
        data={table.tableData}
        title=""
        subtitle={`${table.totalTickets} ticket${table.totalTickets !== 1 ? 's' : ''}`}
        {...table.commonTableProps}
        defaultPageSize={20}
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        selectedRowId={table.selectedTicket?.id || null}
        manualPagination={true}
        renderHeader={AdminTableHeader}
      />

      <TicketDetailModal
        ticketId={table.selectedTicket?.id ?? null}
        isOpen={table.isTicketDialogOpen}
        onOpenChange={table.setIsTicketDialogOpen}
        onTicketUpdate={table.refetch}
      />
    </div>
  );
};

export default RoleTicketTablePage;
