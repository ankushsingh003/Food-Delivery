import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        city: null,
        state: null,
        currentAddress: null,
        shopInMyCity: null,
        itemsInCity: null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
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
        }
    }
})
export const { setUserData, setCity, setState, setCurentAddress, setShopInMyCity, setItemsInCity } = userSlice.actions
export default userSlice.reducer;