import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getTodoComments, addComment } from "../Todo.service";
import { TodoComment } from "../Todo.types";
import { RootState } from "@/redux/persist/persist";
import { queryClient } from "@/lib/queryClient";
import socketService from "@/utils/websocket.ts";

interface TodoCommentsProps {
  todoId: string;
  title: string;
}

export const TodoComments = ({ todoId, title }: TodoCommentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  
  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ["todo", todoId, "comments"],
    queryFn: () => getTodoComments(todoId, accessToken),
    enabled: !!accessToken && isOpen,
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: () => 
      addComment(todoId, { content: commentText }, accessToken),
    onSuccess: (newComment) => {
      queryClient.setQueryData(
        ["todo", todoId, "comments"],
        (oldComments: TodoComment[] = []) => [...oldComments, newComment]
      );
      setCommentText("");
    },
  });
  
  // Listen for new comments on this todo
  useEffect(() => {
    if (isOpen) {
      socketService.onTodoComment((newComment) => {
        if (newComment.todoId === todoId) {
          queryClient.setQueryData(
            ["todo", todoId, "comments"],
            (oldComments: TodoComment[] = []) => [...oldComments, newComment]
          );
        }
      });
    }
    
    return () => {
      // Clean up
    };
  }, [todoId, isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentMutation.mutate();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="View comments"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Comments for "{title}"</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto max-h-60 mb-4">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No comments yet
              </div>
            ) : (
              <ul className="space-y-4">
                {comments.map((comment) => (
                  <li 
                    key={comment.id} 
                    className="bg-gray-50 p-3 rounded-lg"
                  >
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        User: {comment.userId.substring(0, 8)}...
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={addCommentMutation.isPending || !commentText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};