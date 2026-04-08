import express from 'express';
import { isAuth } from '../middlewares/auth.js';
import { createShop, getMyShop, getShopByCity } from '../controllers/shop.controller.js';
import { upload } from '../middlewares/multer.js';

const shopRouter = express.Router();

shopRouter.post('/create-edit', isAuth, upload.single('image'), createShop);
shopRouter.get('/get-my', isAuth, getMyShop);
shopRouter.get('/get-by-city/:city', isAuth, getShopByCity);

export default shopRouter;
