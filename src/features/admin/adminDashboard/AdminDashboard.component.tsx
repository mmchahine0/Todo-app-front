import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from "./AdminDashboard.services";
import { User } from "./AdminDashboard.types";
import { Helmet } from "react-helmet-async";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

interface ConfirmDialogState {
  isOpen: boolean;
  userId: string;
  userName: string;
  action: "suspend" | "unsuspend" | null;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    userId: "",
    userName: "",
    action: null,
  });

  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );
  const id = useSelector((state: RootState) => state.auth?.id);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => getAllUsers(accessToken, { page, limit: pageSize }),
    enabled: !!accessToken,
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
    onError: () => {
      toast({
        title: "Failed",
        description: "Profile failed to update",
        variant: "destructive",
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
    onError: () => {
      toast({
        title: "Failed",
        description: "User status failed to update",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (user: User) => {
    setConfirmDialog({
      isOpen: true,
      userId: user.id,
      userName: user.name,
      action: user.suspended ? "unsuspend" : "suspend",
    });
  };

  const handleConfirmStatusUpdate = () => {
    if (confirmDialog.userId && confirmDialog.action) {
      statusMutation.mutate({
        userId: confirmDialog.userId,
        suspend: confirmDialog.action === "suspend",
      });
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const totalPages = Math.ceil((data?.pagination.totalItems || 0) / pageSize);

  // Responsive card view for mobile
  const UserCard = ({ user }: { user: User }) => (
    <Card className="p-4 mb-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          {id === user.id && (
            <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
              You
            </span>
          )}
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Role: {user.role}</span>
          <span
            className={`${user.suspended ? "text-red-500" : "text-green-500"}`}
          >
            {user.suspended ? "Suspended" : "Active"}
          </span>
        </div>
        {id !== user.id && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`role-${user.id}`}
                className="text-sm text-gray-600"
              >
                Admin
              </label>
              <Switch
                id={`role-${user.id}`}
                checked={user.role === "ADMIN"}
                onCheckedChange={(checked) =>
                  roleMutation.mutate({
                    userId: user.id,
                    makeAdmin: checked,
                  })
                }
                aria-label={`Toggle admin role for ${user.name}`}
              />
            </div>
            <Button
              variant={user.suspended ? "default" : "destructive"}
              onClick={() => handleStatusUpdate(user)}
              className="text-sm"
              aria-label={`${user.suspended ? "Unsuspend" : "Suspend"} ${
                user.name
              }`}
            >
              {user.suspended ? "Unsuspend" : "Suspend"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>User Management Dashboard | Admin</title>
        <meta
          name="description"
          content="Manage users, roles, and permissions"
        />
      </Helmet>

      <div className="w-full max-w-full overflow-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold" id="dashboard-title">
            User Management
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
              aria-label="Select number of rows per page"
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
        </header>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-full border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[250px]">Role</TableHead>
                  <TableHead className="w-[250px]">Status</TableHead>
                  <TableHead className="w-[250px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
                          role="status"
                          aria-label="Loading users"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-sm
                        ${
                          user.suspended
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                        >
                          {user.suspended ? "Suspended" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {id === user.id ? (
                          <span className="inline-flex px-3 py-1 bg-gray-100 rounded-full text-sm">
                            You
                          </span>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.role === "ADMIN"}
                                onCheckedChange={(checked) =>
                                  roleMutation.mutate({
                                    userId: user.id,
                                    makeAdmin: checked,
                                  })
                                }
                                aria-label={`Toggle admin role for ${user.name}`}
                              />
                            </div>
                            <Button
                              variant={
                                user.suspended ? "default" : "destructive"
                              }
                              onClick={() => handleStatusUpdate(user)}
                              className="whitespace-nowrap"
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
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
                role="status"
                aria-label="Loading users"
              />
            </div>
          ) : (
            data?.data.map((user: User) => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data?.pagination.nextPage}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            Total users: {data?.pagination.totalItems || 0}
          </div>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog
          open={confirmDialog.isOpen}
          onOpenChange={(isOpen) =>
            setConfirmDialog((prev) => ({ ...prev, isOpen }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.action === "suspend"
                  ? "Suspend User"
                  : "Unsuspend User"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to{" "}
                <span className="font-medium text-black">
                  {confirmDialog.action} {confirmDialog.userName}
                </span>
                ? This action can be reversed later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:space-x-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmStatusUpdate}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default AdminDashboard;
