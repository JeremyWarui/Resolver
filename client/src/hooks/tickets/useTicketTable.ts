import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import useTickets from './useTickets';
import { useUsers } from '../users';
import useUpdateTicket from './useUpdateTicket';
import { useSharedData } from '@/contexts/SharedDataContext';
import { extractWritableFields } from '@/utils/ticketHelpers';
import type { Ticket, Section, Facility, Technician, User, TicketsParams } from '@/types';

/**
 * Configuration options for the ticket table hook
 */
export interface UseTicketTableConfig {
  /**
   * Role-based filtering
   * - 'admin': Show all tickets with full filtering
   * - 'user': Show only tickets raised by current user
   * - 'technician': Show only tickets assigned to current technician
   */
  role: 'admin' | 'user' | 'technician';
  
  /**
   * Current user ID for role-based filtering
   */
  currentUserId?: number;
  
  /**
   * Default status filter value
   */
  defaultStatusFilter?: string;
  
  /**
   * Default page size for pagination
   */
  defaultPageSize?: number;
  
  /**
   * Whether to fetch technicians data (for filters)
   */
  fetchTechnicians?: boolean;
  
  /**
   * Whether to fetch users data (for raised_by filter)
   */
  fetchUsers?: boolean;
  
  /**
   * Whether to fetch facilities data
   */
  fetchFacilities?: boolean;
  
  /**
   * Custom ordering for tickets (e.g., '-created_at', 'ticket_no')
   */
  ordering?: string;
  
  /**
   * Page size for fetching technicians/users lists (default: 100)
   */
  listPageSize?: number;
}

/**
 * Return type for the ticket table hook
 */
export interface UseTicketTableResult {
  // Table State
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  
  // Filter State
  statusFilter: string;
  sectionFilter: number | null;
  technicianFilter: number | null;
  userFilter: number | null;
  unassignedFilter: boolean;
  overdueFilter: boolean;
  setStatusFilter: (status: string) => void;
  setSectionFilter: (section: number | null) => void;
  setTechnicianFilter: (technician: number | null) => void;
  setUserFilter: (user: number | null) => void;
  setUnassignedFilter: (unassigned: boolean) => void;
  setOverdueFilter: (overdue: boolean) => void;
  
  // Dialog State
  selectedTicket: Ticket | null;
  isTicketDialogOpen: boolean;
  setSelectedTicket: (ticket: Ticket | null) => void;
  setIsTicketDialogOpen: (open: boolean) => void;
  
  // Data
  tickets: Ticket[];
  totalTickets: number;
  sections: Section[];
  facilities: Facility[];
  technicians: Technician[];
  users: User[];
  
  // Transformed Data
  tableData: Ticket[];
  
  // Loading States
  loading: boolean;
  ticketsLoading: boolean;
  techniciansLoading: boolean;
  usersLoading: boolean;
  facilitiesLoading: boolean;
  
  // Actions
  handleViewTicket: (ticket: Ticket) => void;
  handleTicketUpdate: (updatedTicket: Ticket) => Promise<void>;
  handlePageChange: (newPageIndex: number) => void;
  handlePageSizeChange: (newPageSize: number) => void;
  updateTicket: (ticket: Ticket) => Promise<Ticket>;
  refetch: () => void;
  
  // Constants
  allStatuses: string[];
  
  // Common DataTable Props
  commonTableProps: {
    searchPlaceholder: string;
    emptyStateMessage: string;
    emptyStateDescription: string;
    defaultSorting: { id: string; desc: boolean }[];
    manualPagination: boolean;
  };
}

/**
 * Custom hook to manage all ticket table state, data fetching, and actions.
 * Consolidates common patterns across Admin, User, and Technician ticket tables.
 * 
 * @param config - Configuration options for role-based behavior and features
 * @returns All state, data, and handlers needed for a ticket table component
 * 
 * @example
 * // Admin Dashboard - All Tickets
 * const table = useTicketTable({ 
 *   role: 'admin',
 *   fetchTechnicians: true,
 *   fetchUsers: true 
 * });
 * 
 * @example
 * // User Dashboard - My Tickets
 * const table = useTicketTable({ 
 *   role: 'user',
 *   currentUserId: userId,
 *   fetchTechnicians: true 
 * });
 * 
 * @example
 * // Technician Dashboard - Assigned Tickets
 * const table = useTicketTable({ 
 *   role: 'technician',
 *   currentUserId: technicianId,
 *   defaultStatusFilter: 'in_progress'
 * });
 */
