import {
  Calendar,
  ChevronUp,
  Home,
  Inbox,
  User2,
  Users,
  Laptop,
  HousePlus,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import * as sidebar from "@/components/ui/sidebar";
import * as dropdown from "@/components/ui/dropdown-menu";
import { AppSidebarProps } from "./Sidebar.types";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCredentials } from "@/redux/slices/authSlices";
import { clearUserData } from "@/redux/slices/userSlice";
import { queryClient } from "@/lib/queryClient";
import { useCallback, useEffect } from "react";

const userItems = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
    description: "Return to homepage",
  },
  {
    title: "Todo",
    url: "/dashboard/todo",
    icon: Inbox,
    description: "View and manage your tasks",
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: Calendar,
    description: "Manage your profile settings",
  },
];

const adminItems = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
    description: "Return to homepage",
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: Calendar,
    description: "Manage your profile settings",
  },
  {
    title: "Users Management",
    url: "/dashboard/admin/users",
    icon: Users,
    description: "Manage system users",
  },
  {
    title: "Layout Management",
    url: "/dashboard/admin/layout",
    icon: Laptop,
    description: "Customize site layout",
  },
  {
    title: "Home Management",
    url: "/dashboard/admin/layout/home",
    icon: HousePlus,
    description: "Manage homepage content",
  },
];

export function AppSidebar({ username, role, isOpen }: AppSidebarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (url: string) => {
    return location.pathname === url;
  };
  
  const handleSignOut = useCallback(async () => {
    try {
      await queryClient.clear();
      dispatch(clearCredentials());
      dispatch(clearUserData());
      navigate("/auth/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, [dispatch, navigate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Alt + H for Home
      if (e.altKey && e.key === "h") {
        e.preventDefault();
        navigate("/home");
      }
      // Alt + L for Logout
      if (e.altKey && e.key === "l") {
        e.preventDefault();
        handleSignOut();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [navigate, handleSignOut]);

  const sidebarItems = role === "ADMIN" ? adminItems : userItems;

  return (
    <aside
      className="flex h-full bg-[#16C47F]/5"
      role="navigation"
      aria-label="Main navigation sidebar"
    >
      <sidebar.Sidebar
        collapsible="icon"
        className="border-r border-[#16C47F]/10 bg-[#16C47F]/5"
        aria-expanded={isOpen}
      >
        <sidebar.SidebarContent className="bg-[#16C47F]/5">
          <sidebar.SidebarGroup>
            <sidebar.SidebarGroupLabel
              className="text-sm font-medium text-[#16C47F]"
              id="navigation-section"
            >
              Application
            </sidebar.SidebarGroupLabel>
            <sidebar.SidebarGroupContent
              className=""
              role="menu"
              aria-labelledby="navigation-section"
            >
              <sidebar.SidebarMenu>
                {sidebarItems.map((item) => (
                  <sidebar.SidebarMenuItem key={item.title} role="none">
                    <sidebar.SidebarMenuButton
                      asChild
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      role="menuitem"
                    >
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 w-full p-2 rounded-lg
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD65A]
                                 ${isActive(item.url) 
                                   ? 'bg-orange-500/10 text-orange-700' 
                                   : 'hover:bg-[#FFD65A]/10'}`}
                        aria-label={item.description}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            isActive(item.url) 
                              ? 'text-orange-500' 
                              : 'text-[#16C47F]'
                          }`}
                          aria-hidden="true"
                        />
                        <span className={`font-medium ${
                          isActive(item.url) 
                            ? 'text-orange-700' 
                            : 'text-gray-700'
                        }`}>
                          {item.title}
                        </span>
                      </Link>
                    </sidebar.SidebarMenuButton>
                  </sidebar.SidebarMenuItem>
                ))}
              </sidebar.SidebarMenu>
            </sidebar.SidebarGroupContent>
          </sidebar.SidebarGroup>
        </sidebar.SidebarContent>

        <sidebar.SidebarFooter
          className="border-t border-[#16C47F]/10 p-4 bg-[#16C47F]/5"
          role="complementary"
          aria-label="User menu"
        >
          <sidebar.SidebarMenu>
            <sidebar.SidebarMenuItem role="none">
              <dropdown.DropdownMenu>
                <dropdown.DropdownMenuTrigger
                  asChild
                  aria-label={`User menu for ${username || "Guest"}`}
                >
                  <sidebar.SidebarMenuButton
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors 
                             hover:bg-[#FFD65A]/10 focus-visible:outline-none focus-visible:ring-2 
                             focus-visible:ring-[#FFD65A]"
                    role="menuitem"
                  >
                    <User2
                      className="w-5 h-5 text-[#16C47F]"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-700">
                      {username || "Guest"}
                    </span>
                    <ChevronUp
                      className="w-4 h-4 ml-auto text-gray-400"
                      aria-hidden="true"
                    />
                  </sidebar.SidebarMenuButton>
                </dropdown.DropdownMenuTrigger>
                <dropdown.DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-[200px] bg-white"
                >
                  <dropdown.DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 text-[#F93827] hover:text-[#F93827] 
                             hover:bg-[#F93827]/10 cursor-pointer transition-colors data-[highlighted]:text-[#F93827] 
                             data-[highlighted]:bg-[#F93827]/10 focus-visible:outline-none focus-visible:ring-2 
                             focus-visible:ring-[#F93827]"
                    aria-label="Sign out of your account"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Sign out</span>
                  </dropdown.DropdownMenuItem>
                </dropdown.DropdownMenuContent>
              </dropdown.DropdownMenu>
            </sidebar.SidebarMenuItem>
          </sidebar.SidebarMenu>
        </sidebar.SidebarFooter>
      </sidebar.Sidebar>
    </aside>
  );
}
