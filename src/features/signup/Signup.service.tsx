import { apiClient } from "../../api/base";
import { SignupCredentials } from "./Signup.types";
import { ENDPOINTS } from "../../api/endpoints";

export const signup = async (credentials: SignupCredentials) => {
  await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Auth.Signup,
    data: credentials,
  });
};
