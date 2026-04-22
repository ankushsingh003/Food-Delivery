import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { addMyOrders, updateRealTimeOrderStatus } from "../Redux/userSlice";

const MyOrder = () => {
  const navigate = useNavigate();
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on("newOrder", (data) => {
        if (data.shopOrders?.[0]?.owner._id == userData._id) {
          dispatch(addMyOrders(data));
        }
      });
      socket.on("update-status", ({ orderId, shopId, status, userId }) => {
        if (userId === userData._id) {
          dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }));
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("newOrder");
        socket.off("update-status");
      }
    };
  }, [socket]);
  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-[20px] mb-6">
          <div className="z-[10]" onClick={() => navigate("/")}>
            <IoMdArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">My Orders</h1>
        </div>
        <div className="space-y-6">
          {myOrders && myOrders.length > 0 ? (
            myOrders.map((order, index) =>
              userData?.role === "user" ? (
                <UserOrderCard data={order} key={index} />
              ) : userData?.role === "owner" ? (
                <OwnerOrderCard data={order} key={index} />
              ) : null,
            )
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg">No orders found</p>
              {userData.role === "user" && (
                <>
                  <p className="text-gray-500 text-sm mt-2">
                    Start by placing an order to see it here
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 px-6 py-2 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#ff3d1a]"
                  >
                    Continue Shopping
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrder;
