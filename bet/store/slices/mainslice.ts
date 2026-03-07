import { createSlice } from "@reduxjs/toolkit";

interface StoreState {
  logged: boolean;
  played: {
    id: string;
      gId: string;
      gTCountry: string;
      gSubtitle: string;
      mktT: string;
      mTime: string;
      hometeam: string;
      awayteam: string;
      odd: string;
      selection: string;
      mStatus: string;
      mResult: string;
      mOutcome: string;
      mScore: string;
  }[];
  me: {
    userID: string;
    fname: string;
    lname: string;
    email: string;
    mobile: string;
    accbal: string;
    currency: string;
    rating: string;
    sub: string;
    TGames: string;
    TWon: string;
    TLost: string;
    nickname: string;
    jdate: string;
  },
  buttonState: {[key: string]: boolean}
}

const storeS: StoreState = {
  logged: false,
  played: [],
  me: {
    userID: '',
    fname: '',
    lname: '',
    email: '',
    mobile: '',
    accbal: '',
    currency: 'N',
    rating: '',
    sub: '',
    TGames: '',
    TWon: '',
    TLost: '',
    nickname: '',
    jdate: '',
  },
  buttonState: {'': false},
}


const mainSlice = createSlice({
    name: "mainState",
    initialState: storeS,
    reducers: {
        mainStateReducer: (state, action) => {
            state.logged = action.payload.logged;
            state.played = action.payload.played;
            state.me = action.payload.me;
            state.buttonState = action.payload.buttonState;
        }
    }
});

export const { mainStateReducer } = mainSlice.actions;
export default mainSlice.reducer;
