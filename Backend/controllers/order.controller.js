import { response } from "express";
import DeliveryAssignment from "../models/deliveryAssignment.modal.js";
import Order from "../models/order.modal.js";
import Shop from "../models/shop.modal.js";
import User from "../models/user.model.js";
import { sendDeliveryOtp } from "../utils/mail.js";
import RazorPay from "razorpay";
import dotenv from 'dotenv'
import { app } from "../../Frontend/firebase.js";
dotenv.config()

let instance = new RazorPay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
})

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, deliveryAddress, paymentMethod, totalAmount } = req.body;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'cart items not found'
            })
        }
        if (!deliveryAddress || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({
                success: false,
                message: 'send the compelete delivery address'
            })
        }
        const groupItemsByShop = {}
        cartItems.forEach(item => {
            const shopId = item.shop?._id || item.shop
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];
            }
            groupItemsByShop[shopId].push(item)
        });
        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate('owner')
            if (!shop) {
                return res.status(400).json({
                    success: false,
                    message: 'shop not found'
                })
            }
            const items = groupItemsByShop[shopId];
            const subtotal = items.reduce((sum, i) => sum += Number(i.price) * Number(i.quantity), 0)
            return {
                shop: shop._id,
                owner: shop.owner._id,
                subtotal,
                shopOrderItems: items.map((i) => ({
                    item: i._id,
                    price: i.price,
                    quantity: i.quantity,
                    name: i.name,
                }))
            }
        }))

        if (paymentMethod === 'online') {
            const razorOrder = await instance.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: `receipt_${Date.now()}`
            })
            const newOrder = await Order.create({
                user: req.user,
                paymentMethod,
                totalAmount,
                deliveryAddress,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false,
            })

            return res.status(200).json({
                orderId: newOrder._id,
                razorOrder,
                success: true,
                message: 'order created successfully'
            })
        }

        const newOrder = await Order.create({
            user: req.user,
            paymentMethod,
            totalAmount,
            deliveryAddress,
            shopOrders
        })

        await newOrder.populate('shopOrders.shopOrderItems.item', 'name image price');
        await newOrder.populate('shopOrders.owner', 'fullName socketId');
        await newOrder.populate('shopOrders.shop', 'name');
        await newOrder.populate('user', 'fullName email mobile')

        const io = req.app.get('io');

        if (io) {
            newOrder.shopOrders.forEach((shopOrder) => {
                const ownerSocketId = shopOrder.owner.socketId;
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: newOrder._id,
                        paymentMethod: newOrder.paymentMethod,
                        user: newOrder.user,
                        shopOrders: [shopOrder],
                        createdAt: newOrder.createdAt,
                        deliveryAddress: newOrder.deliveryAddress,
                        payment: newOrder.payment,
                    });
                }
            })
        }
        return res.status(201).json({
            success: true,
            message: 'shop oder created successfully',
            newOrder,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: `place order error ${error.message}`
        })
    }
}



export const verifyPayment = async (req, res) => {
    try {
        const { razorpayPaymentId, orderId } = req.body;
        const payment = await instance.payments.fetch(razorpayPaymentId);
        if (!payment || payment.status !== 'captured') {
            return res.status(400).json({
                success: false,
                message: 'payment not captured'
            })
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'order not found'
            })
        }
        order.payment = true;
        order.razorpayPaymentId = razorpayPaymentId;
        await order.save();

        await order.populate('shopOrders.shopOrderItems.item', 'name image price');
        await order.populate('shopOrders.owner', 'fullName socketId');
        await order.populate('shopOrders.shop', 'name');
        await order.populate('user', 'fullName email mobile')

        const io = req.app.get('io');

        if (io) {
            order.shopOrders.forEach((shopOrder) => {
                const ownerSocketId = shopOrder.owner.socketId;
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        shopOrders: [shopOrder],
                        createdAt: order.createdAt,
                        deliveryAddress: order.deliveryAddress,
                        payment: order.payment,
                    });
                }
            })
        }

        return res.status(200).json({
            success: true,
            message: 'payment verified successfully',
            order
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `verify payment error ${error.message}`
        });
    }
}


