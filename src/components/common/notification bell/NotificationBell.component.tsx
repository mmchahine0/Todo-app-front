import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { getNotifications, markNotificationAsRead } from "../../../features/todo/Todo.service";
import { Notification } from "../../../features/todo/Todo.types";
import { RootState } from "@/redux/persist/persist";
import { queryClient } from "@/lib/queryClient";
import socketService from "../../../utils/websocket";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  
  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(accessToken),
    enabled: !!accessToken,
  });
  
  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  
  // Calculate unread notifications count
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(notification => !notification.read).length;
      setUnreadCount(count);
    }
  }, [notifications]);
  
  // Listen for new notifications
  useEffect(() => {
    socketService.onNotification((newNotification) => {
      // Add the new notification to the cache
      queryClient.setQueryData(
        ["notifications"],
        (oldData: Notification[] = []) => [newNotification, ...oldData]
      );
    });
    
    return () => {
      // Clean up
    };
  }, []);
  
  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                  notification.read ? 'bg-white' : 'bg-blue-50'
                }`}
              >
                <p className="text-sm">{notification.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  {!notification.read && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};