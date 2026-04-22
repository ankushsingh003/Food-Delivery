import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { TbAwardOff } from "react-icons/tb";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { Socket } from "socket.io-client";

const DeliveryBoyDashboard = () => {
  const [avaliableAssigments, setAvaliableAssignments] = useState(null);
  const [currentOrder, setCurentOrder] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const { userData, socket } = useSelector((state) => state.user);

  const handleGetAssignment = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/order/get-assignments`,
        { withCredentials: true },
      );
      console.log(res.data.formatted);
      if (res.data.success) {
        setAvaliableAssignments(res.data.formatted);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/order/get-current-order`,
        { withCredentials: true },
      );
      console.log(res.data);
      setCurentOrder(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handeSendDeliveryOtp = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/order/send-delivery-otp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id },
        { withCredentials: true },
      );
      setShowOtpBox((prev) => !prev);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true },
      );
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAcceptOrder = async (assignmentId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/order/accept-order/${assignmentId}`,
        {},
        { withCredentials: true },
      );
      console.log(res.data);
      // await getCurrentOrder();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on("newAssignment", (data) => {
      if (data.sentTo === userData._id) {
        setAvaliableAssignments((prev) => [...prev, data]);
      }
    });
    return () => {
      socket?.off("newAssignment");
    };
  }, [avaliableAssigments]);

  useEffect(() => {
    handleGetAssignment();
    getCurrentOrder();
  }, [userData]);
  return (
    <div className="w-screen h-min-screen flex flex-col items-center justify-center">
      <Nav />
      <div className="w-full max-w-[800px] flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center justify-start w-[90%] border border-orange-100 gap-2">
          <h1 className="text-2xl font-bold text-[#ff4d2d]">
            Welcome {userData.fullName}
          </h1>

          <p className="text-[#ff4d2d]">
            <span className="font-semibold">Latitude:</span>{" "}
            {userData.location.coordinates[1]},{" "}
            <span className="font-semibold">Longitude:</span>{" "}
            {userData.location.coordinates[0]}
          </p>
        </div>
      </div>
      {!currentOrder && (
        <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100 mt-5">
          <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
            Avaliable Assignments
          </h1>
          <div className="space-y-4">
            {avaliableAssigments?.length > 0 ? (
              avaliableAssigments?.map((a, index) => (
                <div
                  key={index}
                  className="border flex rounded-lg p-4 items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold">{a?.shopName}</p>
                    <p className="text-sm text-gray-500">
                      {a?.deliveryAddress.text}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a?.item?.length} items | {a?.subtotal}
                    </p>
                  </div>
                  <button
                    className="bg-[#ff4d2d] hover:bg-[#e65426] px-3 py-2 rounded-lg transition cursor-pointer text-base text-white"
                    onClick={() => handleAcceptOrder(a.assignmentId)}
                  >
                    Accept
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-700 text-sm">No Avaiable Assignments</p>
            )}
          </div>
        </div>
      )}

      {currentOrder && (
        <div className="bg-white rounded-2xl p-5 shadow-md w-[800px] border border-orange-100 mt-5">
          <h2 className="text-lg font-bold mb-3">📦Current Order</h2>
          <div className="border rounded-lg p-4 mb-3">
            <p className="text-sm font-semibold">
              {currentOrder?.shopOrder.shop.name}
            </p>
            <p className="text-sm text-gray-500">
              {currentOrder?.deliveryAddress}
            </p>
            <p className="text-sm text-gray-500">
              {currentOrder?.shopOrder.shopOrderItems.length} items |{" "}
              {currentOrder?.shopOrder.subtotal}
            </p>
          </div>
          <DeliveryBoyTracking data={currentOrder} />
          {!showOtpBox ? (
            <button
              className="mt-4 w-full bg-green-500 text-white font-semiboldpy-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-all cursor-pointer active:scale-95"
              onClick={() => handeSendDeliveryOtp()}
            >
              Mark as Delivered
            </button>
          ) : (
            <div className="mt-4 p-4 border rounded-xl bg-gray-100">
              <p className="text-sm font-semibold mb-2">
                Enter OTP sent to{" "}
                <span className="text-[#ff4d2d]">
                  {currentOrder.user.fullName}
                </span>
              </p>
              <div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <input
                    type="text"
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter the otp"
                    className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:border-[#ff4d2d]"
                  />
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition cursor-pointer text-base text-white"
                    onClick={() => verifyOtp()}
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyDashboard;
