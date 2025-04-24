import { useQuery, gql } from '@apollo/client';

// Define the query
const GET_FACILITIES = gql`
  query GetFacilities {
    facilities {
      id
      name
    }
  }
`;

// Define interface for facility data
interface Facility {
  id: string;
  name: string;
}

interface FacilitiesQueryResult {
  facilities: Facility[];
}

// Hook to fetch facilities using GraphQL
export const useGraphQLFacilities = () => {
  const { loading, error, data } = useQuery<FacilitiesQueryResult>(GET_FACILITIES, {
    fetchPolicy: 'network-only' // Don't cache during development
  });

  return {
    loading,
    error,
    facilities: data?.facilities || []
  };
};

export default useGraphQLFacilities;