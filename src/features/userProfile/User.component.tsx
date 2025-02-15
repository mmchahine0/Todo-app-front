import { useState } from "react";
import { Helmet } from "react-helmet-async";
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
import { Label } from "@/components/ui/label";
import { queryClient } from "../../lib/queryClient";
import { validatePassword } from "../../utils/validationConstants";
import { DialogForm } from "@/components/common/dialog form/DialogForm.component";
import { User, Mail, Key } from "lucide-react";
import axios from "axios";
import { LoadingSpinner } from "@/components/common/loading spinner/LoadingSpinner.component";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );
  const role = useSelector((state: RootState) => state.userdata?.role);
  const userData = useSelector((state: RootState) => state.userdata);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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
          role: role,
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
      setPasswordError("");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Profile failed to update",
          variant: "destructive",
        });
      }
    },
  });

  const renderNameChangeDialog = () => (
    <DialogForm
      title="Change Name"
      triggerButton={{
        icon: <User className="mr-2 h-4 w-4" />,
        label: "Change Name",
      }}
      isOpen={isNameDialogOpen}
      onOpenChange={setIsNameDialogOpen}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (formData.name && formData.name.trim() === userData.username) {
            toast({
              title: "No Changes",
              description: "The name matches your current name",
              variant: "destructive",
            });
            return;
          }
          updateProfileMutation.mutate({ name: formData.name });
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name">New Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            required
            minLength={2}
            aria-required="true"
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={updateProfileMutation.isPending}
          aria-disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? "Updating..." : "Update Name"}
        </Button>
      </form>
    </DialogForm>
  );

  const renderPasswordChangeDialog = () => (
    <DialogForm
      title="Change Password"
      triggerButton={{
        icon: <Key className="mr-2 h-4 w-4" />,
        label: "Change Password",
      }}
      isOpen={isPasswordDialogOpen}
      onOpenChange={setIsPasswordDialogOpen}
    >
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            required
            aria-required="true"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => {
              setPasswordData((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }));
              setPasswordError("");
            }}
            required
            aria-required="true"
            aria-invalid={!!passwordError}
            aria-describedby="passwordError"
            className={passwordError ? "border-red-500" : ""}
          />
          {passwordError && (
            <p
              id="passwordError"
              className="text-sm text-red-600"
              role="alert"
              aria-live="assertive"
            >
              {passwordError}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={updateProfileMutation.isPending}
          aria-disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </DialogForm>
  );

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidationError = validatePassword(passwordData.newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password",
        variant: "destructive",
      });
      return;
    }

    setPasswordError("");
    updateProfileMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading user info..." />;
  }

  return (
    <>
      <Helmet>
        <title>Profile Settings | User Account</title>
        <meta
          name="description"
          content="Manage your account profile information, update your name, and change your password securely."
        />
        <meta
          name="keywords"
          content="user profile, account settings, password change, personal information"
        />
        <meta property="og:title" content="Profile Settings | User Account" />
        <meta
          property="og:description"
          content="Secure management of user profile and account settings"
        />
      </Helmet>

      <div className="container mx-auto p-4 max-w-3xl min-h-[calc(100vh-4rem)]">
        <Card className="bg-white shadow-sm rounded-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              <div className="grid gap-6">
                {/* User Info Section */}
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <User
                      className="h-5 w-5 text-gray-600"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Name</p>
                      <p
                        className="text-lg font-semibold text-gray-900"
                        aria-live="polite"
                      >
                        {userData.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Mail
                      className="h-5 w-5 text-gray-600"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p
                        className="text-lg font-semibold text-gray-900"
                        aria-live="polite"
                      >
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {renderNameChangeDialog()}
                  {renderPasswordChangeDialog()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserProfile;
