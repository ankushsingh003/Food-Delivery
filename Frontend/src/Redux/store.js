import { configureStore } from "@reduxjs/toolkit";
import userSlice from '../Redux/userSlice'
import ownerSlice from '../Redux/ownerSlice'
import mapSlice from '../Redux/mapSlice'
const store = configureStore({
    reducer: {
        user: userSlice,
        owner: ownerSlice,
        map: mapSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['user/setSocket'],
                ignoredPaths: ['user.socket'],
            },
        }),
})

export default store;