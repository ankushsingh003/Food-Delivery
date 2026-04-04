import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../Redux/ownerSlice";
import axios from "axios";

const AddFoodItem = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [frontEndImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const categories = [
    "Snacks",
    "Main course",
    "Desserts",
    "Pizza",
    "Burger",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!backendImage) {
        alert("Please select an image");
        return;
      }
      const formData = new FormData();
      console.log("my shop data is: ", myShopData);
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);

      if (backendImage) {
        formData.append("image", backendImage);
      }
      const res = await axios.post(
        `http://localhost:8000/api/item/add-item`,
        formData,
        {
          withCredentials: true,
          timeout: 60000, // 60 seconds for file uploads
        },
      );
      console.log("Response received:", res.data);
      console.log("res printed");
      if (res.data.success) {
        alert("Item added successfully!");
        navigate("/");
      }
    } catch (error) {
      console.log("Error caught:", error);
      if (error.response) {
        console.log(
          "Server response error:",
          error.response.status,
          error.response.data,
        );
        alert(`Error: ${error.response.data.message}`);
      } else if (error.request) {
        console.log("No response from server:", error.message);
        alert("Network error - no response from server");
      } else {
        console.log("Error:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex justify-center flex col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen">
      <div
        className="absolute top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => navigate("/")}
      >
        <IoArrowBack size={35} className="text-[#ff4d2d]" />
      </div>
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {myShopData ? "Edit Item" : "Add Item"}
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dish Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Shop name"
              className="w-full px-4 py-2 border border-gray-200 outline-none rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Image
            </label>
            <input
              onChange={handleImage}
              type="file"
              placeholder="Enter Shop name"
              className="w-full px-4 py-2 border border-gray-200 outline-none rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {frontEndImage && (
              <div className="mt-4">
                <img
                  src={frontEndImage}
                  alt="image from frontend"
                  className="w-full h-48 object-cover rounded-lg border border-gray-100"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter the price"
              className="w-full px-4 py-2 border border-gray-200 outline-none rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Type
            </label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 outline-none rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 mt-2"
            >
              <option value="">Select Food Type</option>
              <option value="veg">veg</option>
              <option value="non veg">non veg</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 outline-none rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Category</option>
              {categories.map((cate, index) => (
                <option value={cate} key={index}>
                  {cate}
                </option>
              ))}
            </select>
          </div>
          <button className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 shadow-lg transition-all duration-200 cursor-pointer">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFoodItem;
