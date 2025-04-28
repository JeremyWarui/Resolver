import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gql } from 'graphql-tag';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define default current user
const CURRENT_USER = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "user",
  department: "IT"
};

// Read the data.json file
const dataPath = path.join(__dirname, '../data/data.json');
let data;

try {
  const rawData = readFileSync(dataPath, 'utf8');
  data = JSON.parse(rawData);
  
  // Update any tickets with "User" as raisedBy to use the current user's name
  data.tickets = data.tickets.map(ticket => {
    if (ticket.raisedBy === 'User') {
      return { ...ticket, raisedBy: CURRENT_USER.name };
    }
    return ticket;
  });
  
} catch (error) {
  console.error('Error reading data.json:', error);
  data = { tickets: [], technicians: [], sections: [], facilities: [] };
}

// Define GraphQL schema based on your data structure
const typeDefs = gql`
  type Query {
    tickets(
      page: Int
      pageSize: Int
      status: String
      section: String
      technician: String
      user: String
      sortField: String
      sortDirection: String
    ): TicketsResponse!
    
    ticket(id: ID!): Ticket
    
    technicians(
      page: Int
      pageSize: Int
      availability: String
      section: String
      sortField: String
      sortDirection: String
    ): TechniciansResponse!
    
    technician(id: ID!): Technician
    
    sections: [Section!]!
    facilities: [Facility!]!
    
    ticketStats(user: String): TicketStats!
    technicianStats: TechnicianStats!
    
    userTicketStats(username: String!): UserTicketStats!
    
    currentUser: User!
  }

  type Mutation {
    createTicket(
      title: String!
      description: String!
      section_id: ID!
      facility_id: ID!
      location_detail: String!
      priority: String!
    ): Ticket
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  type UserTicketStats {
    openTickets: Int!
    assignedTickets: Int!
    resolvedTickets: Int!
    pendingTickets: Int!
    statusBreakdown: [StatusCount!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    department: String
  }

  type TicketsResponse {
    tickets: [Ticket!]!
    totalTickets: Int!
    sections: [Section!]!
  }

  type TechniciansResponse {
    technicians: [Technician!]!
    totalTechnicians: Int!
    sections: [Section!]!
  }

  type Ticket {
    id: ID!
    ticket_no: String!
    title: String!
    description: String
    section: ID!
    facility: ID!
    priority: String!
    status: String!
    createdAt: String!
    updatedAt: String
    assignedTo: ID
    raisedBy: String
    sectionName: String
  }

  type Technician {
    id: ID!
    technician_no: String!
    name: String!
    phone: String!
    username: String!
    section: String!
    availability: String!
    completedTasks: Int!
    assignedTasks: Int!
    email: String!
    specialization: String!
    joinDate: String!
  }

  type Section {
    id: ID!
    name: String!
  }

  type Facility {
    id: ID!
    name: String!
  }

  type TicketStats {
    openTickets: Int!
    assignedTickets: Int!
    resolvedTickets: Int!
    pendingTickets: Int!
  }

  type TechnicianStats {
    available: Int!
    busy: Int!
    offDuty: Int!
    total: Int!
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    tickets: (_, { page = 0, pageSize = 10, status, section, technician, user, sortField, sortDirection }) => {
      let filteredTickets = [...data.tickets];
      
      // Apply filters
      if (status) {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
      }
      
      if (section) {
        filteredTickets = filteredTickets.filter(ticket => {
          const sectionObj = data.sections.find(s => s.id === ticket.section);
          return sectionObj && sectionObj.name === section;
        });
      }
      
      if (technician) {
        filteredTickets = filteredTickets.filter(ticket => {
          if (!ticket.assignedTo) return false;
          const tech = data.technicians.find(t => t.id === ticket.assignedTo);
          return tech && tech.name === technician;
        });
      }

      // Filter by user who raised the ticket
      if (user) {
        filteredTickets = filteredTickets.filter(ticket => {
          return ticket.raisedBy === user;
        });
      }
      
      // Apply sorting
      if (sortField && sortDirection) {
        filteredTickets.sort((a, b) => {
          if (sortDirection === 'asc') {
            return a[sortField] < b[sortField] ? -1 : 1;
          } else {
            return a[sortField] > b[sortField] ? -1 : 1;
          }
        });
      }
      
      // Add section names
      const ticketsWithSectionNames = filteredTickets.map(ticket => {
        const sectionObj = data.sections.find(s => s.id === ticket.section);
        const sectionName = sectionObj ? sectionObj.name : 'Unknown';
        
        // Format technician name if assigned
        let techName = null;
        if (ticket.assignedTo) {
          const tech = data.technicians.find(t => t.id === ticket.assignedTo);
          techName = tech ? tech.name : null;
        }
        
        return {
          ...ticket,
          sectionName,
          assignedTo: techName || ticket.assignedTo,
          ticket_no: `TKT-${ticket.id.toString().padStart(4, '0')}`
        };
      });
      
      // Apply pagination
      const start = page * pageSize;
      const paginatedTickets = ticketsWithSectionNames.slice(start, start + pageSize);
      
      return {
        tickets: paginatedTickets,
        totalTickets: filteredTickets.length,
        sections: data.sections
      };
    },
    
    ticket: (_, { id }) => {
      const ticket = data.tickets.find(t => t.id.toString() === id);
      if (!ticket) return null;
      
      const sectionObj = data.sections.find(s => s.id === ticket.section);
      const sectionName = sectionObj ? sectionObj.name : 'Unknown';
      
      return {
        ...ticket,
        sectionName,
        ticket_no: `TKT-${ticket.id.toString().padStart(3, '0')}`
      };
    },
    
    technicians: (_, { page = 0, pageSize = 10, availability, section, sortField, sortDirection }) => {
      let filteredTechnicians = [...data.technicians];
      
      // Apply filters
      if (availability) {
        filteredTechnicians = filteredTechnicians.filter(tech => tech.availability === availability);
      }
      
      if (section) {
        filteredTechnicians = filteredTechnicians.filter(tech => {
          const sectionObj = data.sections.find(s => s.id === tech.section);
          return sectionObj && sectionObj.name === section;
        });
      }
      
      // Apply sorting
      if (sortField && sortDirection) {
        filteredTechnicians.sort((a, b) => {
          if (sortDirection === 'asc') {
            return a[sortField] < b[sortField] ? -1 : 1;
          } else {
            return a[sortField] > b[sortField] ? -1 : 1;
          }
        });
      }
      
      // Add section names and technician numbers
      const techniciansWithDetails = filteredTechnicians.map(tech => {
        const sectionObj = data.sections.find(s => s.id === tech.section);
        return {
          ...tech,
          section: sectionObj ? sectionObj.name : `Section ${tech.section}`,
          technician_no: `TECH-${tech.id.toString().padStart(3, '0')}`
        };
      });
      
      // Apply pagination
      const start = page * pageSize;
      const paginatedTechnicians = techniciansWithDetails.slice(start, start + pageSize);
      
      return {
        technicians: paginatedTechnicians,
        totalTechnicians: filteredTechnicians.length,
        sections: data.sections
      };
    },
    
    technician: (_, { id }) => {
      const technician = data.technicians.find(t => t.id.toString() === id);
      if (!technician) return null;
      
      const sectionObj = data.sections.find(s => s.id === technician.section);
      
      return {
        ...technician,
        section: sectionObj ? sectionObj.name : `Section ${technician.section}`,
        technician_no: `TECH-${technician.id.toString().padStart(3, '0')}`
      };
    },
    
    sections: () => data.sections,
    facilities: () => data.facilities,
    
    ticketStats: (_, { user }) => {
      const stats = {
        openTickets: 0,
        assignedTickets: 0,
        resolvedTickets: 0,
        pendingTickets: 0
      };
      
      let ticketsToCount = data.tickets;
      
      // Filter tickets by user if specified
      if (user) {
        ticketsToCount = ticketsToCount.filter(ticket => ticket.raisedBy === user);
      }
      
      ticketsToCount.forEach(ticket => {
        switch (ticket.status) {
          case 'open':
            stats.openTickets++;
            break;
          case 'assigned':
            stats.assignedTickets++;
            break;
          case 'resolved':
            stats.resolvedTickets++;
            break;
          case 'pending':
            stats.pendingTickets++;
            break;
          default:
            break;
        }
      });
      
      return stats;
    },
    
    technicianStats: () => {
      const stats = {
        available: 0,
        busy: 0,
        offDuty: 0,
        total: data.technicians.length
      };
      
      data.technicians.forEach(tech => {
        switch (tech.availability) {
          case 'available':
            stats.available++;
            break;
          case 'busy':
            stats.busy++;
            break;
          case 'off-duty':
            stats.offDuty++;
            break;
          default:
            break;
        }
      });
      
      return stats;
    },

    userTicketStats: (_, { username }) => {
      if (!username) {
        throw new Error('Username is required');
      }
      
      // Filter tickets by the specified username
      const userTickets = data.tickets.filter(ticket => ticket.raisedBy === username);
      
      // Calculate ticket stats
      const stats = {
        openTickets: 0,
        assignedTickets: 0,
        resolvedTickets: 0,
        pendingTickets: 0,
        statusBreakdown: []
      };
      
      // Count tickets by status
      const statusCounts = {};
      
      userTickets.forEach(ticket => {
        switch (ticket.status) {
          case 'open':
            stats.openTickets++;
            break;
          case 'assigned':
            stats.assignedTickets++;
            break;
          case 'resolved':
            stats.resolvedTickets++;
            break;
          case 'pending':
            stats.pendingTickets++;
            break;
          default:
            break;
        }
        
        // Add to status breakdown
        if (statusCounts[ticket.status]) {
          statusCounts[ticket.status]++;
        } else {
          statusCounts[ticket.status] = 1;
        }
      });
      
      // Convert status counts to array of objects
      stats.statusBreakdown = Object.keys(statusCounts).map(status => ({
        status,
        count: statusCounts[status]
      }));
      
      return stats;
    },

    // Add a mock current user resolver
    currentUser: () => {
      return CURRENT_USER;
    }
  },
  
  Mutation: {
    createTicket: (_, { title, description, section_id, facility_id, location_detail, priority }) => {
      // Generate a new ID by finding the highest existing ID and adding 1
      const newId = Math.max(...data.tickets.map(t => parseInt(t.id)), 0) + 1;
      
      // Create the new ticket
      const newTicket = {
        id: newId.toString(),
        title,
        description,
        section: section_id,
        facility: facility_id,
        location_detail,
        priority,
        status: 'open', // Default status for new tickets
        createdAt: new Date().toISOString(),
        updatedAt: null,
        assignedTo: null,
        raisedBy: CURRENT_USER.name // Use the current user's name instead of 'User'
      };
      
      // Add the ticket to data
      data.tickets.push(newTicket);
      
      // Format the ticket for the response
      const sectionObj = data.sections.find(s => s.id === newTicket.section);
      const ticket_no = `TKT-${newTicket.id.toString().padStart(4, '0')}`;
      
      return {
        ...newTicket,
        sectionName: sectionObj ? sectionObj.name : 'Unknown',
        ticket_no
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});


const { url } = await startStandaloneServer(server, {
  context: () => ({ data }),
  listen: { port: process.env.PORT || 4000 }
});
console.log(`🚀 Server ready at: ${url}`);
