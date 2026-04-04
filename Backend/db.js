import mongoose from 'mongoose';

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
        });
        console.log("MongoDB connected!");
    } catch (error) {
        console.error("DB connection failed:", error);
    }
};

export default connectToDb;