import { io, Socket } from "socket.io-client";
import {store} from '../redux/persist/persist'

class SocketService {
    private socket: Socket | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
  
    // Initialize the socket connection
    public connect(): void {
      // Get auth state from Redux store
      const { auth } = store.getState();
      
      if (!auth?.accessToken) {
        console.warn("Cannot connect to socket: No access token available");
        return;
      }
      
      // Disconnect if already connected
      this.disconnect();
      
      // Connect to the server with authentication
      this.socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", {
        auth: { token: auth.accessToken },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      // Set up event listeners
      this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
      if (!this.socket) return;
      
      this.socket.on("connect", () => {
        console.log("Socket.io connected!");
      });
      
      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this.handleDisconnect();
      });
      
      this.socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        this.handleDisconnect();
      });
    }
    
    private handleDisconnect(): void {
      // Clear any existing reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      // Try to reconnect after a delay if we have a valid token
      this.reconnectTimer = setTimeout(() => {
        const { auth } = store.getState();
        if (auth?.accessToken) {
          this.connect();
        }
      }, 5000);
    }
    
    // Subscribe to a specific todo's updates
    public subscribeToTodo(todoId: string, callback: (data: any) => void): void {
      if (!this.socket) {
        this.connect();
      }
      
      if (this.socket) {
        this.socket.on(`todo:${todoId}:updated`, callback);
      }
    }
    
    // Unsubscribe from a todo's updates
    public unsubscribeFromTodo(todoId: string): void {
      if (this.socket) {
        this.socket.off(`todo:${todoId}:updated`);
      }
    }
    
    // Listen for all todo updates
    public onTodoUpdated(callback: (data: any) => void): void {
      if (!this.socket) {
        this.connect();
      }
      
      if (this.socket) {
        this.socket.on("todo:updated", callback);
      }
    }
    
    // Listen for new todos
    public onTodoCreated(callback: (data: any) => void): void {
      if (!this.socket) {
        this.connect();
      }
      
      if (this.socket) {
        this.socket.on("todo:created", callback);
      }
    }
    
    // Listen for todo deletions
    public onTodoDeleted(callback: (data: any) => void): void {
      if (!this.socket) {
        this.connect();
      }
      
      if (this.socket) {
        this.socket.on("todo:deleted", callback);
      }
    }
    
    // Listen for comments on a todo
    public onTodoComment(callback: (data: any) => void): void {
      if (!this.socket) {
        this.connect();
      }
      
      if (this.socket) {
        this.socket.on("todo:comment", callback);
      }
    }
    
    // Listen for notifications
    public onNotification(callback: (data: any) => void): void {
      if (!this.socket) {
        this.connect();
      }
      
      if (this.socket) {
        this.socket.on("notification", callback);
      }
    }
    
    // Disconnect the socket
    public disconnect(): void {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }
    
    // Get the socket instance
    public getSocket(): Socket | null {
      return this.socket;
    }
  }
  
  // Create a singleton instance
  const socketService = new SocketService();
  export default socketService;