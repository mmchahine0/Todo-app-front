import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/persist/persist";

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const { role } = useSelector((state: RootState) => state.userdata);

  const isInitialized = useSelector(
    (state: RootState) => state.auth._initialized
  );

  if (!accessToken || accessToken === "") {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isInitialized) {
    return null;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};
