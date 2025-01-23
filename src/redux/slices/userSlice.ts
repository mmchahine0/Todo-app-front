import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  username: string;
  email: string;
  role: string;
}
const initialState: UserState = {
  username: "",
  email: "",
  role: "",
};

const userSlice = createSlice({
  name: "userdata",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserState>) => {
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.role = action.payload.role;
    },
    clearUserData: (state) => {
      state.username = "";
      state.email = "";
      state.role = "";
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;
export const userReducer = userSlice.reducer;
