export interface LoginCredentials {
  email: string;
  password: string;
}
export interface ForgotPasswordCredentials {
  email: string;
}
export interface UserResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    isVerified: boolean;
  };
}

export interface ResetPasswordCredentials {
  email: string;
  code: string;
  newPassword: string;
}
export interface ResetPasswordResponse {
  statusCode: number;
  message: string;
  data: {
    email: string;
    updatedAt: string;
  };
}

export interface ResetPasswordError {
  statusCode: number;
  message: string;
  errors?: string[];
}
