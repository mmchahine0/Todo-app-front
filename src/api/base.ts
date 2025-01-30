import axios from "axios";
import { store } from "../redux/persist/persist";
import { clearCredentials } from "../redux/slices/authSlices";
import { clearUserData } from "../redux/slices/userSlice";
import { setCredentials } from "../redux/slices/authSlices";
import { ENDPOINTS } from "../api/endpoints";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  method: HttpMethod;
  endpoint: string;
  data?: unknown;
  accessToken?: string;
  params?: unknown;
}

const BASE_URL = "http://localhost:3500/api/v1";

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
        "Token has expired"
      )
    ) {
      try {
        // Attempt to refresh using httpOnly cookie
        const response = await axios.post(
          `${BASE_URL}${ENDPOINTS.Auth.RefreshToken}`,
          {},
          { withCredentials: true }
        );

        const { accessToken: newAccessToken, user } = response.data.data;

        // Update store with new token
        store.dispatch(
          setCredentials({
            accessToken: newAccessToken,
            id: user.id,
            _initialized: true,
          })
        );

        // Retry original request
        const retryResponse = await axios({
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
        return retryResponse.data;
      } catch (refreshError) {
        // Clear auth state on refresh failure
        store.dispatch(clearCredentials());
        store.dispatch(clearUserData());
        throw refreshError;
      }
    }
    throw error;
  }
};
