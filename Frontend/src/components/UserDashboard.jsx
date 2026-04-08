import React, { useEffect, useRef, useState } from "react";
import Nav from "./Nav";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import useGetShopByCity from "../hooks/useGetShopByCity";
import useGetCity from "../hooks/useGetCity";
import useGetItemByCity from "../hooks/useGetItemByCity";
import FoodCart from "./FoodCart";

const UserDashboard = () => {
  useGetCity();
  useGetShopByCity();
  useGetItemByCity();
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const itemScrollRef = useRef();
  const { city, shopInMyCity, itemsInCity } = useSelector(
    (state) => state.user,
  );
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [showItemLeftButton, setShowItemLeftButton] = useState(false);
  const [showItemRightButton, setShowItemRightButton] = useState(false);

  const updateButton = (ref, setShowLeftButton, setShowRightButton) => {
    const element = ref.current;
    if (!element) return;

    setShowLeftButton(element.scrollLeft > 0);
    setShowRightButton(
      element.scrollLeft + element.clientWidth < element.scrollWidth,
    );
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const element = cateScrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );
    };

    // Initial call
    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);

    // Add scroll event listener
    element.addEventListener("scroll", handleScroll);

    // Cleanup function
    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const element = shopScrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );
    };

    // Initial call
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);

    // Add scroll event listener
    element.addEventListener("scroll", handleScroll);

    // Cleanup function
    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center gap-5 overflow-y-auto bg-[#fff9f6]">
      <Nav />
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Inspiration for your first order
        </h1>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaChevronLeft />
            </button>
          )}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={cateScrollRef}
          >
            {categories?.map((cate, index) => (
              <CategoryCard
                name={cate.category}
                image={cate.image}
                key={index}
              />
            ))}
          </div>
          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
      <div className="w-full max-w-6xl flex flex-col gap-5 item-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Best shop in {city}
        </h1>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaChevronLeft />
            </button>
          )}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={shopScrollRef}
          >
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index} />
            ))}
          </div>
          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 item-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Suggested Food Items
        </h1>
        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {itemsInCity?.map((item, index) => (
            <FoodCart key={index} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
