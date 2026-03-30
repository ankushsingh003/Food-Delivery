import express from 'express';
import { logout, resetPassword, sendOtp, signin, signup, verifyOtp } from '../controllers/userController.js';
const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.get('/signout', logout);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;