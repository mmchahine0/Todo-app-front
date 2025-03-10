import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import socketService from "@/utils/websocket";
import { useToast } from "@/hooks/use-toast";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth?._initialized
  );

  useEffect(() => {
    if (!isInitialized && isAuthenticated) {
      setIsInitialized(true);

      if (accessToken) {
        try {
          socketService.connect();
        } catch (error) {
          console.error("Failed to initialize socket connection:", error);
          toast({
            title: "Connection Error",
            description: "Failed to establish real-time connection",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    }

    return () => {
      if (isInitialized) {
        socketService.disconnect();
      }
    };
  }, [accessToken, isAuthenticated, isInitialized, toast]);

  // Re-connect if authentication state changes
  useEffect(() => {
    if (isInitialized) {
      if (accessToken) {
        socketService.connect();
      } else {
        socketService.disconnect();
      }
    }
  }, [accessToken, isInitialized]);

  return <>{children}</>;
};
