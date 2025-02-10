import { Outlet } from "react-router-dom";
import Navbar from "../common/navbar/Navbar.component";
import Footer from "../common/footer/Footer.component";
import { useQuery } from "@tanstack/react-query";
import { getContent } from "../../features/admin/adminHomeEditLayout/AdminLayout.services";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
interface AuthlayoutProps {
  children?: React.ReactNode;
}

export function AuthLayout({ children }: AuthlayoutProps) {
  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );
  // Get navbar data
  const { data } = useQuery({
    queryKey: ["content"],
    queryFn: () => getContent(""),
    enabled: !!accessToken,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar customLinks={data?.data?.navbar || []} />
      <main className="flex-1 flex">{children || <Outlet />}</main>
      <Footer content={data?.data?.footer || { links: [] }} />
    </div>
  );
}
