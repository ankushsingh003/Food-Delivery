import React from "react";
import { useNavigate } from "react-router-dom";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();
  const formatedData = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4 border-l-4 border-[#ff4d2d]">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-semibold text-lg">Order #{data?._id?.slice(-6)}</p>
          <p className="text-sm text-gray-600">
            {formatedData(data?.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {data.paymentMethod?.toUpperCase()}
          </p>
          <p className="font-medium text-blue-500">
            {data.shopOrders[0]?.status}
          </p>
        </div>
      </div>

      {/* One block per shop */}
      {data.shopOrders.map((shopOrder, index) => (
        <div
          key={index}
          className="border bg-[#fffaf7] rounded-lg pb-2 p-3 gap-1"
        >
          {/* Shop name */}
          <p className="font-semibold text-gray-700 mb-2">
            {shopOrder.shop?.name}
          </p>

          {/* Items in a horizontal scroll row — one shop per row */}
          <div className="flex shrink-0 overflow-x-auto pb-2 gap-2">
            {shopOrder.shopOrderItems.map((i, idx) => (
              <div
                key={idx}
                className="flex flex-col shrink-0 w-40 border rounded-lg p-2 bg-white"
              >
                <img
                  src={i.item?.image}
                  alt=""
                  className="w-full h-24 object-cover rounded"
                />
                <p className="text-sm font-semibold mt-1">{i.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {i.quantity} x ₹{i.price}
                </p>
              </div>
            ))}
          </div>

          {/* Subtotal + status per shop */}
          <div className="flex justify-between items-center border-t pt-2">
            <p className="font-medium text-gray-800">
              Subtotal: <span className="pl-2">₹{shopOrder.subtotal}</span>
            </p>
            <p className="text-xs text-blue-500">{shopOrder.status}</p>
          </div>
        </div>
      ))}

      {/* ✅ Total Amount ONCE outside the shop loop */}
      <div className="flex justify-between items-center border-t pt-3">
        <p className="font-medium text-lg">
          Total Amount:{" "}
          <span className="text-[#ff4d2d]">
            ₹{data.totalAmount > 500 ? data.totalAmount : data.totalAmount + 50}
          </span>
          {data.totalAmount <= 500 && (
            <span className="text-xs text-gray-400 ml-2">(+₹50 delivery)</span>
          )}
        </p>
        <button
          className="bg-[#ff4d2d] hover:bg-[#e65426] px-3 py-2 rounded-lg transition cursor-pointer text-base text-white"
          onClick={() => navigate(`/track-order/${data?._id}`)}
        >
          Track
        </button>
      </div>
    </div>
  );
};

export default UserOrderCard;
