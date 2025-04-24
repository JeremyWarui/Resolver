import { useState, useEffect } from 'react';
import ticketsData from '@/data/data.json';

// Interface definitions for data types
interface TechnicianTicket {
  id: number;
  ticket_no: string;
  title: string;
  description?: string;
  section: number;
  facility: number;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: number;
  raisedBy?: string;
}

interface Section {
  id: number;
  name: string;
}

interface Technician {
  id: number;
  name: string;
  username: string;
  section: number;
  availability: string;
  completedTasks: number;
  assignedTasks: number;
  email: string;
  phone: string;
  specialization: string;
  joinDate: string;
}

interface Facility {
  id: number;
  name: string;
  type: string;
  status: string;
}

// Current technician context - in a real app, this would come from an auth context
export const getCurrentTechnicianInfo = () => {
  // Match the technician from the Electrical section (ID 4)
  const electricalTechnicians = ticketsData.technicians.filter(tech => 
    tech.section === 4
  );
  
  // Return the first electrical technician or a default one
  return electricalTechnicians[0] || {
    id: 12,
    name: "Emma Davis",
    section: 4,
    specialization: "Power"
  };
};

interface UseGraphQLTechnicianTicketsParams {
  page?: number;
  pageSize?: number;
  status?: string | null;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Function to get section name by id
const getSectionNameById = (sectionId: number): string => {
  const section = ticketsData.sections.find(s => s.id === sectionId);
  return section ? section.name : 'Unknown';
};

// Function to get facility name by id
const getFacilityNameById = (facilityId: number): string => {
  const facility = ticketsData.facilities.find(f => f.id === facilityId);
  return facility ? facility.name : 'Unknown';
};

// Hook to fetch technician tickets from local data
const useGraphQLTechnicianTickets = (params: UseGraphQLTechnicianTicketsParams = {}) => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TechnicianTicket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  
  const currentTechnician = getCurrentTechnicianInfo();
  
  const {
    page = 0,
    pageSize = 10,
    status = null,
    sortField = 'id',
    sortDirection = 'desc'
  } = params;

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    
    // Filter tickets assigned to the current technician
    const technicianTickets = ticketsData.tickets.filter(ticket => 
      ticket.assignedTo === currentTechnician.id &&
      (status === null || ticket.status === status)
    );
    
    // Sort tickets
    const sortedTickets = [...technicianTickets].sort((a, b) => {
      if (sortField === 'id') {
        return sortDirection === 'asc' 
          ? a.id - b.id 
          : b.id - a.id;
      } else if (sortField === 'createdAt') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
    
    // Apply pagination
    const paginatedTickets = sortedTickets.slice(
      page * pageSize, 
      (page + 1) * pageSize
    );
    
    // Convert tickets to include names instead of IDs
    const processedTickets = paginatedTickets.map(ticket => ({
      ...ticket,
      sectionName: getSectionNameById(ticket.section),
      facilityName: getFacilityNameById(ticket.facility)
    }));
    
    // Update state
    setTotalTickets(technicianTickets.length);
    setTickets(processedTickets);
    
    // Simulate network delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentTechnician.id, page, pageSize, status, sortField, sortDirection]);

  return {
    loading,
    error: null,
    tickets,
    totalTickets,
    sections: ticketsData.sections,
    currentTechnician: {
      id: currentTechnician.id,
      name: currentTechnician.name,
      section: getSectionNameById(currentTechnician.section)
    },
    refetch: () => {}
  };
};

export default useGraphQLTechnicianTickets;