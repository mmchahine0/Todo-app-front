import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import socketService from "@/utils/websocket";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);

  useEffect(() => {
    if (accessToken) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [accessToken]);

  return <>{children}</>;
};