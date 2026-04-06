import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const EditItem = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const [currentItem, setCurrentItem] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [frontEndImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [loading, setLoading] = useState(false);

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
    if (!file) return;

    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (frontEndImage) URL.revokeObjectURL(frontEndImage);
    };
  }, [frontEndImage]);

  useEffect(() => {
    const handleGetItem = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/item/get-by-id/${itemId}`,
          { withCredentials: true },
        );

        const item = res.data.item;

        setCurrentItem(item);
        setName(item.name);
        setPrice(item.price);
        setCategory(item.category);
        setFoodType(item.foodType);
        setFrontendImage(item.image);
      } catch (error) {
        console.log(error);
      }
    };

    if (itemId) handleGetItem();
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", Number(price));

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const res = await axios.post(
        `http://localhost:8000/api/item/edit-item/${itemId}`,
        formData,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        alert("Item updated successfully!");
        navigate("/");
      }
    } catch (error) {
      console.log(error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong");
      }
    } finally {
      setLoading(false);
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
          <div className="text-3xl font-extrabold text-gray-900">Edit Food</div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dish Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Dish name"
              className="w-full px-4 py-2 border border-gray-200 outline-none rounded-full focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Image
            </label>
            <input
              onChange={handleImage}
              type="file"
              className="w-full px-4 py-2 border border-gray-200 rounded-full"
            />
            {frontEndImage && (
              <div className="mt-4">
                <img
                  src={frontEndImage}
                  alt="preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="Enter price"
              className="w-full px-4 py-2 border border-gray-200 rounded-full"
            />
          </div>

          {/* Food Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Type
            </label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-full"
            >
              <option value="">Select Food Type</option>
              <option value="veg">veg</option>
              <option value="non veg">non veg</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-full"
            >
              <option value="">Select Category</option>
              {categories.map((cate, index) => (
                <option value={cate} key={index}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? <ClipLoader color="white" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
