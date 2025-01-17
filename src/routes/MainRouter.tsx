import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SigninComponent from "../features/signin/Signin.component";
import SignupComponent from "../features/signup/Signup.component";
import TodoDashboard from "../features/todo/Todo.component";
import NotFound from "@/features/notFound/notFound";
import Home from "../features/home/Home.component";
import { ProtectedRoute } from "./ProtectedRoute";
import Layout from "@/features/sidebar/Layout";
import Test from "../features/Test";
import UserProfile from "../features/userProfile/User.component";

const MainRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SigninComponent />} />
        <Route path="/signup" element={<SignupComponent />} />

        {/* Protected Routes with Sidebar */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard/todo"
            element={
              <ProtectedRoute>
                <TodoDashboard />{" "}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/test"
            element={
              <ProtectedRoute>
                <Test />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/home" element={<Home />} />
        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/dashboard/home" replace />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;
