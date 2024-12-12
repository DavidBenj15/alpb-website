"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "../components/input/SubmitButton";
import { loginUser } from "../../api/auth";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import LogoButton from "../components/navbar/LogoButton";
import { setUser } from "@/lib/store";
import { UserAPIResType } from "@/data/types";

const LoginForm = () => {
  const [submitStatus, setSubmitStatus] = useState({
    message: "",
    textClass: "text-gray-600",
  });
  const router = useRouter();
  const { setIdToken, setAccessToken } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      setSubmitStatus({
        message: "Loading...",
        textClass: "text-gray-600",
      });
      const result: UserAPIResType = await loginUser(email, password);
      // TODO set user info here!!!
      setUser(result.user);
      setAccessToken(result.authData.accessToken); // Set the access token in the context
      setIdToken(result.authData.idToken); // Set the ID token in the context

      // Handle successful login and redirect based on user role
      if (result.user.role === "master") {
        router.push("/pending-widgets"); // Redirect to pending widgets page for master role
      } else {
        router.push("/dashboard"); // Redirect to dashboard for other roles
      }
    } catch (error) {
      setSubmitStatus({
        message: "Login failed. Please try again", // Display error message on login failure
        textClass: "text-red-600", // Apply red text class for error message
      });
    }
  };

  return (
    <Card className="w-[450px] pb-5 px-5">
      <CardHeader className="flex flex-col items-center justify-center">
        <div className="mb-2">
          <LogoButton width={70} height={70} />
        </div>
        <CardDescription>Sign in to continue to ALPB Analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                name="email"
                type="email"
                required={true}
                placeholder="Email"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Input
                name="password"
                type="password"
                required={true}
                placeholder="Password"
              />
            </div>
          </div>
          <SubmitButton btnText="Continue" className="mt-8" />
        </form>
      </CardContent>
      <div className="flex justify-center text-sm">
        <p className={submitStatus.textClass}>{submitStatus.message}</p>
      </div>
    </Card>
  );
};

export default LoginForm;
