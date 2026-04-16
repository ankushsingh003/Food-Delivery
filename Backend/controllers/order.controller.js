import { response } from "express";
import DeliveryAssignment from "../models/deliveryAssignment.modal.js";
import Order from "../models/order.modal.js";
import Shop from "../models/shop.modal.js";
import User from "../models/user.model.js";

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
            const shopId = item.shop
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
                    item: i.id,
                    price: i.price,
                    quantity: i.quantity,
                    name: i.name,
                }))
            }
        }))


        const newOrder = await Order.create({
            user: req.user,
            paymentMethod,
            totalAmount,
            deliveryAddress,
            shopOrders
        })

        await newOrder.populate('shopOrders.shopOrderItems.item', 'name image price')
        await newOrder.populate('shopOrders.shop', 'name')


        return res.status(201).json({
            success: true,
            message: 'shop oder created successfully',
            newOrder,
        })
    } catch (error) {

        return res.status(500).json({
            success: false,
            messga: error.message
        })
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
                user: order.user,
                shopOrders: order.shopOrders.filter(o => o.owner.toString() === req.user.toString()),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
            })))
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
                        $maxDistance: 5000
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
        }
        await order.save();
        await order.populate("shopOrders.shop", "name");
        await order.populate("shopOrders.assignedDeliveryBoy", "name email mobile");

        const updatedShopOrder = order.shopOrders.find(o => o._id.toString() === shopId.toString());
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
            message: 'accept order error'
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