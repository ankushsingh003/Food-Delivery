import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../Redux/ownerSlice";

const useGetMyShop = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const getMyShop = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/shop/get-my`, {
          withCredentials: true,
        });
        if (res.data.success) {
          console.log("Shop data fetched:", res.data.shop);
          dispatch(setMyShopData(res.data.shop));
        }
      } catch (error) {
        console.log("Error fetching shop:", error);
      }
    };
    getMyShop();
  }, [dispatch]);
};

export default useGetMyShop;
