import Shop from "../models/shop.modal.js";
import uploadOnCloudinary from "../utils/cloudlnary.js";

export const createShop = async (req, res) => {
    try {
        console.log("Create shop called, user:", req.user);
        const { name, city, state, address } = req.body;
        let image;
        if (req.file) {
            try {
                console.log("File received:", req.file.path);
                const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
                if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
                    return res.status(500).json({
                        success: false,
                        message: "Image upload failed - invalid response from Cloudinary"
                    });
                }
                image = cloudinaryResponse.secure_url; // Extract URL from response
                console.log("Image uploaded:", image);
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed: " + uploadError.message
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }
        let existingShop = await Shop.findOne({ owner: req.user });
        if (!existingShop) {
            console.log("Creating new shop");
            existingShop = await Shop.create({
                name,
                city,
                state,
                address,
                image,
                owner: req.user
            });
        }
        else {
            console.log("Updating existing shop:", existingShop._id);
            existingShop = await Shop.findByIdAndUpdate(existingShop._id, {
                name,
                city,
                state,
                address,
                image
            }, { new: true })
        }

        await existingShop.populate("owner").populate("items");
        console.log("Shop created/updated successfully:", existingShop);
        return res.status(201).json({
            success: true,
            message: 'shop created successfully',
            shop: existingShop,
        })
    } catch (error) {
        console.error("Error in createShop:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user }).populate('owner').populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'shop data',
            shop,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items");
        if (!shops) {
            return res.status(400).json({
                success: false,
                message: 'shops not found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'shops found successfully according to the city',
            shops
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
} 