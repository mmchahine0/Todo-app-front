export interface Todo {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  completed: boolean;
}
export interface TodoInput {
  title: string;
  content: string;
  completed: boolean;
}

export interface TodosResponse {
  statusCode: number;
  message: string;
  data: Todo[];
  pagination: PaginationMetadata;
}

export interface TodoResponse {
  statusCode: number;
  message: string;
  data: Todo;
}
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMetadata {
  nextPage: number | null;
  totalItems: number;
}

export interface StatusMessage {
  type: "success" | "error" | "info";
  message: string;
}

export interface DeleteDialogState {
  isOpen: boolean;
  todoId: string;
  todoTitle: string;
}
