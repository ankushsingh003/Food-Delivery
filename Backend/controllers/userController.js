import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../utils/token.js";

export const signup = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;

        if (!fullName || !email || !password || !mobile || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ message: 'Mobile must be 10 digits' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobile,
            role
        });

        const token = generateToken(user._id);

        return res
            .cookie('token', token, {
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            })
            .status(201)
            .json({
                success: true,
                message: 'Signed up successfully'
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};


export const signin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email or password is missing'
        })
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'User does not exits'
        })
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
        return res.status(400).json({
            success: false,
            message: 'Incorrect password'
        })
    }
    const token = generateToken(user._id, {

    });
    return res.cookie('token', token, {
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    })
        .status(200)
        .json({
            success: true,
            message: 'Signed In successfully'
        })
}


export const logout = async (_, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({
            success: true,
            message: 'Logout successfully'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: error.message
        })
    }
}