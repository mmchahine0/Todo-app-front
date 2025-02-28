export interface Todo {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  completed: boolean;
  collaborators?: TodoCollaborator[];
  comments?: TodoComment[];
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

export interface TodoCollaborator {
  id: string;
  todoId: string;
  userId: string;
  addedAt: string;
}

export interface TodoComment {
  id: string;
  todoId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  userId: string;
  todoId: string | null;
  createdAt: string;
}

export interface CollaboratorInput {
  collaboratorId: string;
}

export interface CommentInput {
  content: string;
}
export interface TodoCommentsResponse {
  statusCode: number;
  message: string;
  data: TodoComment[];
}

export interface NotificationsResponse {
  statusCode: number;
  message: string;
  data: Notification[];
}