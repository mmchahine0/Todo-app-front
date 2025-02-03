import { apiClient } from "../../../api/base";
import { ENDPOINTS } from "../../../api/endpoints";
import {
  CreatePageInput,
  DynamicPagesResponse,
  Route,
} from "../../dynamicPages/DynamicPages.types";

export const getAllRoutes = async (accessToken: string): Promise<Route[]> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Admin.Pages.GetRoutes,
    accessToken,
  });
  return response as Route[];
};

export const getAllPages = async (): Promise<DynamicPagesResponse> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Admin.Pages.List,
  });
  return response as DynamicPagesResponse;
};

export const getPublishedPages = async (
  accessToken: string
): Promise<DynamicPagesResponse> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Admin.Pages.Published,
    accessToken,
  });
  return response as DynamicPagesResponse;
};
export const createPage = async (
  data: CreatePageInput,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Admin.Pages.Create,
    data,
    accessToken,
  });
};

export const updatePage = async (
  id: string,
  data: Partial<CreatePageInput>,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Admin.Pages.Update(id),
    data,
    accessToken,
  });
};

export const deletePage = async (
  id: string,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "DELETE",
    endpoint: ENDPOINTS.Admin.Pages.Delete(id),
    accessToken,
  });
};
