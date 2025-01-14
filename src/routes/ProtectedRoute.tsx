import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/persist/persist";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useSelector((state: RootState) => state.auth);
  
  // Add a loading state check
  const isInitialized = useSelector(
    (state: RootState) => state.auth._initialized
  );

  // Show nothing while checking authentication
  if (!isInitialized) {
    return null;
  }

  if (!auth?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};