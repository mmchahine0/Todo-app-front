import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
} from "lucide-react";
import { Link } from "react-router-dom";
import * as sidebar from "@/components/ui/sidebar";
import * as dropdown from "@/components/ui/dropdown-menu";
import * as collapse from "@/components/ui/collapsible";

import { AppSidebarProps } from "../sidebar/Sidebar.types";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCredentials } from "@/redux/slices/authSlices";
import { clearUserData } from "@/redux/slices/userSlice";

// Menu items with proper routes
const items = [
  {
    title: "Test",
    url: "/dashboard/test",
    icon: Home,
  },
  {
    title: "Todo",
    url: "/dashboard/todo",
    icon: Inbox,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
export function AppSidebar({ username, isOpen }: AppSidebarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSignOut = () => {
    dispatch(clearCredentials());
    dispatch(clearUserData());
    navigate("/signin");
  };
  return (
    <div className="flex">
      <sidebar.Sidebar collapsible="icon">
        <sidebar.SidebarHeader>
          <sidebar.SidebarMenu>
            {isOpen && (
              <sidebar.SidebarMenuItem>
                <dropdown.DropdownMenu>
                  <dropdown.DropdownMenuTrigger asChild>
                    <sidebar.SidebarMenuButton>
                      Select Workspace
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]/collapsible:rotate-180" />
                    </sidebar.SidebarMenuButton>
                  </dropdown.DropdownMenuTrigger>
                  <dropdown.DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                    <dropdown.DropdownMenuItem>
                      <span>Acme Inc</span>
                    </dropdown.DropdownMenuItem>
                  </dropdown.DropdownMenuContent>
                </dropdown.DropdownMenu>
              </sidebar.SidebarMenuItem>
            )}
          </sidebar.SidebarMenu>
        </sidebar.SidebarHeader>
        <sidebar.SidebarContent>
          <sidebar.SidebarGroup>
            <sidebar.SidebarGroupLabel>Application</sidebar.SidebarGroupLabel>
            <sidebar.SidebarGroupContent>
              <sidebar.SidebarMenu>
                {items.map((item) => (
                  <sidebar.SidebarMenuItem key={item.title}>
                    <sidebar.SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </sidebar.SidebarMenuButton>
                  </sidebar.SidebarMenuItem>
                ))}
              </sidebar.SidebarMenu>
            </sidebar.SidebarGroupContent>
          </sidebar.SidebarGroup>

          <collapse.Collapsible defaultOpen className="group/collapsible">
            <sidebar.SidebarGroup>
              <sidebar.SidebarGroupLabel asChild>
                <collapse.CollapsibleTrigger className="flex w-full items-center">
                  Help
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </collapse.CollapsibleTrigger>
              </sidebar.SidebarGroupLabel>
              <collapse.CollapsibleContent className="overflow-hidden">
                <sidebar.SidebarGroupContent className="transition-all duration-200 ease-out data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
                  <sidebar.SidebarMenu>
                    <sidebar.SidebarMenuItem>
                      <sidebar.SidebarMenuButton>
                        <sidebar.SidebarMenuSub>
                          {items.map((item) => (
                            <sidebar.SidebarMenuSubItem key={item.title}>
                              <sidebar.SidebarMenuSubButton asChild>
                                <Link to={item.url}>
                                  <span>{item.title}</span>
                                </Link>
                              </sidebar.SidebarMenuSubButton>
                            </sidebar.SidebarMenuSubItem>
                          ))}
                        </sidebar.SidebarMenuSub>
                      </sidebar.SidebarMenuButton>
                    </sidebar.SidebarMenuItem>
                  </sidebar.SidebarMenu>
                </sidebar.SidebarGroupContent>
              </collapse.CollapsibleContent>
            </sidebar.SidebarGroup>
          </collapse.Collapsible>
        </sidebar.SidebarContent>
        <sidebar.SidebarFooter>
          <sidebar.SidebarMenu>
            <sidebar.SidebarMenuItem>
              <dropdown.DropdownMenu>
                <dropdown.DropdownMenuTrigger asChild>
                  <sidebar.SidebarMenuButton>
                    <User2 />
                    {username || "Guest"} <ChevronUp className="ml-auto" />
                  </sidebar.SidebarMenuButton>
                </dropdown.DropdownMenuTrigger>
                <dropdown.DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <dropdown.DropdownMenuItem>
                    <span>Account</span>
                  </dropdown.DropdownMenuItem>
                  <dropdown.DropdownMenuItem>
                    <span>Billing</span>
                  </dropdown.DropdownMenuItem>
                  <dropdown.DropdownMenuItem onClick={handleSignOut}>
                    <span>Sign out</span>
                  </dropdown.DropdownMenuItem>
                </dropdown.DropdownMenuContent>
              </dropdown.DropdownMenu>
            </sidebar.SidebarMenuItem>
          </sidebar.SidebarMenu>
        </sidebar.SidebarFooter>
      </sidebar.Sidebar>
    </div>
  );
}
