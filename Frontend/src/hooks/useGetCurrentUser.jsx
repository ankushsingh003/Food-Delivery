import axios from "axios";
import React, { useEffect } from "react";

const useGetCurrentUser = () => {
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/user/current`, {
          withCredentials: true,
        });

        if (res.data.success) {
          console.log("Current user fetched:", res);
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Error fetching current user:", error.message);
        } else {
          console.log("User not authenticated");
        }
      }
    };

    fetchCurrentUser();
  }, []);
};

export default useGetCurrentUser;
