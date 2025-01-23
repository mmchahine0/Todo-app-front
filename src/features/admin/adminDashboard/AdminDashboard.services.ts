import { apiClient } from "../../../api/base";
import { UsersResponse } from "../adminDashboard/AdminDashboard.types";
import { ENDPOINTS } from "../../../api/endpoints";

export const getAllUsers = async (
  accessToken: string,
  { page = 1, limit = 10 }
): Promise<UsersResponse> => {
  const response = await apiClient({
    method: "GET",
    endpoint: `${ENDPOINTS.Admin.Users}?page=${page}&limit=${limit}`,
    accessToken,
  });
  return response as UsersResponse;
};

export const updateUserRole = async (
  userId: string,
  makeAdmin: boolean,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "PUT",
    endpoint: makeAdmin
      ? ENDPOINTS.Admin.MakeAdmin(userId)
      : ENDPOINTS.Admin.RevokeAdmin(userId),
    accessToken,
  });
};

export const updateUserStatus = async (
  userId: string,
  suspend: boolean,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "PUT",
    endpoint: suspend
      ? ENDPOINTS.Admin.Suspend(userId)
      : ENDPOINTS.Admin.Unsuspend(userId),
    accessToken,
  });
};
