import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "@/features/notFound/notFound";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminProtectedRoutes";
import {
  publicRoutes,
  protectedRoutes,
  adminRoutes,
  RouteConfig
} from "./RoutesConfig";
import useDynamicRoutes from "./dynamicPages/DynamicPagesRoutes"

const MainRouter: React.FC = () => {
  const { dynamicRoutes, isLoading } = useDynamicRoutes();

  if (isLoading) {
    return  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>

  }

  const renderRoute = (route: RouteConfig) => {
    const Component = route.component;
    const LayoutComponent = route.layout;

    let element = <Component />;

    if (route.admin) {
      element = <AdminRoute>{element}</AdminRoute>;
    } else if (route.protected) {
      element = <ProtectedRoute>{element}</ProtectedRoute>;
    }

    if (LayoutComponent) {
      element = <LayoutComponent>{element}</LayoutComponent>;
    }

    return <Route key={route.path} path={route.path} element={element} />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(renderRoute)}

        {/* Protected Routes */}
        {protectedRoutes.map(renderRoute)}

        {/* Admin Routes */}
        {adminRoutes.map(renderRoute)}

        {/* Dynamic Routes */}
        {dynamicRoutes.map(renderRoute)}

        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/dashboard/home" replace />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;