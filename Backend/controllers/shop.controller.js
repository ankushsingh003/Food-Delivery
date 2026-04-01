import Shop from "../models/shop.modal";
import uploadOnCloudinary from "../utils/cloudlnary";

export const createShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        let shop = await shop.findOne({ owner: req.user });
        if (!shop) {
            shop = await Shop.create({
                name,
                city,
                state,
                address,
                image
            });
        }
        else {
            shop = await shop.findByIdAndUpdate(shop._id, {
                name,
                city,
                state,
                address,
                image
            }, { new: true })
        }

        await shop.populate("owner");
        return res.status(201).json({
            success: true,
            message: 'shop created successfully',
            shop,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}