import { apiClient } from "@/api/base";
import {
  ForgotPasswordCredentials,
  LoginCredentials,
  ResetPasswordCredentials,
  ResetPasswordResponse,
  UserResponse,
} from "./Signin.types";
import { ENDPOINTS } from "@/api/endpoints";

export const login = async (data: LoginCredentials): Promise<UserResponse> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Auth.Signin,
    data,
  });
  return response as UserResponse;
};

export const requestPasswordReset = async (
  data: ForgotPasswordCredentials
): Promise<{ message: string }> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Auth.ForgotPassword,
    data,
  });
  return response as { message: string };
};
export const resetPassword = async (
  data: ResetPasswordCredentials
): Promise<ResetPasswordResponse> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Auth.ResetPassword,
    data,
  });
  return response as ResetPasswordResponse;
};
