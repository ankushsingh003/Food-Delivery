import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <div className="flex min-w-screen min-h-screen items-center justify-center p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-4">
          <IoArrowBack
            size={30}
            className="text-[#ff4d2d] cursor-pointer "
            onClick={() => navigate("/signin")}
          />
          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            Forgot Password
          </h1>
        </div>
        {step == 1 && (
          <div className="mb-6">
            <div className="mb-4 flex flex-col mt-3">
              <label
                htmlFor="fullName"
                className="block font-bold text-gray-500 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-500/60 rounded-full px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#ff4d2d] px-2 py-2 rounded-full hover:bg-[#f63614] mt-4 text-white cursor-pointer transition-duration-200"
            >
              Send Otp
            </button>
          </div>
        )}

        {step == 2 && (
          <div className="mb-6">
            <div className="mb-4 flex flex-col mt-3">
              <label
                htmlFor="fullName"
                className="block font-bold text-gray-500 font-medium mb-1"
              >
                OTP
              </label>
              <input
                type="Email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-500/60 rounded-full px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter the otp"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#ff4d2d] px-2 py-2 rounded-full hover:bg-[#f63614] mt-4 text-white cursor-pointer transition-duration-200"
            >
              Verify
            </button>
          </div>
        )}

        {step == 3 && (
          <div className="mb-6">
            <div className="mb-4 flex flex-col mt-3">
              <label
                htmlFor="fullName"
                className="block font-bold text-gray-500 font-medium mb-1"
              >
                New Password
              </label>
              <input
                type="Email"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-500/60 rounded-full px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter the new password"
              />
            </div>
            <div className="mb-4 flex flex-col mt-3">
              <label
                htmlFor="fullName"
                className="block font-bold text-gray-500 font-medium mb-1"
              >
                Confirm Password
              </label>
              <input
                type="Email"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-500/60 rounded-full px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Confirm password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#ff4d2d] px-2 py-2 rounded-full hover:bg-[#f63614] mt-4 text-white cursor-pointer transition-duration-200"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
