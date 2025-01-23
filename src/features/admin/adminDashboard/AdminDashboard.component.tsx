import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from "./AdminDashboard.services";
import { User } from "./AdminDashboard.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  const id = useSelector((state: RootState) => state.auth?.id);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => getAllUsers(accessToken, { page, limit: pageSize }),
  });

  const roleMutation = useMutation({
    mutationFn: ({
      userId,
      makeAdmin,
    }: {
      userId: string;
      makeAdmin: boolean;
    }) => updateUserRole(userId, makeAdmin, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, suspend }: { userId: string; suspend: boolean }) =>
      updateUserStatus(userId, suspend, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
  });

  const totalPages = Math.ceil((data?.pagination.totalItems || 0) / pageSize);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 30, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.suspended ? "Suspended" : "Active"}
                  </TableCell>
                  <TableCell>
                    {id === user.id ? (
                      <span className="border-4 border-solid rounded-3xl">
                        <span className="px-14">You</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={user.role === "ADMIN"}
                          onCheckedChange={(checked) =>
                            roleMutation.mutate({
                              userId: user.id,
                              makeAdmin: checked,
                            })
                          }
                        />
                        <Button
                          variant={user.suspended ? "default" : "destructive"}
                          onClick={() =>
                            statusMutation.mutate({
                              userId: user.id,
                              suspend: !user.suspended,
                            })
                          }
                        >
                          {user.suspended ? "Unsuspend" : "Suspend"}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-evenly py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.pagination.nextPage}
          >
            Next
          </Button>
        </div>
        <div className="text-sm text-gray-500 mt-4">
          Total users: {data?.pagination.totalItems || 0}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
