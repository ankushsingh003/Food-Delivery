import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCity, setCurentAddress, setState } from "../Redux/userSlice";
import { setAddress, setLocation } from "../Redux/mapSlice";

const useGetCity = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const hasRequestedLocation = useRef(false);

  useEffect(() => {
    // Prevent multiple requests
    if (hasRequestedLocation.current) return;
    hasRequestedLocation.current = true;

    const apikey = import.meta.env.VITE_GEOAPIKEY;

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      dispatch(setCity("Delhi")); // Fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          console.log(accuracy);

          dispatch(setLocation({ lat: latitude, lon: longitude }));

          const res = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`,
          );

          // Check if results exist and have data
          if (!res.data.results || res.data.results.length === 0) {
            dispatch(setCity("Delhi")); // Fallback
            return;
          }

          const firstResult = res.data.results[0];

          // Try to get the most specific location (prefer suburb/district over city)
          let cityName =
            firstResult.district || // Specific district/area
            firstResult.suburb || // Suburb
            firstResult.city || // City
            firstResult.town || // Town
            firstResult.state || // State
            "Delhi";

          const stateName = firstResult.state || "Unknown";
          const addresss = firstResult.formatted || "Unknown Address";

          dispatch(setState(stateName));
          dispatch(setCity(cityName));
          dispatch(setCurentAddress(addresss));
          dispatch(setAddress(addresss));
        } catch (error) {
          console.log(error);
          dispatch(setCity("Howrah")); // Fallback
        }
      },
      (error) => {
        console.log(error);
        dispatch(setCity("Howrah")); // Fallback city
      },
      {
        timeout: 20000, // Increased to 20 seconds
        enableHighAccuracy: true, // Request high accuracy
        maximumAge: 0, // Don't use cached position
      },
    );
  }, [dispatch]);
};

export default useGetCity;
