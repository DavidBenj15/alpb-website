"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "../components/input/InputField";
import SubmitButton from "../components/input/SubmitButton";
import SelectField from "../components/input/SelectField";
import { signUpUser } from "../../api/auth"; // Now importing from api/auth

const initialSubmitStatus = {
  message: "",
  textClass: "text-black",
};

export function SignupForm() {
  const [submitStatus, setSubmitStatus] = useState(initialSubmitStatus);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value as string;
    });

    // Verify that passwords match
    if (data["password"] !== data["confirm-password"]) {
      setSubmitStatus({
        message: "Error: passwords don't match",
        textClass: "text-red-500",
      });
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
      };

      await signUpUser(userData); // This will now call your backend
      setSubmitStatus({
        message: "Sign up successful! Redirecting...",
        textClass: "text-green-500",
      });

      // Redirect to the confirmation page
      setTimeout(() => router.push("/confirm"), 200);
    } catch (error: unknown) {
      // Properly handle the error type
      if (error instanceof Error) {
        setSubmitStatus({
          message: error.message || "Sign up failed. Please try again.",
          textClass: "text-red-500",
        });
      } else {
        setSubmitStatus({
          message: "Sign up failed. Please try again.",
          textClass: "text-red-500",
        });
      }
      console.error("Sign up error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-80">
      <InputField
        id="first-name"
        label="First name"
        type="text"
        required={true}
        placeholder="Enter first name"
      />
      <InputField
        id="last-name"
        label="Last name"
        type="text"
        required={true}
        placeholder="Enter last name"
      />
      <InputField
        id="email"
        label="Email"
        type="email"
        required={true}
        placeholder="your@email.com"
      />
      <InputField
        id="password"
        label="Password"
        type="password"
        required={true}
      />
      <InputField
        id="confirm-password"
        label="Confirm password"
        type="password"
        required={true}
      />
      <SelectField
        id="account-type"
        label="I am a..."
        required={true}
        options={["Widget Developer", "league", "master"]} // Options for account type
      />
      <SubmitButton btnText="Sign up" />
      <p className={`${submitStatus?.textClass} mb-5`} role="status">
        {submitStatus?.message}
      </p>
    </form>
  );
}
