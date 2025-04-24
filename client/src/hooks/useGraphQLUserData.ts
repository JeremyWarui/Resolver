import { useQuery, gql } from '@apollo/client';

// Define the query
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      name
      email
      role
      department
    }
  }
`;

// Define interface for user data
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface UserDataQueryResult {
  currentUser: UserData;
}

// Hook to fetch current user data using GraphQL
export const useGraphQLUserData = () => {
  const { loading, error, data } = useQuery<UserDataQueryResult>(GET_CURRENT_USER, {
    fetchPolicy: 'network-only' // Don't cache during development
  });

  return {
    loading,
    error,
    userData: data?.currentUser || null
  };
};

export default useGraphQLUserData;