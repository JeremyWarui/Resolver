import { useQuery, gql } from '@apollo/client';

// Define the query specifically for user ticket statistics
const GET_USER_TICKET_STATS = gql`
  query GetUserTicketStats($username: String!) {
    userTicketStats(username: $username) {
      openTickets
      assignedTickets
      resolvedTickets
      pendingTickets
      statusBreakdown {
        status
        count
      }
    }
  }
`;

// Define interfaces for the data structure
interface StatusCount {
  status: string;
  count: number;
}

interface UserTicketStats {
  openTickets: number;
  assignedTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  statusBreakdown: StatusCount[];
}

interface UserTicketStatsQueryResult {
  userTicketStats: UserTicketStats;
}

interface UseGraphQLUserTicketStatsParams {
  username: string;
}

// Default empty stats object
const emptyUserTicketStats: UserTicketStats = {
  openTickets: 0,
  assignedTickets: 0,
  resolvedTickets: 0,
  pendingTickets: 0,
  statusBreakdown: []
};

// Hook to fetch user ticket statistics using GraphQL
const useGraphQLUserTicketStats = (params: UseGraphQLUserTicketStatsParams) => {
  const { username } = params;

  const { loading, error, data, refetch } = useQuery<UserTicketStatsQueryResult>(
    GET_USER_TICKET_STATS,
    {
      variables: { username },
      fetchPolicy: 'network-only', // Don't cache during development
      skip: !username // Skip the query if no username is provided
    }
  );

  return {
    loading,
    error,
    userTicketStats: data?.userTicketStats || emptyUserTicketStats,
    refetch
  };
};

export default useGraphQLUserTicketStats;