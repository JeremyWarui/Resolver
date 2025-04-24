import ticketsService from "./ticketsService.js";

(async () => {
  try {
    console.log("Test 1: Fetch first page of tickets (default page size 10)");
    const result1 = await ticketsService.getAllTickets(0, 10);
    console.log("Result 1:", result1);

    console.log("\nTest 2: Fetch second page of tickets (page size 5)");
    const result2 = await ticketsService.getAllTickets(1, 5);
    console.log("Result 2:", result2);

    console.log("\nTest 3: Fetch tickets filtered by status 'open'");
    const result3 = await ticketsService.getAllTickets(0, 10, "open");
    console.log("Result 3:", result3);

    console.log("\nTest 4: Fetch tickets sorted by 'priority' in ascending order");
    const result4 = await ticketsService.getAllTickets(0, 10, null, { field: "priority", direction: "asc" });
    console.log("Result 4:", result4);

    console.log("\nTest 5: Fetch tickets sorted by 'createdAt' in descending order");
    const result5 = await ticketsService.getAllTickets(0, 10, null, { field: "createdAt", direction: "desc" });
    console.log("Result 5:", result5);
  } catch (error) {
    console.error("Error testing getAllTickets:", error);
  }
})();
