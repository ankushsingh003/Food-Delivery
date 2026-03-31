import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userid is not found'
            })
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'user not found'
            })
        }

        const userResponse = await User.findById(user._id).select('-password');

        return res.status(200).json({
            success: true,
            user: userResponse,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}