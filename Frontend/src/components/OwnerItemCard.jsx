import React from "react";

const OwnerItemCard = ({ data }) => {
  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl">
      <div className="w-50 h-full flex shrink-0 bg-gray-50">
        <img src={data.image} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <h2 className="text-base font-semibold text-[#ff4d2d]">
            {data.name}
          </h2>
          <p>
            <span className="font-medium text-gray-70">Category: </span>{" "}
            {data.category}
          </p>
          <p>
            <span className="font-medium text-gray-70">Food Type: </span>{" "}
            {data.foodType}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
