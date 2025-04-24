import { useQuery, gql } from '@apollo/client';

// Define the query
const GET_TECHNICIANS = gql`
  query GetTechnicians(
    $page: Int
    $pageSize: Int
    $availability: String
    $section: String
    $sortField: String
    $sortDirection: String
  ) {
    technicians(
      page: $page
      pageSize: $pageSize
      availability: $availability
      section: $section
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      technicians {
        id
        technician_no
        name
        phone
        username
        section
        availability
        completedTasks
        assignedTasks
        email
        specialization
        joinDate
      }
      totalTechnicians
      sections {
        id
        name
      }
    }
  }
`;

// Define interface for technician data
interface Technician {
  id: string;
  technician_no: string;
  name: string;
  phone: string;
  username: string;
  section: string;
  availability: string;
  completedTasks: number;
  assignedTasks: number;
  email: string;
  specialization: string;
  joinDate: string;
}

interface Section {
  id: string;
  name: string;
}

interface TechniciansQueryResult {
  technicians: {
    technicians: Technician[];
    totalTechnicians: number;
    sections: Section[];
  };
}

interface UseGraphQLTechniciansParams {
  page?: number;
  pageSize?: number;
  availability?: string | null;
  section?: string | null;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Hook to fetch technicians using GraphQL
export const useGraphQLTechnicians = (params: UseGraphQLTechniciansParams = {}) => {
  const {
    page = 0,
    pageSize = 10,
    availability = null,
    section = null,
    sortField,
    sortDirection
  } = params;

  const { loading, error, data } = useQuery<TechniciansQueryResult>(GET_TECHNICIANS, {
    variables: {
      page,
      pageSize,
      availability: availability === 'all' ? null : availability,
      section: section === 'all' ? null : section,
      sortField,
      sortDirection
    },
    fetchPolicy: 'network-only' // Don't cache during development
  });

  return {
    loading,
    error,
    technicians: data?.technicians.technicians || [],
    totalTechnicians: data?.technicians.totalTechnicians || 0,
    sections: data?.technicians.sections || []
  };
};

export default useGraphQLTechnicians;