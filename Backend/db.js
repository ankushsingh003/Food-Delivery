import mongoose from "mongoose";

const connectToDb = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected");
};

export default connectToDb; 