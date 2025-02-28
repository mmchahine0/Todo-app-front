import { useState } from "react";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addCollaborator } from "../Todo.service";
import { RootState } from "@/redux/persist/persist";
import { queryClient } from "@/lib/queryClient";

interface TodoCollaboratorsProps {
  todoId: string;
  title: string;
}

export const TodoCollaborators = ({ todoId, title }: TodoCollaboratorsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collaboratorId, setCollaboratorId] = useState("");
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  
  const addCollaboratorMutation = useMutation({
    mutationFn: () => 
      addCollaborator(todoId, { collaboratorId }, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setCollaboratorId("");
      setIsOpen(false);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collaboratorId.trim()) {
      addCollaboratorMutation.mutate();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Manage collaborators"
        >
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Collaborator to "{title}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="collaboratorId" className="text-sm font-medium">
              Collaborator User ID
            </label>
            <Input
              id="collaboratorId"
              value={collaboratorId}
              onChange={(e) => setCollaboratorId(e.target.value)}
              placeholder="Enter user ID to add as collaborator"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={addCollaboratorMutation.isPending}
          >
            {addCollaboratorMutation.isPending ? (
              "Adding..."
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Collaborator
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};