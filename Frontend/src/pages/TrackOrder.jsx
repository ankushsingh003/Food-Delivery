import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";

const TrackOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [currentOrder, setCurrentOrder] = useState(null);
  const handleGetOrderById = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true },
      );
      console.log(res.data.order);
      setCurrentOrder(res.data.order);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    handleGetOrderById();
  }, [orderId]);

  if (!currentOrder) return null;

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
        {/* Header */}
        <div
          className="flex items-center gap-3 cursor-pointer pt-2"
          onClick={() => navigate("/my-orders")}
        >
          <IoMdArrowBack size={28} className="text-[#ff4d2d]" />
          <h1 className="text-2xl font-bold text-gray-800">
            Track Your Order
          </h1>
        </div>

        {/* Shop Orders */}
        {currentOrder?.shopOrders?.map((shopOrder, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow-md border border-orange-100 space-y-4"
          >
            {/* Order Info */}
            <div className="space-y-2">
              <p className="text-lg font-semibold text-[#ff4d2d]">
                {shopOrder.shop?.name}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Items: </span>
                {shopOrder?.shopOrderItems?.map((i) => i.name).join(", ")}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">SubTotal: </span>₹
                {shopOrder.subtotal}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Delivery Address: </span>
                {currentOrder?.deliveryAddress?.text}
              </p>
            </div>

            {/* Status */}
            <div className="border-t pt-3">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600 capitalize">
                {shopOrder.status}
              </span>
            </div>

            {/* Delivery Boy Info */}
            {shopOrder.status !== "delivered" ? (
              <>
                {shopOrder?.assignedDeliveryBoy ? (
                  <div className="bg-green-50 rounded-xl p-3 space-y-1">
                    <p className="text-sm font-semibold text-green-700">
                      🛵 Delivery Boy: {shopOrder?.assignedDeliveryBoy?.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 Contact: {shopOrder?.assignedDeliveryBoy?.mobile}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-orange-500 font-medium">
                    ⏳ Delivery Boy is not assigned yet
                  </p>
                )}
              </>
            ) : (
              <p className="text-green-600 font-semibold text-lg">
                ✅ Delivered
              </p>
            )}

            {/* Map */}
            {shopOrder.assignedDeliveryBoy && (
              <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md border">
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation: {
                      lat: shopOrder?.assignedDeliveryBoy?.location
                        ?.coordinates?.[1],
                      lon: shopOrder?.assignedDeliveryBoy?.location
                        ?.coordinates?.[0],
                    },
                    customerLocation: {
                      lat: currentOrder?.deliveryAddress?.latitude,
                      lon: currentOrder?.deliveryAddress?.longitude,
                    },
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackOrder;
