import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/persist/persist";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  // Add a loading state check
  const isInitialized = useSelector(
    (state: RootState) => state.auth._initialized
  );

  if (!accessToken || accessToken == "") {
    return <Navigate to="/auth/login" replace />;
  }
  // Show nothing while checking authentication
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
};