export const getMyOrder = async (req, res) => {
    try {
        const user = await User.findById(req.user);

        let orders;

        if (user.role === 'user') {
            orders = await Order.find({ user: req.user })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name")
                .populate("shopOrders.shopOrderItems.item", "name price image");
        } else {
            orders = await Order.find({ "shopOrders.owner": req.user })
                .sort({ createdAt: -1 })
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name price image")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            const filteredOrders = orders.map((order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                payment: order.payment,
                user: order.user,
                shopOrders: order.shopOrders.filter(o => o.owner.toString() === req.user.toString()),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
            })))
            if (filteredOrders.length > 0 && filteredOrders[0].shopOrders.length > 0) {
                console.log(JSON.stringify(filteredOrders[0].shopOrders[0].shopOrderItems, null, 2))
            }
            return res.status(200).json({
                success: true,
                orders: filteredOrders
            })
        }

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No orders found'
            });
        }

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // ✅ Compare as strings
        const shopOrder = order.shopOrders.find(
            o => o._id.toString() === shopId.toString()
        );

        if (!shopOrder) {
            return res.status(400).json({
                success: false,
                message: 'Shop order not found'
            });
        }

        shopOrder.status = status;
        let deliveryBoysPayload = [];
        if (status === 'out for delivery' && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress;
            const nearByDeliveryBoy = await User.find({
                role: "delivery-boy",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [Number(longitude), Number(latitude)]
                        },
                        $maxDistance: 50000
                    }
                }
            })
            const nearByIds = nearByDeliveryBoy.map(b => b._id);
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ['broadcasted', 'completed'] }
            }).distinct("assignedTo")
            const busyIdSet = new Set(busyIds.map(id => String(id)));

            const avalibleBoys = nearByDeliveryBoy.filter(b => !busyIdSet.has(String(b._id)));
            const candidates = avalibleBoys.map(b => b._id);
            if (candidates.length === 0) {
                await order.save();
                return res.status(200).json({
                    success: true,
                    message: 'Order status updated but no delivery boy available at this time',
                    shopOrder,
                })
            }
            const deliveryAssignment = await DeliveryAssignment.create({
                order: orderId,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                broadCastedTo: candidates,
                status: "broadcasted"
            })
            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
            shopOrder.assignment = deliveryAssignment._id;
            deliveryBoysPayload = avalibleBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates[0],
                latitude: b.location.coordinates[1],
                mobile: b.mobile,
            }))
            await deliveryAssignment.populate('order');
            await deliveryAssignment.populate('shop');

            const io = app.get("io");
            if (io) {
                avalibleBoys.forEach(boy => {
                    const boySocketId = boy.socketId;
                    if (boySocketId) {
                        io.to(boySocketId).emit('newAssignment', {
                            sentTo: boy._id,
                            assgingment: deliveryAssignment._id,
                            orderId: deliveryAssignment.order,
                            shopName: deliveryAssignment.shop.name,
                            deliveryAddress: deliveryAssignment.order.deliveryAddress,
                            items: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId.toString())).shopOrderItems || [],
                            subtotal: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId.toString())).subtotal,
                        })
                    }
                })
            }
        }
        await order.save();
        await order.populate("shopOrders.shop", "name");
        await order.populate("shopOrders.assignedDeliveryBoy", "name email mobile");
        await order.populate('user', 'socketId');

        const updatedShopOrder = order.shopOrders.find(o => o._id.toString() === shopId.toString());

        const io = req.app.get('io');

        if (io) {
            const userSocketId = order.user.socketId;
            if (userSocketId) {
                io.to(userSocketId).emit('update-status', {
                    orderId: order._id,
                    shopId: updatedShopOrder._id,
                    status: updatedShopOrder.status,
                    userId: order.user._id,
                })
            }
        }
        return res.status(200).json({
            success: true,
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy || null,
            avaliableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder.assignment || null,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.user;
        const assignments = await DeliveryAssignment.find({
            broadCastedTo: deliveryBoyId,
            status: "broadcasted"
        }).populate("order").populate('shop');
        if (!assignments) {
            return res.status(200).json({
                message: 'no assignment'
            })
        }

        const formatted = assignments.map(a => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop.name,
            deliveryAddress: a.order.deliveryAddress,
            items: a.order.shopOrders.find(so => so._id.toString() === a.shopOrderId.toString())?.shopOrderItems || [],
            subtotal: a.order.shopOrders.find(so => so._id.toString() === a.shopOrderId.toString())?.subtotal
        }))

        return res.status(200).json({
            success: true,
            formatted,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'get assignment error'
        })
    }
}


