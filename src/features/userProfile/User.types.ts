export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdateInput {
  name?: string;
  email?: string;
  role?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserResponse {
  statusCode: number;
  message: string;
  data: User;
}

export interface DeleteAccountInput {
  password: string;
}

export interface APIError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message: string;
}
