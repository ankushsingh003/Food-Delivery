import Shop from "../models/shop.modal.js";
import uploadOnCloudinary from "../utils/cloudlnary.js";

export const createShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        let existingShop = await Shop.findOne({ owner: req.user });
        if (!existingShop) {
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
            existingShop = await Shop.findByIdAndUpdate(existingShop._id, {
                name,
                city,
                state,
                address,
                image
            }, { new: true })
        }

        await existingShop.populate("owner");
        return res.status(201).json({
            success: true,
            message: 'shop created successfully',
            shop: existingShop,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user }).populate('owner');
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