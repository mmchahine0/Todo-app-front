import axios, { AxiosError } from "axios";
import { store } from "../redux/persist/persist"; 
import { clearCredentials } from "../redux/slices/authSlices"; 
import {clearUserData} from "../redux/slices/userSlice";
import {ENDPOINTS}from "./endpoints"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  method: HttpMethod;
  endpoint: string;
  data?: unknown;
  accessToken?: string;
  params?: unknown;
}

const BASE_URL = "http://localhost:3500/api/v1";


export const apiClient = async ({
  method,
  endpoint,
  data,
  params,
  accessToken,
}: ApiOptions): Promise<unknown> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let url = `${BASE_URL}${endpoint}`;

  if (params && method === "GET") {
    const queryString = new URLSearchParams(params as string).toString();
    url += `?${queryString}`;
  }

  const options = {
    method,
    url,
    headers,
    params,
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Check if error is due to token expiration (401 status)
      if (axiosError.response?.status === 401) {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken; 

        if (!refreshToken) {
          store.dispatch(clearCredentials());
          store.dispatch(clearUserData());
          throw error;
        }

        try {
          // Attempt to refresh the access token
          const newAccessToken = await refreshAccessToken(refreshToken);
          
          // Retry the original request with new access token
          const retryOptions = {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          };

          const retryResponse = await axios(retryOptions);
          return retryResponse.data;
        } catch (refreshError) {
          if (axios.isAxiosError(refreshError)) {
            const refreshAxiosError = refreshError as AxiosError;
            
            // If refresh token has expired, clear auth state
            if (
              refreshAxiosError.response?.status === 401 &&
              refreshAxiosError.response?.data &&
              (refreshAxiosError.response.data as { message: string }).message === "Refresh token has expired"
            ) {
              store.dispatch(clearCredentials());
              store.dispatch(clearUserData());

            }
          }
          throw refreshError;
        }
      }
    }
    
    if (error instanceof Error) {
      console.error("API Error:", error.message);
    } else {
      console.error("API Error:", "An unknown error occurred");
    }
    throw error;
  }
};

const refreshAccessToken  = async (data: string): Promise<string>=>{
  try {
    const response = await apiClient({
      method: "POST",
      endpoint: ENDPOINTS.Auth.RefreshToken,
      data
    });
    const accessToken = (response as { data: { accessToken: string } }).data.accessToken;
    if (!accessToken) {
      throw new Error("Access token not found in the refresh response");
    }
    return accessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw error;
  }}
  