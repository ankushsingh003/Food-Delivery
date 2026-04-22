import mongoose from "mongoose";
import dotenv from "dotenv";

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/FoodDelivery").catch(e=>console.log(e));
  if (mongoose.connection.readyState !== 1) { console.log('no db'); process.exit(1); }
  const Order = (await import("./Backend/models/order.modal.js")).default;
  const orders = await Order.find().sort({createdAt: -1}).limit(3).populate('user');
  console.log("=== 3 MOST RECENT ORDERS ===");
  orders.forEach((o, i) => {
    console.log(`Order ${i+1}:`);
    console.log(`  Customer ID: ${o.user?._id}`);
    console.log(`  Customer Name: ${o.user?.fullName}`);
    console.log(`  Owner ID (from shopOrders[0]): ${o.shopOrders[0]?.owner}`);
    console.log(`  Match? ${String(o.user?._id) === String(o.shopOrders[0]?.owner)}`);
  });
  process.exit();
}
check();
