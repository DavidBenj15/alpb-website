"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmSignUp } from "../../services/authService"; // You'll implement this function
import SubmitButton from "../components/input/SubmitButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

// Component for confirming sign-up
export function ConfirmSignUpForm() {
  // State variables for email, confirmation code, and submission status
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [submitStatus, setSubmitStatus] = useState({
    message: "",
    textClass: "black",
  });
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitStatus({
      message: "",
      textClass: "text-black",
    });

    try {
      // Call the confirmSignUp function to verify the account
      await confirmSignUp(email, confirmationCode);
      // Update submission status on success
      setSubmitStatus({
        message: "Account confirmed! Redirecting to login...",
        textClass: "text-green-600",
      });
      // Redirect to login after successful confirmation
      setTimeout(() => router.push("/sign-in"), 200);
    } catch (error: unknown) {
      // Update submission status on failure
      setSubmitStatus({
        message:
          error instanceof Error ? error.message : "Confirmation failed.",
        textClass: "text-red-600",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-center">
        <CardTitle>You&apos;re almost there</CardTitle>
        <CardDescription>
          Check your email for a confirmation code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-80"
        >
          <div className="grid w-full items-center gap-4">
            {/* Input field for email */}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field"
              required
            />
            {/* Input field for confirmation code */}
            <Input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Enter confirmation code"
              className="input-field"
              required
            />
            {/* Submit button */}
            <SubmitButton btnText="Confirm Sign Up" />
            {/* Display submission status message */}
            <div className="flex justify-center text-sm">
              <p
                className={`my-2 ${submitStatus.textClass}`}
                role="status"
                aria-live="polite"
              >
                {submitStatus.message}
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
