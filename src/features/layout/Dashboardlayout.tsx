import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbComponent } from "../breadcrumb/BreadcrumbComponent";
import { useState } from "react";
import { AppSidebar } from "../sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar.component";
import Footer from "../footer/Footer.component";
import { useQuery } from "@tanstack/react-query";
import { getContent } from "../admin/adminHomeEditLayout/AdminLayout.services";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { username, role } = useSelector((state: RootState) => state.userdata);
  const [open, setOpen] = useState(true);
  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );
  // Get navbar data
  const { data } = useQuery({
    queryKey: ["content"],
    queryFn: () => getContent(""),
    enabled: !!accessToken,
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard content */}
      <div className="flex-1 flex flex-col">
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <div className="flex flex-1">
            {/* Sidebar */}
            <div className="flex-shrink-0">
              <AppSidebar username={username} role={role} isOpen={open} />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col sticky top-0 z-50 backdrop-blur-sm">
              {/* Navbar */}

              <Navbar customLinks={data?.data?.navbar || []} />

              {/* Breadcrumb - sticky */}
              <div className="sticky top-0 flex items-center gap-2 p-4 border-b bg-white z-10">
                <SidebarTrigger />
                <BreadcrumbComponent />
              </div>
              {/* Page content */}
              <div className="flex-1 p-2">{children || <Outlet />}</div>
              {/* Footer */}

              <Footer content={data?.data?.footer || { links: [] }} />
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
