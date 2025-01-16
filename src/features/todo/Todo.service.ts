import { apiClient } from "../../api/base";
import {
  Todo,
  TodosResponse,
  TodoResponse,
  TodoInput,
  PaginationParams,
} from "./Todo.types";
import { ENDPOINTS } from "../../api/endpoints";

export const getTodosByUserId = async (
  accessToken: string,
  { page = 1, limit = 10, status }: PaginationParams & { status?: string }
): Promise<TodosResponse> => {
  const response = await apiClient({
    method: "GET",
    endpoint: `${ENDPOINTS.Todos.Base}?page=${page}&limit=${limit}${
      status ? `&status=${status}` : ""
    }`,
    accessToken,
  });
  return response as TodosResponse;
};
export const createTodo = async (
  todoData: TodoInput,
  accessToken: string
): Promise<Todo> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Todos.Base,
    data: todoData,
    accessToken,
  });
  return (response as TodoResponse).data;
};

export const updateTodo = async (
  todoId: string,
  todoData: TodoInput,
  accessToken: string
): Promise<TodoInput> => {
  const response = await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Todos.ById(todoId),
    data: todoData,
    accessToken,
  });
  return (response as TodoResponse).data;
};

export const deleteTodo = async (
  todoId: string,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "DELETE",
    endpoint: ENDPOINTS.Todos.ById(todoId),
    accessToken,
  });
};
