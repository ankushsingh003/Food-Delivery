import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInCity } from "../Redux/userSlice";

const useGetItemByCity = () => {
  const dispatch = useDispatch();
  const { city } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (!city) return;
        const res = await axios.get(
          `http://localhost:8000/api/item/get-by-city/${city}`,
          { withCredentials: true },
        );
        console.log(res);
        dispatch(setItemsInCity(res.data.items));
      } catch (error) {
        console.log(error);
      }
    };
    fetchItem();
  }, [city]);
};

export default useGetItemByCity;
