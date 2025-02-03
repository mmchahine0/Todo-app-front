import { Outlet } from "react-router-dom";

interface AuthlayoutProps {
  children?: React.ReactNode;
}

export function AuthLayout({ children }: AuthlayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children || <Outlet />}</main>
    </div>
  );
}
