import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import connectToDb from './db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import cors from 'cors';
import userRouter from './routes/user.route.js';


const app = express();
const PORT = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

// routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter)

connectToDb();
app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})