import cron from "node-cron";
import OrderService from "../model/Order.service";

const orderService = new OrderService();

cron.schedule("0 * * * *", async () => {
  console.log("Running cron job to cancel overdue orders every 60 minutes...");
  try {
    await orderService.cancelOverdueOrders();
  } catch (err) {
    console.log("Error in running the overdue order", err);
  }
});

export default cron;
