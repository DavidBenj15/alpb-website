"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "../components/input/InputField";
import SubmitButton from "../components/input/SubmitButton";
import SelectField from "../components/input/SelectField";
import { signUpUser } from "../../api/auth"; // Now importing from api/auth
import {
  Card,
  CardContent,
  CardDescription,
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
import Image from "next/image";
import LogoButton from "../components/navbar/LogoButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialSubmitStatus = {
  message: "",
  textClass: "text-black",
};

export function SignupForm() {
  const [submitStatus, setSubmitStatus] = useState(initialSubmitStatus);
  const router = useRouter();
  const [invitedTeam, setInvitedTeam] = useState<{ team_name: string } | null>(null);

  useEffect(() => {
    const fetchInvitedTeam = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const inviteToken = searchParams.get('invite');
      
      if (inviteToken) {
        try {
          const response = await fetch(`${API_URL}/api/teams/validate-invite`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inviteToken }),
          });
          
          if (!response.ok) {
            console.error('Failed to validate invite:', await response.text());
            return;
          }
          
          const data = await response.json();
          if (data.success) {
            setInvitedTeam(data.team);
          }
        } catch (error) {
          console.error('Error validating invite:', error);
        }
      }
    };

    fetchInvitedTeam();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitStatus({
      message: "",
      textClass: "text-gray-600",
    });

    const formData = new FormData(event.currentTarget);
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value as string;
    });

    const searchParams = new URLSearchParams(window.location.search);
    const inviteToken = searchParams.get('invite');

    // Verify that passwords match
    if (data["password"] !== data["confirm-password"]) {
      setSubmitStatus({
        message: "Error: passwords don't match",
        textClass: "text-red-600",
      });
      return;
    }

    // If league account type is selected, store basic info and redirect
    if (data["account-type"] === "league") {
      sessionStorage.setItem('leagueRegistration', JSON.stringify({
        email: data["email"],
        password: data["password"],
        firstName: data["first-name"],
        lastName: data["last-name"],
        inviteToken: inviteToken || undefined
      }));
      
      router.push('/register-league');
      return;
    }

    // Call the API to sign up the user
    try {
      const userData = {
        email: data["email"],
        password: data["password"],
        firstName: data["first-name"],
        lastName: data["last-name"],
        role: data["account-type"],
        inviteToken: inviteToken || undefined
      };

      await signUpUser(userData); // This will now call your backend
      setSubmitStatus({
        message: "Sign up successful! Redirecting...",
        textClass: "text-green-600",
      });

      // Redirect to the confirmation page
      setTimeout(() => router.push("/confirm"), 200);
    } catch (error: unknown) {
      // Properly handle the error type
      if (error instanceof Error) {
        setSubmitStatus({
          message: error.message || "Sign up failed. Please try again.",
          textClass: "text-red-600",
        });
      } else {
        setSubmitStatus({
          message: "Sign up failed. Please try again.",
          textClass: "text-red-600",
        });
      }
      console.error("Sign up error:", error);
    }
  };

  return (
    <Card className="w-[450px] pb-5 px-5">
      <CardHeader className="flex flex-col items-center justify-center">
        <div className="mb-2">
          <LogoButton width={70} height={70} />
        </div>
        <CardTitle className="text-alpbBlue">
          Get started with ALPB Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitedTeam && (
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-600">
              You've been invited to join {invitedTeam.team_name}
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
            <div className="flex flex-col space-y-1.5">
              {/* <Label htmlFor="account-type">Account type</Label> */}
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
                    <SelectItem value="master">Master</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
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
