import express from 'express';
import { googleAuth, logout, resetPassword, sendOtp, signin, signup, verifyOtp } from '../controllers/auth.Controller.js';
const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.get('/signout', logout);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/google-auth', googleAuth);

export default authRouter;