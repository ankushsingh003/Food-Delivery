import express from 'express';
import dotenv from 'dotenv'
import connectToDb from './db.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

connectToDb();
app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})