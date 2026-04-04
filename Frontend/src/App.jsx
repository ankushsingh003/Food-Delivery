import React from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import Home from "./pages/Home";
import { useSelector } from "react-redux";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";

function App() {
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  const { userData } = useSelector((state) => state.user);
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
      </Routes>
    </>
  );
}

export default App;