export const useTicketTable = (config: UseTicketTableConfig): UseTicketTableResult => {
  const {
    role,
    currentUserId,
    defaultStatusFilter = 'all',
    defaultPageSize = 10,
    fetchTechnicians = false,
    fetchUsers = false,
    fetchFacilities = false,
    ordering = '-id',
    listPageSize = 100,
  } = config;

  // ==================== STATE ====================
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatusFilter);
  const [sectionFilter, setSectionFilter] = useState<number | null>(null);
  const [technicianFilter, setTechnicianFilter] = useState<number | null>(null);
  const [userFilter, setUserFilter] = useState<number | null>(null);
  const [unassignedFilter, setUnassignedFilter] = useState<boolean>(false);
  const [overdueFilter, setOverdueFilter] = useState<boolean>(false);

  // Dialog state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

  // ==================== DATA FETCHING ====================
  // Build ticket query params based on role
  const ticketParams = useMemo(() => {
    const params: TicketsParams = {
      page: pageIndex + 1,
      page_size: pageSize,
      status: statusFilter === 'all' ? undefined : statusFilter,
      section: sectionFilter || undefined,
      ordering,
    };

    // Add unassigned filter (assigned_to__isnull=True in Django)
    if (unassignedFilter) {
      params.assigned_to__isnull = true;
    }

    // Add overdue filter
    if (overdueFilter) {
      params.is_overdue = true;
    }

    // Role-based filtering
    if (role === 'user') {
      params.raised_by = currentUserId;
      params.assigned_to = technicianFilter || undefined;
    } else if (role === 'technician') {
      params.assigned_to = currentUserId;
    } else if (role === 'admin') {
      params.assigned_to = technicianFilter || undefined;
      params.raised_by = userFilter || undefined;
    }

    return params;
  }, [
    role,
    currentUserId,
    pageIndex,
    pageSize,
    statusFilter,
    sectionFilter,
    technicianFilter,
    userFilter,
    unassignedFilter,
    overdueFilter,
    ordering,
  ]);

  // Fetch tickets
  const {
    tickets,
    totalTickets,
    loading: ticketsLoading,
    refetch,
  } = useTickets(ticketParams);

  // Get shared reference data from context (no API calls - already cached at layout level)
  const {
    sections, // Get sections from shared context instead of useTickets
    technicians: allTechniciansData,
    facilities: allFacilitiesData,
    users: allUsersData, // Get users from shared context instead of separate API call
    sectionsLoading,
    techniciansLoading: techniciansLoadingContext,
    facilitiesLoading: facilitiesLoadingContext,
    usersLoading: usersLoadingContext,
  } = useSharedData();

  // Only show loading state if data is actually needed
  const techniciansLoading = fetchTechnicians ? techniciansLoadingContext : false;
  const facilitiesLoading = fetchFacilities ? facilitiesLoadingContext : false;
  const usersLoading = fetchUsers ? usersLoadingContext : false;

  // Remove independent users fetching - now comes from SharedDataContext
  // const {
  //   users: allUsersData,
  //   loading: usersLoadingRaw,
  // } = useUsers(fetchUsers ? { page_size: listPageSize } : { page_size: 0 });
  // const usersLoading = fetchUsers ? usersLoadingRaw : false;

  // Update ticket hook
  const { updateTicket } = useUpdateTicket();

  // ==================== DATA TRANSFORMATION ====================
  // Add searchField, sectionName, and raisedByName to tickets
  const tableData = useMemo(() => {
    return tickets.map((ticket) => {
      // Find the user who raised the ticket to get their full name
      const raisedByUser = allUsersData.find((user) => user.username === ticket.raised_by);
      const raisedByName = raisedByUser 
        ? `${raisedByUser.first_name} ${raisedByUser.last_name}`
        : ticket.raised_by; // Fallback to username if user not found
      
      return {
        ...ticket,
        searchField: `${String(ticket.ticket_no).toLowerCase()} ${ticket.title.toLowerCase()}`,
        sectionName: ticket.section,
        raisedByName, // Add the full name for display
      };
    });
  }, [tickets, allUsersData]);

  // ==================== HANDLERS ====================
  /**
   * Open ticket details dialog
   */
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  /**
   * Update ticket and show success/error toast
   */
  const handleTicketUpdate = async (updatedTicket: Ticket) => {
    try {
      // Extract only writable fields from the ticket object
      // This prevents sending read-only fields (section, facility, raised_by, etc.) to the API
      const updatePayload = {
        id: updatedTicket.id,
        ...extractWritableFields(updatedTicket),
      };
      
      console.log('Updating ticket with payload:', updatePayload);
      
      // Update ticket via API and get the updated ticket back
      const result = await updateTicket(updatePayload);
      
      console.log('Ticket updated successfully:', result);
      
      toast.success(`Updated ticket #${result.ticket_no}`, {
        description: 'Ticket has been updated successfully',
      });
      
      // Refetch tickets to sync UI with backend
      refetch();
      
      setIsTicketDialogOpen(false);
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  /**
   * Handle page size change (resets to first page)
   */
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  // ==================== CONSTANTS ====================
  const allStatuses = ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'];
  
  const commonTableProps = {
    searchPlaceholder: 'Search by ID or title...',
    emptyStateMessage: 'No tickets found',
    emptyStateDescription: 'Try changing your filters or check back later',
    defaultSorting: [{ id: 'updated_at', desc: true }],
    manualPagination: true,
  };

  // ==================== LOADING STATE ====================
  const loading =
    ticketsLoading ||
    sectionsLoading || // Always include sections loading since sections are always used
    (fetchTechnicians && techniciansLoading) ||
    (fetchUsers && usersLoading) ||
    (fetchFacilities && facilitiesLoading);

  // ==================== RETURN ====================
  return {
    // State
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,

    // Filters
    statusFilter,
    sectionFilter,
    technicianFilter,
    userFilter,
    unassignedFilter,
    overdueFilter,
    setStatusFilter,
    setSectionFilter,
    setTechnicianFilter,
    setUserFilter,
    setUnassignedFilter,
    setOverdueFilter,

    // Dialog
    selectedTicket,
    isTicketDialogOpen,
    setSelectedTicket,
    setIsTicketDialogOpen,

    // Data
    tickets,
    totalTickets,
    sections,
    facilities: fetchFacilities ? allFacilitiesData : [],
    technicians: fetchTechnicians ? allTechniciansData : [],
    users: fetchUsers ? allUsersData : [],

    // Transformed Data
    tableData,

    // Loading
    loading,
    ticketsLoading,
    techniciansLoading,
    usersLoading,
    facilitiesLoading,

    // Actions
    handleViewTicket,
    handleTicketUpdate,
    handlePageChange,
    handlePageSizeChange,
    updateTicket,
    refetch,

    // Constants
    allStatuses,
    commonTableProps,
  };
};

export default useTicketTable;
