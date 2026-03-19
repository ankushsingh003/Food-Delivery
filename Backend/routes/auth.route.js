import express from 'express';
import { logout, signin, signup } from '../controllers/userController';
const authRouter = express.Router();

authRouter.post('/singup', signup);
authRouter.post('/signin', signin);
authRouter.get('/signout', logout);

export default authRouter;