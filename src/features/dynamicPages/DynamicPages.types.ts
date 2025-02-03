// Basic component props
interface ComponentProps {
  content: string;
  className?: string;
}

// Component configuration
interface ComponentConfig {
  type: "text" | "heading";
  props: ComponentProps;
}

// Page content structure
interface PageContent {
  layout: string;
  components: ComponentConfig[];
  isProtected?: boolean
}

// Route interface
interface Route {
  path: string;
  name: string;
}

// Complete page structure
interface DynamicPage {
  id: string;
  title: string;
  path: string;
  content: PageContent;
  isPublished: boolean;
  userId: string;
  layout: string;
  isProtected: boolean;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
}

// Component props interface
interface DynamicPageContentProps {
  page: DynamicPage;
}

// API response interface
interface DynamicPagesResponse {
  statusCode: number;
  message: string;
  data: DynamicPage[];
}

// Create page input interface
interface CreatePageInput {
  title: string;
  path: string;
  content: PageContent;
  isProtected: boolean
  admin: boolean
}

export type {
  ComponentProps,
  ComponentConfig,
  PageContent,
  Route,
  DynamicPage,
  DynamicPageContentProps,
  DynamicPagesResponse,
  CreatePageInput,
};
