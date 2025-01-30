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
import { Link } from "react-router-dom";
import * as sidebar from "@/components/ui/sidebar";
import * as dropdown from "@/components/ui/dropdown-menu";
import { AppSidebarProps } from "./Sidebar.types";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCredentials } from "@/redux/slices/authSlices";
import { clearUserData } from "@/redux/slices/userSlice";
import { queryClient } from "@/lib/queryClient";

const userItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Todo", url: "/dashboard/todo", icon: Inbox },
  { title: "Profile", url: "/dashboard/profile", icon: Calendar },
];

const adminItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Profile", url: "/dashboard/profile", icon: Calendar },
  { title: "Users Management", url: "/dashboard/admin/users", icon: Users },
  { title: "Layout Management", url: "/dashboard/admin/layout", icon: Laptop },
  {
    title: "Home Management",
    url: "/dashboard/admin/layout/home",
    icon: HousePlus,
  },
];

export function AppSidebar({ username, role }: AppSidebarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    queryClient.clear();
    dispatch(clearCredentials());
    dispatch(clearUserData());
    navigate("/signin");
  };

  const sidebarItems = role === "ADMIN" ? adminItems : userItems;

  return (
    <div className="flex h-full bg-[#16C47F]/5">
      <sidebar.Sidebar
        collapsible="icon"
        className="border-r border-[#16C47F]/10 bg-[#16C47F]/5"
      >
        <sidebar.SidebarContent className="bg-[#16C47F]/5">
          <sidebar.SidebarGroup>
            <sidebar.SidebarGroupLabel className="text-sm font-medium text-[#16C47F]">
              Application
            </sidebar.SidebarGroupLabel>
            <sidebar.SidebarGroupContent className="">
              <sidebar.SidebarMenu>
                {sidebarItems.map((item) => (
                  <sidebar.SidebarMenuItem key={item.title}>
                    <sidebar.SidebarMenuButton
                      asChild
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-3 w-full hover:bg-[#FFD65A]/10 p-2 rounded-lg"
                      >
                        <item.icon className="w-5 h-5 text-[#16C47F]" />
                        <span className="font-medium text-gray-700">
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

        <sidebar.SidebarFooter className="border-t border-[#16C47F]/10 p-4 bg-[#16C47F]/5">
          <sidebar.SidebarMenu>
            <sidebar.SidebarMenuItem>
              <dropdown.DropdownMenu>
                <dropdown.DropdownMenuTrigger asChild>
                  <sidebar.SidebarMenuButton
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors 
                             hover:bg-[#FFD65A]/10"
                  >
                    <User2 className="w-5 h-5 text-[#16C47F]" />
                    <span className="font-medium text-gray-700">
                      {username || "Guest"}
                    </span>
                    <ChevronUp className="w-4 h-4 ml-auto text-gray-400" />
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
                             hover:bg-[#F93827]/10 cursor-pointer transition-colors data-[highlighted]:text-[#F93827] data-[highlighted]:bg-[#F93827]/10"
                  >
                    <LogOut className="w-4 h-4" />
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
