import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  username: string;
  email:string
}
const initialState: UserState = {
    username: "",
    email:""
};

const userSlice = createSlice({
  name: "userdata",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserState>) => {
      state.username = action.payload.username;
      state.email = action.payload.email;

    },
    clearUserData: (state) => {
      state.username = "";
      state.email=";"
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;
export const userReducer = userSlice.reducer;
