import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "@/features/notFound/notFound";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminProtectedRoutes";
import {
  publicRoutes,
  protectedRoutes,
  adminRoutes,
  RouteConfig,
} from "./RoutesConfig";
import useDynamicRoutes from "../hooks/use-dynamic-pages-routes";
import { DashboardLayout } from "../components/layout/Dashboardlayout";
import { BaseLayout } from "../components/layout/Baselayout";
import { AuthLayout } from "../components/layout/Authlayout";

// Layout mapping object
const layoutComponents = {
  base: BaseLayout,
  dashboard: DashboardLayout,
  auth: AuthLayout,
};

const MainRouter: React.FC = () => {
  const { dynamicRoutes, isLoading } = useDynamicRoutes();

  if (isLoading) {
    return (
      <div
        role="alert"
        aria-busy="true"
        className="fixed inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD65A] border-t-[#16C47F]"
          aria-label="Loading content"
        />
        <span className="sr-only">Loading page content...</span>
      </div>
    );
  }

  // For static routes
  const renderRoute = (route: RouteConfig) => {
    const Component = route.component;
    let element = <Component />;
    // Apply protection
    if (route.admin == true) {
      element = <AdminRoute>{element}</AdminRoute>;
    } else if (route.isProtected == true) {
      element = <ProtectedRoute>{element}</ProtectedRoute>;
    }
    // Apply layout if specified
    if (route.layout) {
      const LayoutComponent = layoutComponents[route.layout];
      if (LayoutComponent) {
        element = <LayoutComponent>{element}</LayoutComponent>;
      }
    }

    return <Route key={route.path} path={route.path} element={element} />;
  };

  // For dynamic routes
  const renderDynamicRoute = (route: RouteConfig) => {
    const Component = route.component;
    let element = <Component />;

    // Check path pattern for layout and protection
    if (route.path.startsWith("/dashboard/admin")) {
      element = (
        <AdminRoute>
          <DashboardLayout>{element}</DashboardLayout>
        </AdminRoute>
      );
    } else if (route.path.startsWith("/dashboard")) {
      element = (
        <ProtectedRoute>
          <DashboardLayout>{element}</DashboardLayout>
        </ProtectedRoute>
      );
    } else if (route.path.startsWith("/")) {
      element = <BaseLayout>{element}</BaseLayout>;
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
        {dynamicRoutes.map(renderDynamicRoute)}

        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;
