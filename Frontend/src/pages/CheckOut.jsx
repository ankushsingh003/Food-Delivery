import React, { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { TbCurrentLocation, TbLockAccess } from "react-icons/tb";
import { IoLocation } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../Redux/mapSlice";
import axios from "axios";
import { MdDeliveryDining } from "react-icons/md";
import { GiSmartphone } from "react-icons/gi";
import { FaCreditCard } from "react-icons/fa";
import { addMyOrders } from "../Redux/userSlice";

function RecenterMap({ location }) {
  const map = useMap();
  if (location && location.lat != null && location.lon != null) {
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector(
    (state) => state.user,
  );

  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const deliveryFee = totalAmount > 500 ? 0 : 50;
  const totalAmountWithDelivery = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatlng(lat, lng);
  };

  const getAddressByLatlng = async (lat, lng) => {
    try {
      const apikey = import.meta.env.VITE_GEOAPIKEY;
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apikey}`,
      );
      dispatch(setAddress(res.data.results[0].formatted));
    } catch (error) {
      console.log(error);
    }
  };

  const getlatlngByAddress = async () => {
    try {
      const apikey = import.meta.env.VITE_GEOAPIKEY;
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apikey}`,
      );
      const lat = res.data.features[1].properties.lat;
      const lon = res.data.features[1].properties.lon;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.log(error);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount: totalAmountWithDelivery,
          cartItems,
        },
        { withCredentials: true },
      );
      console.log(res.data);
      if (paymentMethod === "cod") {
        dispatch(addMyOrders(res.data.newOrder));
        navigate("/order-placed");
      } else {
        const orderId = res.data.orderId;
        const razorOrder = res.data.razorOrder;
        openRazorpayWindow(orderId, razorOrder);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_API_KEY,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Food Delivery",
      description: "Online Food Order",
      image: "",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const res = await axios.post(
            `http://localhost:8000/api/order/verify-payment`,
            {
              razorpayPaymentId: response.razorpay_payment_id,
              orderId,
            },
            {
              withCredentials: true,
            },
          );
          console.log(res.data);
          dispatch(addMyOrders(res.data.order));
          navigate("/order-placed");
        } catch (error) {
          console.log(error);
        }
      },
      prefill: {
        name: userData.name,
        email: userData.email,
        contact: userData.phone,
      },
      notes: {
        address: addressInput,
      },
      theme: {
        color: "#ff4d2d",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  const getCurrentLocation = () => {
    const latitude = userData.location.coordinates[1];
    const longitude = userData.location.coordinates[0];
    dispatch(setLocation({ lat: latitude, lon: longitude }));
    getAddressByLatlng(latitude, longitude);
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div
        className="absolute top-[20px] left-[20px] z-[19]"
        onClick={() => navigate("/cart")}
      >
        <IoMdArrowRoundBack size={25} className="text-[#ff4d2d]" />
      </div>
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6 ">
        <h1 className="text-2xl font-bold text-gray-800">CheckOut</h1>
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center text-gray-800">
            <IoLocation className="text-[#ff4d2d]" /> Delivery Location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter your delivery location"
            />
            <button
              className="bg-[#ff4d2d] hover:bg-[#e65426] text-white px-3 py-2 rounded-lg flex items-center justify-between"
              onClick={() => getlatlngByAddress()}
            >
              <IoSearchOutline />
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-between"
              onClick={() => getCurrentLocation()}
            >
              <TbCurrentLocation />
            </button>
          </div>
          {/* map section */}
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              <MapContainer
                className={`w-full h-full`}
                center={[location?.lat || 20.5937, location?.lon || 78.9629]}
                scrollWheelZoom={false}
                zoom={16}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker
                  position={[
                    location?.lat || 20.5937,
                    location?.lon || 78.9629,
                  ]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                ></Marker>
              </MapContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center text-gray-800">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "cod" ? "border[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-10 w-10 rounded-full items-center justify-center bg-green-100">
                <MdDeliveryDining size={20} className="text-green-600" />
              </span>
              <div>
                <p className="font-medium text-gray-800">Cash On Delivery</p>
                <p className="text-xs text-gray-500">
                  Pay when your food arrives
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "online" ? "border[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-10 w-10 rounded-full items-center justify-center bg-purple-100">
                <GiSmartphone size={20} className="text-purple-700" />
              </span>
              <span className="inline-flex h-10 w-10 rounded-full items-center justify-center bg-blue-100">
                <FaCreditCard size={20} className="text-blue-600" />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  UPI/ Credit/ Debit Card
                </p>
                <p className="text-xs text-gray-500">Pay securly online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Order Summary
          </h2>
          <div className="rounded-xl border bg-gray-50 space-y-2 p-1">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm text-gray-700"
              >
                <img
                  src={item.image}
                  alt=""
                  className="w-12 h-12 border object-cover cursor-not-allowed flex flex-start rounded-lg "
                />
                <span className="items-start">
                  {item.name} x {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-200 my-2" />
            <div className="flex justify-between font-medium text-gray-800">
              <span>SubTotal</span>
              <span>{totalAmount}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-800">
              <span>Delivery Fee</span>
              <span>{deliveryFee == 0 ? "Free" : deliveryFee}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
              <span>Total</span>
              <span>{totalAmountWithDelivery}</span>
            </div>
          </div>
        </section>
        <div>
          <button
            className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold"
            onClick={() => handlePlaceOrder()}
          >
            {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
