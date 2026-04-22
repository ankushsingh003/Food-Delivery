import mongoose from "mongoose";
import Order from "./models/order.modal.js";

async function query() {
  await mongoose.connect("mongodb://127.0.0.1:27017/FoodDelivery"); // assuming localhost
  const orders = await Order.find().sort({createdAt:-1}).limit(2).populate('user');
  for (let o of orders) {
    console.log("Order ID:", o._id);
    console.log("Customer ID:", o.user?._id, "Customer Name:", o.user?.fullName);
    console.log("Owner ID:", o.shopOrders[0]?.owner);
  }
  process.exit();
}
query();
