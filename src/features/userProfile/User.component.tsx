import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "./User.service";
import { UserProfileUpdateInput } from "./User.types";
import { setUserData } from "@/redux/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { queryClient } from "../../lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Mail, Key } from "lucide-react";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );
  const userData = useSelector((state: RootState) => state.userdata);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);

  const [formData, setFormData] = useState<UserProfileUpdateInput>({
    name: userData.username || "",
    email: userData.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const { isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getUserProfile(accessToken),
    staleTime: 300000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserProfileUpdateInput) =>
      updateUserProfile(data, accessToken),
    onSuccess: (updatedUser) => {
      dispatch(
        setUserData({
          username: updatedUser.name || "",
          email: updatedUser.email,
          role: updatedUser.role,
        })
      );
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsPasswordDialogOpen(false);
      setIsNameDialogOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "" });
    },
  });

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="bg-white shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg font-semibold">{userData.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg font-semibold">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-6" variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Change Name
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Name</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfileMutation.mutate({ name: formData.name });
                  }}
                  className="space-y-4 pt-4"
                >
                  <div>
                    <label className="text-sm font-medium">New Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending
                      ? "Updating..."
                      : "Update Name"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isPasswordDialogOpen}
              onOpenChange={setIsPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="mt-6" variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handlePasswordUpdate}
                  className="space-y-4 pt-4"
                >
                  <div>
                    <label className="text-sm font-medium">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">New Password</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending
                      ? "Updating..."
                      : "Update Password"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
