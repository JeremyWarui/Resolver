import { useQuery, gql } from '@apollo/client';

// Define the query
const GET_TICKETS = gql`
  query GetTickets(
    $page: Int
    $pageSize: Int
    $status: String
    $section: String
    $technician: String
    $user: String
    $sortField: String
    $sortDirection: String
  ) {
    tickets(
      page: $page
      pageSize: $pageSize
      status: $status
      section: $section
      technician: $technician
      user: $user
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      tickets {
        id
        ticket_no
        title
        description
        section
        facility
        priority
        status
        createdAt
        updatedAt
        assignedTo
        raisedBy
        sectionName
      }
      totalTickets
      sections {
        id
        name
      }
    }
  }
`;

// Define interface for ticket data
interface Ticket {
  id: string;
  ticket_no: string;
  title: string;
  description?: string;
  section: string;
  facility: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: string;
  raisedBy?: string;
  sectionName?: string;
}

interface Section {
  id: string;
  name: string;
}

interface TicketsQueryResult {
  tickets: {
    tickets: Ticket[];
    totalTickets: number;
    sections: Section[];
  };
}

interface UseGraphQLTicketsParams {
  page?: number;
  pageSize?: number;
  status?: string | null;
  section?: string | null;
  technician?: string | null;
  user?: string | null;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Hook to fetch tickets using GraphQL
export const useGraphQLTickets = (params: UseGraphQLTicketsParams = {}) => {
  const {
    page = 0,
    pageSize = 10,
    status = null,
    section = null,
    technician = null,
    user = null,
    sortField,
    sortDirection
  } = params;

  const { loading, error, data } = useQuery<TicketsQueryResult>(GET_TICKETS, {
    variables: {
      page,
      pageSize,
      status: status === 'all' ? null : status,
      section: section === 'all' ? null : section,
      technician: technician === 'all' ? null : technician,
      user: user === 'all' ? null : user,
      sortField,
      sortDirection
    },
    fetchPolicy: 'network-only' // Don't cache during development
  });

  return {
    loading,
    error,
    tickets: data?.tickets.tickets || [],
    totalTickets: data?.tickets.totalTickets || 0,
    sections: data?.tickets.sections || []
  };
};

export default useGraphQLTickets;