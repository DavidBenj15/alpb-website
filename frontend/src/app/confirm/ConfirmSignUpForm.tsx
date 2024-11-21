"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmSignUp } from "../../services/authService"; // You'll implement this function
import SubmitButton from "../components/input/SubmitButton";

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

    try {
      // Call the confirmSignUp function to verify the account
      await confirmSignUp(email, confirmationCode);
      // Update submission status on success
      setSubmitStatus({
        message: "Account confirmed! Redirecting to login...",
        textClass: "text-green-500",
      });
      // Redirect to login after successful confirmation
      setTimeout(() => router.push("/sign-in"), 200);
    } catch (error: unknown) {
      // Update submission status on failure
      setSubmitStatus({
        message:
          error instanceof Error ? error.message : "Confirmation failed.",
        textClass: "text-red-500",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-80">
      {/* Input field for email */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="input-field"
        required
      />
      {/* Input field for confirmation code */}
      <input
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
      <p
        aria-live="polite"
        className={`mb-2 ${submitStatus.textClass}`}
        role="status"
      >
        {submitStatus.message}
      </p>
    </form>
  );
}
