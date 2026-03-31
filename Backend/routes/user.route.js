import express from 'express';
import { isAuth } from '../middlewares/auth.js';
import { getCurrentUser } from '../controllers/user.controller.js';
const userRouter = express.Router();

userRouter.get('/current', isAuth, getCurrentUser);


export default userRouter;