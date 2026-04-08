import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData, clearMyShopData } from "../Redux/ownerSlice";

const useGetMyShop = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    // Only fetch shop data if user is logged in and is an owner
    if (!userData || userData.role !== "owner") {
      dispatch(clearMyShopData());
      return;
    }

    const getMyShop = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/shop/get-my`, {
          withCredentials: true,
        });
        if (res.data.success && res.data.shop) {
          console.log("Shop data fetched:", res.data.shop);
          dispatch(setMyShopData(res.data.shop));
        } else {
          // No shop found for this owner
          console.log("No shop found");
          dispatch(clearMyShopData());
        }
      } catch (error) {
        console.log("Error fetching shop:", error);
        // Clear shop data on error (no shop found)
        dispatch(clearMyShopData());
      }
    };
    getMyShop();
  }, [dispatch, userData]);
};

export default useGetMyShop;
