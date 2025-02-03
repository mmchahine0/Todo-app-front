import React from "react";
import DynamicPageContent from "../features/dynamicPages/DynamicPageContent.component";
import { useQuery } from "@tanstack/react-query";
import { getAllPages } from "@/features/admin/adminLayoutCreation/LayoutCreation.services";
import { RouteConfig } from "../routes/RoutesConfig";

const useDynamicRoutes = () => {


  const { data: pages, isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: () => getAllPages(),
  });

  const dynamicRoutes: RouteConfig[] = React.useMemo(() => {
    if (!pages?.data) return [];

    return pages.data.map((page) => {
      let layout: "auth" | "base" | "dashboard" | undefined = "base"; // Default layout
      let protectedRoute = false; // Default protection

      // Determine layout and protection based on path
      if (page.path.startsWith("/dashboard/admin")) {
        layout = "dashboard";
        protectedRoute = true; 
      } else if (page.path.startsWith("/dashboard")) {
        layout = "dashboard";
        protectedRoute = true; 
      } else if (page.path.startsWith("/")) {
        layout = "base";
        protectedRoute = false;
      }

      return {
        path: page.path,
        component: () => <DynamicPageContent page={page} />,
        layout: layout, // Ensure layout is one of the allowed values
        isProtected: protectedRoute,
      };
    });
  }, [pages?.data]);

  return {
    dynamicRoutes,
    isLoading,
  };
};

export default useDynamicRoutes;