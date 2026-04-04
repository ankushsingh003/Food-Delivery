import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCity, setCurentAddress, setState } from "../Redux/userSlice";

const useGetCity = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const apikey = import.meta.env.VITE_GEOAPIKEY;
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const res = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`,
        );
        const cityName = res.data.results[0].city;
        const stateName = res.data.results[0].state;
        const addresss = res.data.results[0].formatted;
        dispatch(setState(stateName));
        dispatch(setCity(cityName));
        dispatch(setCurentAddress(addresss));
      } catch (error) {
        console.error("Error fetching city:", error);
      }
    });
  }, [dispatch]);
};

export default useGetCity;
