import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  id?: string;  // Make id optional
  accessToken: string;
  _initialized: boolean;
}

const initialState: AuthState = {
  accessToken: "",
  _initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      if (action.payload.id) state.id = action.payload.id;
      state.accessToken = action.payload.accessToken;
    },
    clearCredentials: (state) => {
      state.id = "";
      state.accessToken = "";
    },
    setInitialized: (state) => {
      state._initialized = true;
    },
  },
});

export const { setCredentials, clearCredentials, setInitialized } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
