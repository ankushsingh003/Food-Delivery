import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

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


export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.restOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();
        await sendOtpMail(email, otp);
        return res.status(200).json({
            success: true,
            message: 'Otp sent successfully'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            return res.status(400).json('Invalid/expired otp')
        }
        user.isOtpVerified = true;
        user.resetOtp = undefined
        user.otpExpires = undefined
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'otp verified successfully'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = User.findOne({ email });
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({

            })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.isOtpVerified = false;
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}