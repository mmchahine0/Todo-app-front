import React from 'react';
import Layout from "@/features/sidebar/Layout";
import DynamicPageContent from './DynamicPageContent';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/persist/persist';
import { useQuery } from '@tanstack/react-query';
import { getAllPages } from '@/features/admin/adminLayoutCreation/LayoutCreation.services';
import { RouteConfig } from "../RoutesConfig";

const useDynamicRoutes = () => {
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  
  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: () => getAllPages(accessToken),
    enabled: !!accessToken,
  });

  const dynamicRoutes: RouteConfig[] = React.useMemo(() => {
    if (!pages?.data) return [];
    return pages.data.map((page) => ({
      path: page.path,
      component: () =><DynamicPageContent page={page} />,
      layout: Layout,
      protected: true
    }));
  }, [pages?.data]);

  return {
    dynamicRoutes,
    isLoading
  };
};

export default useDynamicRoutes;