import SigninComponent from "../features/signin/Signin.component";
import SignupComponent from "../features/signup/Signup.component";
import TodoDashboard from "../features/todo/Todo.component";
import Home from "../features/home/Home.component";
import Test from "../features/Test";
import UserProfile from "../features/userProfile/User.component";
import TestDashboard from "@/features/dashboard/TestDashboard";
import TestHelp from "@/features/help/TestHelp";
import AdminDashboard from "@/features/admin/adminDashboard/AdminDashboard.component";
import AdminLayout from "@/features/admin/adminHomeEditLayout/AdminLayout.component";
import Admin from "../features/admin/Admin";
import LayoutCreation from "../features/admin/adminLayoutCreation/LayoutCreation.component";
import Layout from "@/features/sidebar/Layout";

export interface RouteConfig {
  path: string;
  component: React.ComponentType<object>;
  layout?: React.ComponentType<object>;
  protected?: boolean;
  admin?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: "/login",
    component: SigninComponent
  },
  {
    path: "/signup",
    component: SignupComponent
  },
  {
    path: "/home",
    component: Home
  }
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: "/dashboard/todo",
    component: TodoDashboard,
    layout: Layout,
    protected: true
  },
  {
    path: "/dashboard/test",
    component: Test,
    layout: Layout,
    protected: true
  },
  {
    path: "/dashboard/profile",
    component: UserProfile,
    layout: Layout,
    protected: true
  },
  {
    path: "/dashboard",
    component: TestDashboard,
    layout: Layout,
    protected: true
  },
  {
    path: "/dashboard/help/test",
    component: TestHelp,
    layout: Layout,
    protected: true
  }
];

export const adminRoutes: RouteConfig[] = [
  {
    path: "/dashboard/admin",
    component: Admin,
    layout: Layout,
    admin: true
  },
  {
    path: "/dashboard/admin/layout",
    component: LayoutCreation,
    layout: Layout,
    admin: true
  },
  {
    path: "/dashboard/admin/users",
    component: AdminDashboard,
    layout: Layout,
    admin: true
  },
  {
    path: "/dashboard/admin/layout/home",
    component: AdminLayout,
    layout: Layout,
    admin: true
  }
];
