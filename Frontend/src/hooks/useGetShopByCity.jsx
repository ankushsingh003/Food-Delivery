import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setShopInMyCity } from "../Redux/userSlice";

const useGetShopByCity = () => {
  const { city } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  useEffect(() => {
    // Only fetch if city is available
    if (!city) return;

    const fetchShops = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/shop/get-by-city/${city}`,
          { withCredentials: true },
        );
        console.log(res.data);
        dispatch(setShopInMyCity(res.data.shops));
      } catch (error) {
        console.log(error);
      }
    };
    fetchShops();
  }, [city, dispatch]);
};

export default useGetShopByCity;
