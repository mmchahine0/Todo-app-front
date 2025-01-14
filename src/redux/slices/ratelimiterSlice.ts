import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RateLimitState {
  attempts: number;
  windowStart: number;
}

const initialState: Record<string, RateLimitState> = {};

const rateLimitSlice = createSlice({
  name: "rateLimit",
  initialState,
  reducers: {
    setRateLimit: (
      state, 
      action: PayloadAction<{
        key: string;
        attempts: number;
        windowStart: number;
      }>
    ) => {
      const { key, attempts, windowStart } = action.payload;
      state[key] = { attempts, windowStart };
    },
    resetRateLimit: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    }
  }
});

export const { setRateLimit, resetRateLimit } = rateLimitSlice.actions;
export const rateLimitReducer = rateLimitSlice.reducer;