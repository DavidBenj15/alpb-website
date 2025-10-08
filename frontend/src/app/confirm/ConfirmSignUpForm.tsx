"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmSignUp, resendConfirmationCode } from "../../services/authService";
import SubmitButton from "../components/input/SubmitButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

// Component for confirming sign-up
export function ConfirmSignUpForm() {
  // State variables for email, confirmation code, and submission status
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [submitStatus, setSubmitStatus] = useState({
    message: "",
    textClass: "black",
  });
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showDeveloperPopup, setShowDeveloperPopup] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const typeParam = searchParams.get("type");

    if (emailParam) {
      setEmail(emailParam);
    }
    if (typeParam === "developer") {
      setIsDeveloper(true);
    }
  }, [searchParams]);

  // Handle resending confirmation code
  const handleResendCode = async () => {
    if (!email) {
      setSubmitStatus({
        message: "Please enter your email address first",
        textClass: "text-red-600",
      });
      return;
    }

    setIsResending(true);
    try {
      await resendConfirmationCode(email);
      setSubmitStatus({
        message: "Confirmation code resent! Please check your email.",
        textClass: "text-green-600",
      });
    } catch (error: unknown) {
      setSubmitStatus({
        message: error instanceof Error ? error.message : "Failed to resend confirmation code",
        textClass: "text-red-600",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitStatus({
      message: "",
      textClass: "text-black",
    });

    try {
      await confirmSignUp(email, confirmationCode);
      
      if (isDeveloper) {
        // Show popup for developers instead of redirecting
        setShowDeveloperPopup(true);
        setSubmitStatus({
          message: "Email confirmed! Please check the popup for next steps.",
          textClass: "text-green-600",
        });
      } else {
        // Regular users get redirected to sign-in
        setSubmitStatus({
          message: "Account confirmed! Redirecting to login...",
          textClass: "text-green-600",
        });
        setTimeout(() => router.push("/sign-in"), 200);
      }
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
            
            {/* Resend code button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending || !email}
                className="w-full"
              >
                {isResending ? "Resending..." : "Resend Confirmation Code"}
              </Button>
            </div>
            
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
      
      {/* Developer Confirmation Popup */}
      <AlertDialog open={showDeveloperPopup} onOpenChange={setShowDeveloperPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email Confirmed Successfully!</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-left space-y-3">
                <p>
                  Your email has been confirmed and your developer account request has been submitted.
                </p>
                <p>
                  <strong>What happens next:</strong>
                </p>
                <div className="ml-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Your request will be reviewed by our team</span>
                  </div>
                  <div className="flex items-start space-x-2 mt-1">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>You&apos;ll receive a confirmation email with your API key once approved</span>
                  </div>
                  <div className="flex items-start space-x-2 mt-1">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>You can then log in and start developing widgets</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Please check your email regularly for updates on your developer account status.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDeveloperPopup(false)}>
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
