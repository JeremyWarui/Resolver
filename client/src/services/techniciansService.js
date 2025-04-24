// services/techniciansService.js
import axios from "axios";

const API_URL = "/src/data/data.json"; // For simulation only

/**
 * Get all technicians with optional filtering and pagination
 * @param {number} pageIndex - Page number (0-based)
 * @param {number} pageSize - Number of items per page
 * @param {string} availability - Filter by availability status
 * @param {string} section - Filter by section
 * @param {Object} sortBy - Sort configuration { field, direction }
 * @returns {Promise<Object>} Technicians data with pagination info
 */
const getAllTechnicians = async (
  pageIndex = 0,
  pageSize = 10,
  availability = null,
  section = null,
  sortBy = null
) => {
  try {
    const response = await axios.get(API_URL);
    let { technicians, sections } = response.data;

    // Map technicians with section names
    technicians = technicians.map(tech => {
      const sectionObj = sections.find(s => s.id === tech.section);
      return {
        ...tech,
        technician_no: `TECH-${tech.id.toString().padStart(3, '0')}`, // Add technician_no as the display ID
        section: sectionObj ? sectionObj.name : `Section ${tech.section}`
      };
    });

    // Apply availability filter if provided
    if (availability) {
      technicians = technicians.filter(tech => tech.availability === availability);
    }

    // Apply section filter if provided
    if (section) {
      technicians = technicians.filter(tech => {
        // Since we've already mapped the section name to each technician,
        // we can directly compare with the section name
        return tech.section === section;
      });
    }

    // Apply sorting if provided
    if (sortBy) {
      technicians.sort((a, b) => {
        const aValue = a[sortBy.field];
        const bValue = b[sortBy.field];

        if (sortBy.direction === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    // Apply pagination
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    const paginatedTechnicians = technicians.slice(start, end);

    return {
      technicians: paginatedTechnicians,
      totalTechnicians: technicians.length,
      sections
    };
  } catch (error) {
    console.error("Error fetching technicians:", error);
    throw error;
  }
};

/**
 * Get technician details by ID
 * @param {string} techId - Technician ID
 * @returns {Promise<Object>} Technician data
 */
const getTechnicianById = async (techId) => {
  try {
    const response = await axios.get(API_URL);
    const { technicians, sections } = response.data;
    
    // Extract the numeric ID from format "TECH-001"
    const numericId = parseInt(techId.replace('TECH-', ''));
    
    // Find the technician
    const technician = technicians.find(tech => tech.id === numericId);
    
    if (!technician) {
      throw new Error(`Technician with ID ${techId} not found`);
    }
    
    // Get section name
    const section = sections.find(s => s.id === technician.section);
    
    return {
      ...technician,
      technician_no: `TECH-${technician.id.toString().padStart(3, '0')}`, // Add technician_no
      section: section ? section.name : `Section ${technician.section}`
    };
  } catch (error) {
    console.error(`Error fetching technician ${techId}:`, error);
    throw error;
  }
};

/**
 * Get technician availability statistics
 * @returns {Promise<Object>} Availability counts
 */
const getTechnicianStats = async () => {
  try {
    const response = await axios.get(API_URL);
    const { technicians } = response.data;
    
    const stats = {
      available: 0,
      busy: 0,
      offDuty: 0,
      total: technicians.length
    };
    
    technicians.forEach(tech => {
      switch (tech.availability) {
        case "available":
          stats.available++;
          break;
        case "busy":
          stats.busy++;
          break;
        case "off-duty":
          stats.offDuty++;
          break;
        default:
          break;
      }
    });
    
    return stats;
  } catch (error) {
    console.error("Error fetching technician stats:", error);
    throw error;
  }
};

export default {
  getAllTechnicians,
  getTechnicianById,
  getTechnicianStats
};