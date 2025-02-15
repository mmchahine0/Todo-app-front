import { apiClient } from "@/api/base";
import {
  SignupCredentials,
  VerificationCredentials,
  ServerResponse,
} from "./Signup.types";
import { ENDPOINTS } from "@/api/endpoints";

export const signup = async (
  credentials: SignupCredentials
): Promise<ServerResponse> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Auth.Signup,
    data: credentials,
  });
  return response as ServerResponse;
};

export const verifyEmail = async (
  data: VerificationCredentials
): Promise<ServerResponse> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Auth.VerifyEmail,
    data,
  });
  return response as ServerResponse;
};

export const resendVerificationCode = async (
  email: string
): Promise<ServerResponse> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Auth.ResendCode,
    data: { email },
  });
  return response as ServerResponse;
};
