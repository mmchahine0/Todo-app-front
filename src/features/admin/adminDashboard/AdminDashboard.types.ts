export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  suspended: boolean;
  createdAt: string;
}

export interface UsersResponse {
  statusCode: number;
  message: string;
  data: User[];
  pagination: PaginationMetadata;
}

export interface PaginationMetadata {
  nextPage: number | null;
  totalItems: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
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
