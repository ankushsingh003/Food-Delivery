import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        currentUserRole: null,
        city: null,
        state: null,
        currentAddress: null,
        shopInMyCity: null,
        itemsInCity: null,
        cartItems: [],
        totalAmount: null,
        myOrders: [],
        searchItems: null,
        socket: null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        setCurrentUserRole: (state, action) => {
            state.currentUserRole = action.payload
        },
        setCity: (state, action) => {
            state.city = action.payload
        },
        setState: (state, action) => {
            state.state = action.payload
        },
        setCurentAddress: (state, action) => {
            state.currentAddress = action.payload
        },
        setShopInMyCity: (state, action) => {
            state.shopInMyCity = action.payload
        },
        setItemsInCity: (state, action) => {
            state.itemsInCity = action.payload
        },
        addToCart: (state, action) => {
            const cartItem = action.payload;
            const existingItem = state.cartItems.find(i => i.id == cartItem.id);
            if (existingItem) {
                existingItem.quantity += cartItem.quantity
            }
            else {
                state.cartItems.push(cartItem)
            }
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cartItems.find(i => i.id == id);
            if (item) {
                item.quantity = quantity
            }
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        },
        removeFromCart: (state, action) => {
            const id = action.payload;
            state.cartItems = state.cartItems.filter(i => i.id != id);
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        },

        setMyOrders: (state, action) => {
            state.myOrders = action.payload
        },

        addMyOrders: (state, action) => {
            state.myOrders = [action.payload, ...state.myOrders]
        },
        updateOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(o => o._id === orderId);
            if (order && order.shopOrders) {
                const shopOrder = order.shopOrders.find(so => so._id === shopId);
                if (shopOrder) {
                    shopOrder.status = status;
                }
            }
        },
        updateRealTimeOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(o => o._id === orderId);
            if (order) {
                const shopOrder = order.shopOrders.find(so => so._id === shopId)

                if (shopOrder) {
                    shopOrder.status = status
                }
            }
        },

        setSerachItems: (state, action) => {
            state.searchItems = action.payload
        },
        setSocket: (state, action) => {
            state.socket = action.payload
        }
    }
})
export const { setUserData, setCurrentUserRole, setCity, setState, setCurentAddress, setShopInMyCity, setItemsInCity, addToCart, updateQuantity, removeFromCart, setMyOrders, addMyOrders, updateOrderStatus, setSerachItems, setSocket, updateRealTimeOrderStatus } = userSlice.actions
export default userSlice.reducer;