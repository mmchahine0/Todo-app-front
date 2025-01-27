import { AppSidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbComponent } from "./BreadcrumbComponent";
import { useState } from "react";

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { username, role } = useSelector((state: RootState) => state.userdata);
  const [open, setOpen] = useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <AppSidebar username={username} role={role} isOpen={open} />
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 p-4 border-b fixed w-full h-16 md:h-16 bg-white">
            <SidebarTrigger />
            <BreadcrumbComponent />
          </div>

          {/* Page content */}
          <main className="pt-16 p-2">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}