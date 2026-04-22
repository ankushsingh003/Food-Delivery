import mongoose from "mongoose";
import Order from "./models/order.modal.js";
import Shop from "./models/shop.modal.js";
import Item from "./models/item.modal.js";

async function main() {
    await mongoose.connect("mongodb://localhost:27017/food-delivery"); // adjust connection string if needed, we'll try default
    const order = await Order.findOne({}).populate("shopOrders.shopOrderItems.item");
    console.log(JSON.stringify(order.shopOrders[0].shopOrderItems, null, 2));
    process.exit(0);
}
main();
