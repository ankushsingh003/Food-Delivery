import React, { useEffect } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import Home from "./pages/Home";
import { useDispatch, useSelector } from "react-redux";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddFoodItem from "./pages/AddFoodItem";
import EditItem from "./pages/EditItem";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrder from "./pages/MyOrder";
import useGetMyOrder from "./hooks/useGetMyOrder";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrder from "./pages/TrackOrder";
import Shop from "./pages/Shop";
import { setSocket } from "./Redux/userSlice";
import { io } from "socket.io-client";

export const severUrl = "http://localhost:8000";

function App() {
  const dispatch = useDispatch();

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetMyOrder();
  useUpdateLocation();

  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const socketInstance = io(severUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));
    socketInstance.on("connect", (socket) => {
      console.log("connected to server", socket);
      if (userData) {
        socketInstance.emit("identity", { userId: userData._id });
      }
    });
    return () => socketInstance.disconnect();
  }, [userData?._id]);

  return (
    <>
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <Signup /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signin"
          element={!userData ? <Signin /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/create-edit-shop"
          element={
            userData ? <CreateEditShop /> : <Navigate to={"/signin"}></Navigate>
          }
        />
        <Route
          path="/add-food"
          element={
            userData ? <AddFoodItem /> : <Navigate to={"/signin"}></Navigate>
          }
        />
        <Route
          path="/edit-item/:itemId"
          element={
            userData ? <EditItem /> : <Navigate to={"/signin"}></Navigate>
          }
        />
        <Route
          path="/cart"
          element={
            userData ? <CartPage /> : <Navigate to={"/signin"}></Navigate>
          }
        />
        <Route
          path="/check-out"
          element={
            userData ? <CheckOut /> : <Navigate to={"/signin"}></Navigate>
          }
        />
        <Route
          path="/order-placed"
          element={
            userData ? <OrderPlaced /> : <Navigate to={"/signin"}></Navigate>
          }
        />
        <Route
          path="/my-orders"
          element={
            userData ? <MyOrder /> : <Navigate to={"/signin"}></Navigate>
          }
        />
        <Route
          path="/track-order/:orderId"
          element={
            userData ? <TrackOrder /> : <Navigate to={"/signin"}></Navigate>
          }
        />
        <Route
          path="/shop/:shopId"
          element={userData ? <Shop /> : <Navigate to={"/signin"}></Navigate>}
        />
      </Routes>
    </>
  );
}

export default App;
