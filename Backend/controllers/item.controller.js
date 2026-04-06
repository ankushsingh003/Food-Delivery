import Item from "../models/item.modal.js";
import uploadOnCloudinary from "../utils/cloudlnary.js";
import Shop from "../models/shop.modal.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body;
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
        const shop = await Shop.findOne({ owner: req.user });
        if (!shop) {
            return res.status(400).json({
                success: false,
                message: 'shop not found',
            })
        }
        const item = await Item.create({
            name,
            category,
            foodType,
            price,
            image,
            shop: shop._id
        })

        // Add item to shop's items array
        shop.items.push(item._id);
        await shop.save();
        (await shop.populate("owner")).populate({
            path: "items",
            options: { sort: { upddatedAt: -1 } }
        })

        return res.status(200).json({
            success: true,
            message: 'Item added successfully',
            shop,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { name, category, foodType, price } = req.body;
        let image;
        if (req.file) {
            try {
                const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
                if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
                    return res.status(500).json({
                        success: false,
                        message: "Image upload failed"
                    });
                }
                image = cloudinaryResponse.secure_url;
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed: " + uploadError.message
                });
            }
        }
        const item = await Item.findByIdAndUpdate(itemId, {
            name,
            category,
            foodType,
            price,
            ...(image && { image })
        }, { new: true })

        if (!item) {
            return res.status(400).json({
                success: false,
                message: 'item not found'
            })
        }
        const shop = await Shop.findOne({ owner: req.user }).populate({
            path: "items",
            options: { sort: { upddatedAt: -1 } }
        })
        return res.status(200).json({
            success: true,
            message: 'item updated successfully',
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


export const getItemById = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findById(itemId);
        console.log(item)
        if (!item) {
            return res.status(400).json({
                sucees: false,
                message: 'Item not found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Item found successfully',
            item
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId);
        if (!item) {
            return res.status(400).json({
                success: false,
                message: 'item not found'
            })
        }

        const shop = await Shop.findOne({ owner: req.user })
        shop.items = shop.items.filter(i => i !== item._id);
        await shop.save();
        await shop.populate({
            path: "item",
            options: { sort: { upddatedAt: -1 } }
        });

        return res.status(200).json({
            success: true,
            message: 'item deleted succesfully',
            shop
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}