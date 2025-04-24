import { useQuery, gql } from '@apollo/client';

// Define the query
const GET_STATS = gql`
  query GetStats($user: String) {
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

interface UseGraphQLStatsParams {
  user?: string | null;
}

// Hook to fetch dashboard statistics using GraphQL
export const useGraphQLStats = (params: UseGraphQLStatsParams = {}) => {
  const { user = null } = params;

  const { loading, error, data } = useQuery<StatsQueryResult>(GET_STATS, {
    variables: {
      user
    },
    fetchPolicy: 'network-only' // Don't cache during development
  });

  return {
    loading,
    error,
    ticketStats: data?.ticketStats || { 
      openTickets: 0, 
      assignedTickets: 0, 
      resolvedTickets: 0, 
      pendingTickets: 0 
    },
    technicianStats: data?.technicianStats || { 
      available: 0, 
      busy: 0, 
      offDuty: 0, 
      total: 0 
    }
  };
};

export default useGraphQLStats;