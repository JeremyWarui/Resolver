// Sample hardcoded data for tickets assigned to a specific technician
export const sampleTickets = [
  // Open tickets
  {
    id: 1,
    ticket_no: "TKT-2025-001",
    title: "Broken AC in Conference Room",
    section: 1,
    facility: 1,
    facilityName: "Main Building",
    location: "Conference Room 101",
    priority: "high",
    status: "open",
    createdAt: "2025-04-20T08:00:00Z",
    updatedAt: "2025-04-20T09:00:00Z",
    assignedTo: 1,
    description: "The air conditioning unit in the main conference room is not working properly.",
    raisedBy: "James Wilson",
    comments: [
      {
        id: 101,
        text: "Will inspect the AC unit tomorrow morning. Need to check if it's an electrical issue or refrigerant leak.",
        createdAt: "2025-04-20T09:30:00Z",
        technician: "Lisa Johnson"
      }
    ]
  },
  {
    id: 2,
    ticket_no: "TKT-2025-002",
    title: "Network Connectivity Issues",
    section: 2,
    facility: 2,
    facilityName: "Admin Block",
    location: "IT Lab 204",
    priority: "high",
    status: "open",
    createdAt: "2025-04-21T07:00:00Z",
    updatedAt: "2025-04-21T08:00:00Z",
    assignedTo: 1,
    description: "Multiple users reporting intermittent network connectivity issues.",
    raisedBy: "Emma Davis",
    comments: [
      {
        id: 102,
        text: "Initial diagnostic shows potential router configuration issue. Will need to test all network points in the lab.",
        createdAt: "2025-04-21T08:15:00Z",
        technician: "Lisa Johnson"
      }
    ]
  },
  {
    id: 3,
    ticket_no: "TKT-2025-003",
    title: "Water Leak in Kitchen",
    section: 3,
    facility: 3,
    facilityName: "Residential Area",
    location: "Common Kitchen 302",
    priority: "medium",
    status: "open",
    createdAt: "2025-04-22T05:00:00Z",
    updatedAt: "2025-04-22T06:00:00Z",
    assignedTo: 1,
    description: "Water leaking from the sink in the common kitchen area.",
    raisedBy: "Robert Johnson",
    comments: [
      {
        id: 103,
        text: "Scheduled inspection for this afternoon. Will bring replacement parts for the sink trap and faucet.",
        createdAt: "2025-04-22T07:45:00Z",
        technician: "Lisa Johnson"
      }
    ]
  },
  
  // In Progress tickets
  {
    id: 4,
    ticket_no: "TKT-2025-004",
    title: "Faulty Projector in Meeting Room",
    section: 1,
    facility: 1,
    facilityName: "Main Building",
    location: "Meeting Room 105",
    priority: "medium",
    status: "in progress",
    createdAt: "2025-04-18T10:20:00Z",
    updatedAt: "2025-04-23T09:15:00Z",
    assignedTo: 1,
    description: "Projector display shows distorted colors. Began troubleshooting.",
    raisedBy: "Sarah Miller",
    comments: [
      {
        id: 104,
        text: "Initial diagnosis complete. The projector lamp needs replacement and there's an issue with the color wheel.",
        createdAt: "2025-04-23T09:15:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 105,
        text: "Ordered replacement parts. ETA for delivery is April 25.",
        createdAt: "2025-04-24T11:30:00Z",
        technician: "Lisa Johnson"
      }
    ]
  },
  {
    id: 5,
    ticket_no: "TKT-2025-005",
    title: "Elevator Not Working",
    section: 2,
    facility: 4,
    facilityName: "Corporate Tower",
    location: "East Wing Elevator",
    priority: "high",
    status: "in progress",
    createdAt: "2025-04-19T14:30:00Z",
    updatedAt: "2025-04-22T16:45:00Z",
    assignedTo: 1,
    description: "East wing elevator stuck between floors. Service manual obtained, waiting for parts.",
    raisedBy: "Michael Chen",
    comments: [
      {
        id: 106,
        text: "Elevator issue identified as controller board failure. Working with building maintenance to retrieve passengers.",
        createdAt: "2025-04-19T15:45:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 107,
        text: "Passengers safely evacuated. Elevator now completely shut down. Contacted manufacturer for replacement board.",
        createdAt: "2025-04-22T16:45:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 108,
        text: "Replacement parts scheduled to arrive tomorrow. Will coordinate with building management for installation.",
        createdAt: "2025-04-26T09:20:00Z",
        technician: "Lisa Johnson"
      }
    ]
  },
  
  // Pending tickets
  {
    id: 6,
    ticket_no: "TKT-2025-006",
    title: "Server Room Cooling System Failure",
    section: 2,
    facility: 2,
    facilityName: "Admin Block",
    location: "Server Room 212",
    priority: "high",
    status: "pending",
    createdAt: "2025-04-15T11:25:00Z",
    updatedAt: "2025-04-21T13:10:00Z",
    assignedTo: 1,
    description: "Cooling system needs replacement parts. Waiting for delivery.",
    raisedBy: "Daniel Brown",
    pendingReason: "Waiting for parts",
    comments: [
      {
        id: 109,
        text: "Diagnosis complete. The compressor for cooling unit #2 has failed. Ordered replacement.",
        createdAt: "2025-04-16T10:15:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 110,
        text: "Implemented temporary cooling solution with portable units. Monitoring server temperatures hourly.",
        createdAt: "2025-04-18T15:30:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 111,
        text: "Parts supplier reports shipping delay. New ETA is April 29. Continuing with temporary cooling measures.",
        createdAt: "2025-04-21T13:10:00Z",
        technician: "Lisa Johnson"
      }
    ]
  },
  
  // Resolved tickets
  {
    id: 7,
    ticket_no: "TKT-2025-007",
    title: "Flickering Lights in Hallway",
    section: 3,
    facility: 3,
    facilityName: "Residential Area",
    location: "Hallway 3B",
    priority: "low",
    status: "resolved",
    createdAt: "2025-04-10T09:00:00Z",
    updatedAt: "2025-04-12T14:20:00Z",
    assignedTo: 1,
    description: "Replaced faulty ballasts in fluorescent fixtures.",
    raisedBy: "Jennifer Adams",
    resolution: "Replaced 3 ballasts and 2 fluorescent tubes",
    comments: [
      {
        id: 112,
        text: "Inspected the hallway. Three light fixtures have faulty ballasts causing the flickering.",
        createdAt: "2025-04-10T14:20:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 113,
        text: "Ordered replacement ballasts and fluorescent tubes.",
        createdAt: "2025-04-11T09:45:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 114,
        text: "Repairs completed. All lights now functioning normally with no flickering.",
        createdAt: "2025-04-12T14:20:00Z",
        technician: "Lisa Johnson"
      }
    ]
  },
  {
    id: 8,
    ticket_no: "TKT-2025-008",
    title: "Clogged Drain in Restroom",
    section: 1,
    facility: 1,
    facilityName: "Main Building",
    location: "Restroom 112",
    priority: "medium",
    status: "resolved",
    createdAt: "2025-04-17T10:45:00Z",
    updatedAt: "2025-04-18T12:30:00Z",
    assignedTo: 1,
    description: "Drain snake used to clear blockage. Working normally now.",
    raisedBy: "Thomas Wilson",
    resolution: "Cleared blockage with drain snake and applied drain cleaner",
    comments: [
      {
        id: 115,
        text: "Initial inspection shows significant clog. Will need specialized tools to clear.",
        createdAt: "2025-04-17T11:30:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 116,
        text: "Successfully cleared the blockage. Found paper towels and other debris causing the clog.",
        createdAt: "2025-04-18T12:15:00Z",
        technician: "Lisa Johnson"
      },
      {
        id: 117,
        text: "Added signage reminding users not to flush paper towels. Will check back in a week to ensure no recurrence.",
        createdAt: "2025-04-18T12:30:00Z",
        technician: "Lisa Johnson"
      }
    ]
  },
];

// Mock current technician
export const currentTechnician = {
  id: 1,
  name: "Lisa Johnson",
  section: "HVAC",
};

// All possible ticket statuses
export const allStatuses = [
  "open",
  "in progress",
  "pending",
  "resolved",
];