import Item from "../models/item.modal";
import uploadOnCloudinary from "../utils/cloudlnary";

export const addItem = async (req, res) => {
    try {
        const { name, category, foodTypes, price } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
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
        return res.status(200).json({
            success: true,
            message: 'Item added successfully',
            item,
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
            image = await uploadOnCloudinary(req.file.path);
        }
        const item = await Item.findByIdAndUpdate(itemId, {
            name,
            category,
            foodType,
            price,
            image
        })

        if (!item) {
            return res.status(400).json({
                success: false,
                message: 'item not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'item upadated successfully',
            item,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}