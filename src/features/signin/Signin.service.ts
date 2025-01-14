import { apiClient } from "@/api/base";
import { LoginCredentials,UserResponse } from "./Signin.types";
import { ENDPOINTS } from "@/api/endpoints";

export const login = async (data: LoginCredentials): Promise<UserResponse>=>{
const response = await apiClient({
    method:"POST",
    endpoint: ENDPOINTS.Auth.Signin,
    data
})
return response as UserResponse;
}; 



