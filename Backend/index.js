import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import connectToDb from './db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import cors from 'cors';
import userRouter from './routes/user.route.js';
import shopRouter from './routes/shop.route.js';
import itemRouter from './routes/item.route.js';
import orderRouter from './routes/order.routes.js';
import http, { ServerResponse } from 'http'
import { Server } from 'socket.io';
import { socketHandler } from './socket.js';


const app = express();
const server = http.createServer(app);

const io = new Server(server,
    {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"],
        }
    }
)

app.set('io', io);

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
app.use('/api/user', userRouter);
app.use('/api/shop', shopRouter);
app.use('/api/item', itemRouter);
app.use('/api/order', orderRouter);


socketHandler(io);

connectToDb();
server.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})