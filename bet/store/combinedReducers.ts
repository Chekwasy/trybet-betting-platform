import { combineReducers } from "@reduxjs/toolkit";
import mainSlice from "./slices/mainslice";
import betSlice from "./slices/betslice";

const combinedReducers = combineReducers({
    mainSlice,
    betSlice,
}); 
export default combinedReducers;