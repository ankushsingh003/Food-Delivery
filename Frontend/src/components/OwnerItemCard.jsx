import axios from "axios";
import React from "react";
import { FaPen } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMyShopData } from "../Redux/ownerSlice";

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleDelete = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/item/delete-item/${data._id}`,
        { withCredentials: true },
      );
      console.log(res.data);
      dispatch(setMyShopData(res.data));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl">
      <div className="w-50 flex shrink-0 bg-gray-50">
        <img src={data.image} alt="" className="w-full object-cover" />
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
        <div className="flex items-center justify-between">
          <div className="text-[#ff4d2d] font-bold">
            <span className="text-black font-bold">Price: </span> ₹{data.price}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="p-2 cursor-pointer rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d]"
              onClick={() => navigate(`/edit-item/${data._id}`)}
            >
              <FaPen size={16} className="text-[#ff4d2d]" />
            </div>
            <div
              className="p-2 cursor-pointer rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d]"
              onClick={handleDelete}
            >
              <FaTrashAlt className="text-[#ff4d2d]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
