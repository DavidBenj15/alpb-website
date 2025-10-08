"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "../components/input/SubmitButton";
import { signUpUser } from "../../api/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import LogoButton from "../components/navbar/LogoButton";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { validatePassword } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialSubmitStatus = {
  message: "",
  textClass: "text-black",
};

const PasswordRequirements = dynamic(() => import("./PasswordRequirements"), {
  ssr: false,
});

export function SignupForm() {
  const [submitStatus, setSubmitStatus] = useState(initialSubmitStatus);
  const router = useRouter();
  const [invitedTeam, setInvitedTeam] = useState<{
    team_name: string;
    team_id: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvitedTeam = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const inviteToken = searchParams.get("invite");

      if (inviteToken) {
        try {
          const response = await fetch(`${API_URL}/api/teams/validate-invite`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inviteToken }),
          });

          if (!response.ok) {
            console.error("Failed to validate invite:", await response.text());
            return;
          }

          const data = await response.json();
          if (data.success) {
            setInvitedTeam(data.team);
          }
        } catch (error) {
          console.error("Error validating invite:", error);
        }
      }
    };

    fetchInvitedTeam();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Add password validation
    const password = data["password"] as string;
    const confirmPassword = data["confirm-password"] as string;

    const { isValid, error } = validatePassword(password);
    if (!isValid) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const inviteToken = searchParams.get("invite");

    try {
      const userData = {
        email: data["email"] as string,
        password: data["password"] as string,
        firstName: data["first-name"] as string,
        lastName: data["last-name"] as string,
        role: data["account-type"] as string,
        teamId: invitedTeam ? invitedTeam.team_id : undefined,
        teamRole: data["team-role"] as string,
        inviteToken: inviteToken || undefined,
      };

      await signUpUser(userData);
      setSubmitStatus({
        message:
          "Account created! Please check your email for confirmation code.",
        textClass: "text-green-600",
      });
      const isDeveloper = userData.role === "widget developer";
      setTimeout(() => router.push(
        `/confirm?email=${encodeURIComponent(userData.email)}${isDeveloper ? '&type=developer' : ''}`),
        isDeveloper ? 2000 : 200
      );
    } catch (error) {
      setSubmitStatus({
        message:
          error instanceof Error
            ? error.message
            : "Sign up failed. Please try again.",
        textClass: "text-red-600",
      });
      console.error("Sign up error:", error);
    }
  };

  return (
    <Card className="w-[450px] max-w-[calc(100%-2rem)] min-w-[360px] py-10 px-5">
      <CardHeader className="flex flex-col items-center justify-center">
        <div className="mb-2">
          <LogoButton width={70} height={70} />
        </div>
        <CardTitle className="text-alpbBlue">
          Get started with SLUGGER
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitedTeam && (
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-600">
              You&apos;ve been invited to join {invitedTeam.team_name}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                name="first-name"
                type="text"
                required={true}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                name="last-name"
                type="text"
                required={true}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="first-name">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required={true}
                placeholder="your@email.com"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required={true}
                placeholder="Password"
              />
              <PasswordRequirements />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required={true}
                placeholder="Confirm password"
              />
            </div>
            <Separator className="my-4" />
            {!invitedTeam ? (
              <div className="flex flex-col space-y-1.5">
                <Select name="account-type" required={true}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="widget developer">
                        Widget Developer
                      </SelectItem>
                      <SelectItem value="league">League</SelectItem>
                      {/* <SelectItem value="master">Master</SelectItem> */}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="team-role">Your Role</Label>
                <Input
                  id="team-role"
                  name="team-role"
                  type="text"
                  required={true}
                  placeholder="e.g., General Manager, Analytics Director"
                />
                <input type="hidden" name="account-type" value="league" />
              </div>
            )}
          </div>
          <SubmitButton btnText="Sign up" className="mt-8" />
        </form>
      </CardContent>
      <div className="flex justify-center text-sm">
        <p className={submitStatus?.textClass}>{submitStatus?.message}</p>
      </div>
    </Card>
  );
}