export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await DeliveryAssignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'assignment not found'
            })
        }
        if (assignment.status != "broadcasted") {
            return res.status(400).json({
                success: false,
                message: 'assignment already accepted'
            })
        }

        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.user,
            status: { $nin: ["broadcasted", "completed"] }
        })

        if (alreadyAssigned) {
            return res.status(400).json({
                success: false,
                message: 'you are already assigned another order you cannot accept this order'
            })
        }
        assignment.status = "assigned";
        assignment.assignedTo = req.user;
        assignment.acceptedAt = Date.now();
        await assignment.save();


        const order = await Order.findById(assignment.order);
        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'order not found'
            })
        }

        const shopOrder = order.shopOrders.find(so => so._id.toString() === assignment.shopOrderId.toString());
        if (!shopOrder) {
            return res.status(400).json({
                success: false,
                message: 'shop order not found'
            })
        }

        shopOrder.assignedDeliveryBoy = req.user

        await order.save();
        return res.status(200).json({
            success: true,
            message: 'order accepted successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `accept order error ${error.message}`
        })
    }
}


export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.user,
            status: "assigned"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: 'order',
                populate: [{ path: 'user', select: "fullName email location mobile" }]
            })

        if (!assignment) {
            return res.status(400).json({
                success: false,
                message: 'assignment not found'
            })
        }

        if (!assignment.order) {
            return res.status(400).json({
                success: false,
                message: 'order not found'
            })
        }

        const shopOrder = assignment.order.shopOrders.find(so => so._id.toString() === assignment.shopOrderId.toString());

        if (!shopOrder) {
            return res.status(400).json({
                success: false,
                message: 'shop order not found'
            })
        }

        let deliveryBoyLocation = { lat: null, lon: null }
        if (assignment.assignedTo.location.coordinates) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
        }

        let customerLocation = { lat: null, lon: null }

        if (assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude
            customerLocation.lon = assignment.order.deliveryAddress.longitude
        }

        return res.status(200).json({
            success: true,
            _id: assignment.order._id,
            user: assignment.order.user,
            deliveryAddress: assignment.order.deliveryAddress.text,
            shopOrder,
            deliveryBoyLocation,
            customerLocation
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'current order error'
        })
    }
}



export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate("user")
            .populate({
                path: 'shopOrders.shop',
                model: "Shop"
            })
            .populate({
                path: "shopOrders.assignedDeliveryBoy",
                model: "User"
            })
            .populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item"
            })
            .lean();
        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'order not found'
            })
        }
        return res.status(200).json({
            success: true,
            order,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `get order by id error ${error.message}`
        })
    }
}


export const sendOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body;
        const order = await Order.findById(orderId).populate("user", "email fullName");
        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'order not found'
            })
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) {
            return res.status(400).json({
                success: false,
                message: 'shop order not found'
            })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        shopOrder.deliveryOtp = otp;
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
        await order.save();
        await sendDeliveryOtp(order.user.email, otp);
        return res.status(200).json({
            success: true,
            message: `otp sent successfully to ${order.user.fullName}`
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `send otp error ${error.message}`
        })
    }
}


export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'enter valid order id'
            });
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) {
            return res.status(400).json({
                success: false,
                message: 'enter valid shop order id'
            });
        }

        if (!shopOrder.deliveryOtp || shopOrder.deliveryOtp !== String(otp) || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid/Expired otp has been entered'
            });
        }

        shopOrder.status = 'delivered';
        shopOrder.deliveredAt = Date.now();
        shopOrder.deliveryOtp = undefined;
        shopOrder.otpExpires = undefined;

        await order.save();

        await DeliveryAssignment.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy
        });

        return res.status(200).json({
            success: true,
            message: 'otp verified successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `verify otp error ${error.message}`
        });
    }
}