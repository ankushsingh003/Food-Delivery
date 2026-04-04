import { defaultMaxListeners } from 'events';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

const uploadOnCloudinary = async (file) => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        const result = await cloudinary.uploader.upload(file)
        fs.unlinkSync(file);
        return result
    } catch (error) {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
        console.log("Cloudinary upload error:", error)
        throw error;
    }
}

export default uploadOnCloudinary;