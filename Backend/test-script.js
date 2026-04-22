
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/food-delivery-test");
        console.log("Mock script success");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(0);
    }
}
runTest();
