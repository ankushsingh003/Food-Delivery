import express from 'express'
import { isAuth } from '../middlewares/auth.js';
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrder, getOrderById, placeOrder, updateOrderStatus } from '../controllers/order.controller.js';
const orderRouter = express.Router();

orderRouter.post('/place-order', isAuth, placeOrder);
orderRouter.get('/my-orders', isAuth, getMyOrder);
orderRouter.get('/get-assignments', isAuth, getDeliveryBoyAssignment);
orderRouter.post('/update-status/:orderId/:shopId', isAuth, updateOrderStatus);
orderRouter.post('/accept-order/:assignmentId', isAuth, acceptOrder);
orderRouter.get('/get-current-order', isAuth, getCurrentOrder)
orderRouter.get('/get-order-by-id/:orderId', isAuth, getOrderById)


export default orderRouter;