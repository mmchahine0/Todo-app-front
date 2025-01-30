import SigninComponent from "../features/signin/Signin.component";
import SignupComponent from "../features/signup/Signup.component";
import TodoDashboard from "../features/todo/Todo.component";
import Home from "../features/home/Home.component";
import UserProfile from "../features/userProfile/User.component";
import AdminDashboard from "@/features/admin/adminDashboard/AdminDashboard.component";
import AdminLayout from "@/features/admin/adminHomeEditLayout/AdminLayout.component";
import LayoutCreation from "../features/admin/adminLayoutCreation/LayoutCreation.component";
import { BaseLayout } from "../features/layout/Baselayout";
import { DashboardLayout } from "../features/layout/Dashboardlayout";
import { Authlayout } from "../features/layout/Authlayout";

export interface RouteConfig {
  path: string;
  component: React.ComponentType<object>;
  layout?: React.ComponentType<object>;
  protected?: boolean;
  admin?: boolean;
}

// Routes that don't require authentication
export const publicRoutes: RouteConfig[] = [
  {
    path: "/login",
    component: SigninComponent,
    layout: Authlayout,
  },
  {
    path: "/signup",
    component: SignupComponent,
    layout: Authlayout,
  },
  {
    path: "/home",
    component: Home,
    layout: BaseLayout,
  },
];

// Routes that require user authentication
export const protectedRoutes: RouteConfig[] = [
  {
    path: "/dashboard/todo",
    component: TodoDashboard,
    layout: DashboardLayout,
    protected: true,
  },
  {
    path: "/dashboard/profile",
    component: UserProfile,
    layout: DashboardLayout,
    protected: true,
  },
];

// Routes that require admin privileges
export const adminRoutes: RouteConfig[] = [
  {
    path: "/dashboard/admin/layout",
    component: LayoutCreation,
    layout: DashboardLayout,
    admin: true,
  },
  {
    path: "/dashboard/admin/users",
    component: AdminDashboard,
    layout: DashboardLayout,
    admin: true,
  },
  {
    path: "/dashboard/admin/layout/home",
    component: AdminLayout,
    layout: DashboardLayout,
    admin: true,
  },
];
