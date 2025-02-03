import SigninComponent from "../features/signin/Signin.component";
import SignupComponent from "../features/signup/Signup.component";
import TodoDashboard from "../features/todo/Todo.component";
import Home from "../features/home/Home.component";
import UserProfile from "../features/userProfile/User.component";
import AdminDashboard from "@/features/admin/adminDashboard/AdminDashboard.component";
import AdminLayout from "@/features/admin/adminHomeEditLayout/AdminLayout.component";
import LayoutCreation from "../features/admin/adminLayoutCreation/LayoutCreation.component";

export interface RouteConfig {
  path: string;
  component: React.ComponentType<object>;
  layout?: 'base' | 'dashboard' | 'auth';
  isProtected?: boolean;
  admin?: boolean;
}

// Routes that don't require authentication
export const publicRoutes: RouteConfig[] = [
  {
    path: "/auth/login",
    component: SigninComponent,
    layout: "auth",
  },
  {
    path: "/auth/signup",
    component: SignupComponent,
    layout: "auth",
  },
  {
    path: "/home",
    component: Home,
    layout: "base",
  },
];

// Routes that require user authentication
export const protectedRoutes: RouteConfig[] = [
  {
    path: "/dashboard/todo",
    component: TodoDashboard,
    layout: 'dashboard',
    isProtected: true,
  },
  {
    path: "/dashboard/profile",
    component: UserProfile,
    layout: 'dashboard',
    isProtected: true,
  },
];

// Routes that require admin privileges
export const adminRoutes: RouteConfig[] = [
  {
    path: "/dashboard/admin/layout",
    component: LayoutCreation,
    layout: 'dashboard',
    admin: true,
  },
  {
    path: "/dashboard/admin/users",
    component: AdminDashboard,
    layout: 'dashboard',
    admin: true,
  },
  {
    path: "/dashboard/admin/layout/home",
    component: AdminLayout,
    layout: 'dashboard',
    admin: true,
  },
];
