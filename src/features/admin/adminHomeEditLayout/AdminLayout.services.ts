import { apiClient } from "../../../api/base";
import { ENDPOINTS } from "../../../api/endpoints";
import { ContentResponse, SiteContent } from "./AdminLayout.types";

export const getContent = async (
  accessToken: string
): Promise<ContentResponse> => {
  return (await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Content.Get,
    accessToken,
  })) as ContentResponse;
};

export const updateContent = async (
  section: string,
  content: Partial<SiteContent>,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Content.Update(section),
    data: content,
    accessToken,
  });
};