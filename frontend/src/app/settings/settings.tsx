"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@nanostores/react";
import { $user } from "@/lib/userStore";
import useMutationUser from "../hooks/use-mutation-user";
import { useAuth } from "../contexts/AuthContext";

export default function Settings() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useStore($user);
  const { updateUser } = useMutationUser();
  const { loading } = useAuth();

  const [formData, setFormData] = useState({
    first: user?.first || "",
    last: user?.last || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    try {
      await updateUser({
        first: formData.first,
        last: formData.last,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = () => {
    router.push("/reset-password");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Update your account information and manage your preferences.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first">First Name</Label>
                  <Input
                    id="first"
                    name="first"
                    value={formData.first}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last">Last Name</Label>
                  <Input
                    id="last"
                    name="last"
                    value={formData.last}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  Your email address cannot be changed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Input
                  id="role"
                  value={user.role}
                  disabled
                  className="bg-gray-50"
                />
                {user.is_admin === true && (
                  <p className="text-sm text-blue-600 font-medium">
                    Administrator Account
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium">Password</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Change your password to keep your account secure.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
