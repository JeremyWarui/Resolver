import { useQuery, gql } from '@apollo/client';

// Define the queries - separate queries for better optimization
const GET_ALL_STATS = gql`
  query GetAllStats($user: String) {
    ticketStats(user: $user) {
      openTickets
      assignedTickets
      resolvedTickets
      pendingTickets
    }
    technicianStats {
      available
      busy
      offDuty
      total
    }
  }
`;

const GET_TICKET_STATS_ONLY = gql`
  query GetTicketStatsOnly($user: String) {
    ticketStats(user: $user) {
      openTickets
      assignedTickets
      resolvedTickets
      pendingTickets
    }
  }
`;

const GET_TECHNICIAN_STATS_ONLY = gql`
  query GetTechnicianStatsOnly {
    technicianStats {
      available
      busy
      offDuty
      total
    }
  }
`;

// Define interfaces for stats data
interface TicketStats {
  openTickets: number;
  assignedTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
}

interface TechnicianStats {
  available: number;
  busy: number;
  offDuty: number;
  total: number;
}

interface StatsQueryResult {
  ticketStats: TicketStats;
  technicianStats: TechnicianStats;
}

interface TicketStatsQueryResult {
  ticketStats: TicketStats;
}

interface TechnicianStatsQueryResult {
  technicianStats: TechnicianStats;
}

interface UseGraphQLStatsParams {
  user?: string | null;
  fetchTicketStats?: boolean;
  fetchTechnicianStats?: boolean;
}

// Default empty stats objects
const emptyTicketStats: TicketStats = {
  openTickets: 0,
  assignedTickets: 0,
  resolvedTickets: 0,
  pendingTickets: 0
};

const emptyTechnicianStats: TechnicianStats = {
  available: 0,
  busy: 0,
  offDuty: 0,
  total: 0
};

// Hook to fetch dashboard statistics using GraphQL
export const useGraphQLStats = (params: UseGraphQLStatsParams = {}) => {
  const { 
    user = null, 
    fetchTicketStats = true, 
    fetchTechnicianStats = true 
  } = params;

  // Determine which query to use based on what data we need
  let query;
  let queryResultType:
    | 'all'
    | 'ticketOnly'
    | 'technicianOnly'
    | 'none' = 'none';

  if (fetchTicketStats && fetchTechnicianStats) {
    query = GET_ALL_STATS;
    queryResultType = 'all';
  } else if (fetchTicketStats) {
    query = GET_TICKET_STATS_ONLY;
    queryResultType = 'ticketOnly';
  } else if (fetchTechnicianStats) {
    query = GET_TECHNICIAN_STATS_ONLY;
    queryResultType = 'technicianOnly';
  } else {
    // If nothing requested, return empty data without making a query
    return {
      loading: false,
      error: null,
      ticketStats: emptyTicketStats,
      technicianStats: emptyTechnicianStats
    };
  }

  // Execute the appropriate query
  const { loading, error, data } = useQuery(query, {
    variables: fetchTicketStats ? { user } : {},
    fetchPolicy: 'network-only' // Don't cache during development
  });

  // Extract and return data based on the query type
  let ticketStats = emptyTicketStats;
  let technicianStats = emptyTechnicianStats;
  
  if (data) {
    if (queryResultType === 'all') {
      const typedData = data as StatsQueryResult;
      ticketStats = typedData.ticketStats || emptyTicketStats;
      technicianStats = typedData.technicianStats || emptyTechnicianStats;
    } else if (queryResultType === 'ticketOnly') {
      const typedData = data as TicketStatsQueryResult;
      ticketStats = typedData.ticketStats || emptyTicketStats;
    } else if (queryResultType === 'technicianOnly') {
      const typedData = data as TechnicianStatsQueryResult;
      technicianStats = typedData.technicianStats || emptyTechnicianStats;
    }
  }

  return {
    loading,
    error,
    ticketStats,
    technicianStats
  };
};

export default useGraphQLStats;