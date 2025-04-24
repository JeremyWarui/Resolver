// services/dashboardService.js
import axios from "axios";

const API_URL = "/src/data/data.json"; // For simulation only

/**
 * Get all tickets with optional filtering and pagination
 * @param {number} pageIndex - Page number (0-based)
 * @param {number} pageSize - Number of items per page
 * @param {string|null} status - Filter by status
 * @param {string|null} section - Filter by section name
 * @param {string|null} technician - Filter by technician name
 * @returns {Promise<Object>} Tickets data with pagination info and sections
 */
const getAllTickets = async (
  pageIndex = 0,
  pageSize = 10,
  status = null,
  section = null,
  technician = null
) => {
  try {
    const response = await axios.get('/src/data/data.json');
    let { tickets, sections } = response.data;
    
    // Get tickets with proper section names (for display and filtering)
    tickets = tickets.map(ticket => {
      const sectionObj = sections.find(s => s.id === ticket.section);
      const sectionName = sectionObj ? sectionObj.name : `Unknown Section`;
      
      // Get technician name if assigned
      let technicianName = null;
      if (ticket.assignedTo) {
        const tech = response.data.technicians.find(t => t.id === ticket.assignedTo);
        technicianName = tech ? tech.name : `Unknown Technician`;
      }
      
      return {
        ...ticket,
        sectionName,
        assignedTo: technicianName
      };
    });

    // Apply status filter
    if (status) {
      tickets = tickets.filter(ticket => ticket.status === status);
    }
    
    // Apply section filter (using the section name)
    if (section) {
      tickets = tickets.filter(ticket => {
        const sectionObj = sections.find(s => s.id === ticket.section);
        return sectionObj && sectionObj.name === section;
      });
    }
    
    // Apply technician filter
    if (technician) {
      tickets = tickets.filter(ticket => {
        // Check if assignedTo contains a technician ID
        if (!ticket.assignedTo) return false;
        
        // Find the technician by ID and check if the name matches
        const tech = response.data.technicians.find(t => t.id === ticket.assignedTo);
        return tech && tech.name === technician;
      });
    }

    // Get the total count before pagination
    const totalTickets = tickets.length;
    
    // Apply pagination
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    const paginatedTickets = tickets.slice(start, end);

    return {
      tickets: paginatedTickets,
      totalTickets,
      sections
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};

const getRecentTickets = async (limit = 5, status = null) => {
  try {
    const response = await axios.get(API_URL);
    let { tickets, sections, technicians, facilities } = response.data;

    // Sort tickets by most recent activity (updatedAt or createdAt)
    tickets.sort(
      (a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      }


    );

    if (status) {
      tickets = tickets.filter((ticket) => ticket.status === status);
    }

    const recentTickets = tickets.slice(0, limit || 8);
    return {
      tickets: recentTickets,
      totalTickets: tickets.length,
      sections,
      technicians,
      facilities,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

const getTicketStats = async () => {
  try {
    const response = await axios.get(API_URL);
    const tickets = response.data.tickets;

    const stats = {
      openTickets: 0,
      assignedTickets: 0,
      resolvedTickets: 0,
      pendingTickets: 0,
    };

    tickets.forEach((ticket) => {
      switch (ticket.status) {
        case "open":
          stats.openTickets++;
          break;
        case "assigned":
          stats.assignedTickets++;
          break;
        case "resolved":
          stats.resolvedTickets++;
          break;
        case "pending":
          stats.pendingTickets++;
          break;
        default:
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    throw error;
  }
};

export default {
  getAllTickets,
  getRecentTickets,
  getTicketStats,
};
