import ticketsService from "../services/ticketsService.js";

(async () => {
  try {
    const recentTickets = await ticketsService.getRecentTickets(5); // Fetch 5 recent tickets
    console.log("Recent Tickets:", recentTickets);
  } catch (error) {
    console.error("Error testing getRecentTickets:", error);
  }
})();
