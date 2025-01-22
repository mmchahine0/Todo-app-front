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

const UserProfile = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  // Local state for form inputs
  const [formData, setFormData] = useState<UserProfileUpdateInput>({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // Fetch user profile
  const { isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getUserProfile(accessToken),
    staleTime: 300000, // Consider data fresh for 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UserProfileUpdateInput) =>
      updateUserProfile(data, accessToken),
    onSuccess: (updatedUser) => {
      // Update Redux store with new user data
      dispatch(
        setUserData({
          username: updatedUser.name || "",
          email: updatedUser.email,
        })
      );

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        duration: 3000,
      });
      setPasswordData({ currentPassword: "", newPassword: "" });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile",
        duration: 3000,
      });
    },
  });

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: UserProfileUpdateInput = {
      ...formData,
    };

    if (passwordData.newPassword) {
      updateData.currentPassword = passwordData.currentPassword;
      updateData.newPassword = passwordData.newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Your email"
                />
              </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Change Password</h3>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full"
                  placeholder="Current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full"
                  placeholder="New password"
                />
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateProfileMutation.isPending
                  ? "Updating..."
                  : "Update Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
