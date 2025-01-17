import { apiClient } from "../../api/base";
import { User, UserProfileUpdateInput, UserResponse } from "./User.types";
import { ENDPOINTS } from "../../api/endpoints";

export const getUserProfile = async (accessToken: string): Promise<User> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.User.Profile,
    accessToken,
  });
  return (response as UserResponse).data;
};

export const updateUserProfile = async (
  userData: UserProfileUpdateInput,
  accessToken: string
): Promise<User> => {
  const response = await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.User.Profile,
    data: userData,
    accessToken,
  });
  return (response as UserResponse).data;
};

export const deleteUserAccount = async (
  password: string,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "DELETE",
    endpoint: ENDPOINTS.User.Profile,
    data: { password },
    accessToken,
  });
};
