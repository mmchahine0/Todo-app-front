import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbComponent } from "../common/breadcrumb/BreadcrumbComponent";
import { useState } from "react";
import { AppSidebar } from "../common/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { username, role } = useSelector((state: RootState) => state.userdata);
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard content */}
      <div className="flex-1 flex flex-col">
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="flex-shrink-0">
              <AppSidebar username={username} role={role} isOpen={open} />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col w-full">
              <div className="sticky top-0 flex items-center gap-2 p-4 border-b bg-white z-10">
                <SidebarTrigger />
                <BreadcrumbComponent />
              </div>
              {/* Page content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-full">{children || <Outlet />}</div>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
