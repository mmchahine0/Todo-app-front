import axios from "axios";
import { store } from "../redux/persist/persist";
import { clearCredentials, setCredentials } from "../redux/slices/authSlices";
import { clearUserData } from "../redux/slices/userSlice";
import { ENDPOINTS } from "../api/endpoints";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  method: HttpMethod;
  endpoint: string;
  data?: unknown;
  accessToken?: string;
  params?: unknown;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

axios.defaults.withCredentials = true;

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

  const options = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers,
    params,
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (error.response.data as { message: string }).message.includes(
        "Unauthorized: Token has expired"
      )
    ) {
      try {
        const { id: userId } = store.getState().auth;

        const response = await axios.post(
          `${BASE_URL}${ENDPOINTS.Auth.RefreshToken}`,
          {},
          { withCredentials: true }
        );

        const { accessToken: newAccessToken } = response.data.data;

        store.dispatch(
          setCredentials({
            accessToken: newAccessToken,
            id: userId,
            _initialized: true,
          })
        );
        window.location.reload();
        return response.data;
      } catch (refreshError) {
        console.error("Refresh token error:", refreshError);
        store.dispatch(clearCredentials());
        store.dispatch(clearUserData());
        throw refreshError;
      }
    }
    throw error;
  }
};
