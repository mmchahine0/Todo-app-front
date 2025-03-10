import { io, Socket } from "socket.io-client";
import { store } from "../redux/persist/persist";
import { toast } from "@/hooks/use-toast";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;

  public connect(): void {
    try {
      const { auth } = store.getState();

      if (!auth?.accessToken) {
        console.warn("Cannot connect to socket: No access token");
        return;
      }

      if (this.socket?.connected) {
        console.log("Socket already connected");
        return;
      }

      this.socket = io(
        import.meta.env.VITE_SOCKET_URL || "http://localhost:3500",
        {
          auth: { token: auth.accessToken },
          reconnection: true,
          reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
          reconnectionDelay: 1000,
          timeout: 10000,
        }
      );

      this.setupEventListeners();
    } catch (error) {
      console.error("Socket connection error:", error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.reconnectAttempts = 0;
      toast({
        title: "Connected to real-time updates",
        duration: 2000,
      });
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.handleReconnect();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        this.handleReconnect();
      }
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time updates",
        variant: "destructive",
        duration: 3000,
      });
    });
  }

  private handleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      this.reconnectTimer = setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        this.connect();
      }, 5000);
    } else {
      console.error("Max reconnection attempts reached");
      toast({
        title: "Connection Failed",
        description: "Unable to establish real-time connection",
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts = 0;
  }

  public subscribeToTodo(todoId: string, callback: (data: any) => void): void {
    if (!this.socket?.connected) {
      this.connect();
    }

    if (this.socket) {
      this.socket.emit("join:todo", todoId);
      this.socket.on(`todo:${todoId}:updated`, callback);
    }
  }

  public unsubscribeFromTodo(todoId: string): void {
    if (this.socket) {
      this.socket.emit("leave:todo", todoId);
      this.socket.off(`todo:${todoId}:updated`);
    }
  }

  public onTodoCreated(callback: (data: any) => void): void {
    if (!this.socket?.connected) {
      this.connect();
    }

    if (this.socket) {
      this.socket.on("todo:created", callback);
    }
  }
  public onTodoShared(callback: (data: any) => void): void {
    if (!this.socket?.connected) {
      this.connect();
    }

    if (this.socket) {
      this.socket.on("todo:shared", callback);
    }
  }

  public offTodoShared(): void {
    if (this.socket) {
      this.socket.off("todo:shared");
    }
  }
  public onTodoDeleted(callback: (data: any) => void): void {
    if (!this.socket?.connected) {
      this.connect();
    }

    if (this.socket) {
      this.socket.on("todo:deleted", callback);
    }
  }

  public onNotification(callback: (data: any) => void): void {
    if (!this.socket?.connected) {
      this.connect();
    }

    if (this.socket) {
      this.socket.on("notification", callback);
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService;
