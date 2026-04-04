import { configureStore } from "@reduxjs/toolkit";
import userSlice from '../Redux/userSlice'
import ownerSlice from '../Redux/ownerSlice'
const store = configureStore({
    reducer: {
        user: userSlice,
        owner: ownerSlice,
    }
})

export default store;