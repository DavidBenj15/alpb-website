"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "../components/input/InputField";
import TextareaInput from "../components/input/TextareaInput";
import SubmitButton from "../components/input/SubmitButton";
import SelectField from "../components/input/SelectField";
import { registerWidget } from "../../api/widget";
import { useStore } from "@nanostores/react";
import { useAuth } from "../contexts/AuthContext";

const initialState = {
  message: "",
};

export function WidgetForm() {
  const [state, setState] = useState(initialState);
  const router = useRouter();
  const { idToken } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget); // form data -> key-value pairs
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value as string;
    });

    try {
      if (!idToken) {
        throw new Error("ID Token not found. Please log in again."); // Ensure the user is authenticated
      }

      // Send data to the backend
      const widgetData = {
        widgetName: data["widget-name"],
        description: data["description"],
        visibility: data["visibility"],
        status: "pending", // Default status for new widgets
      };
      const result = await registerWidget(widgetData, idToken); // The data will be sent to the backend
      console.log(result); // Handle success (e.g., show a message or redirect)
      router.push("/form-submitted"); // Redirect on success
    } catch (error) {
      console.error("Error submitting form:", error);
      setState({ message: "Error submitting form" }); // Update state with error message
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-80">
      <InputField
        id="email"
        label="Email"
        type="email"
        required={true}
        placeholder="your@email.com"
        subtext="You'll receive updates about your widget through this email."
      />
      <InputField
        id="widget-name"
        label="Widget name"
        type="text"
        required={true}
        placeholder="Your widget name"
      />
      <TextareaInput
        id="description"
        label="Description"
        required={false}
        placeholder="A brief description"
      />
      <SelectField
        id="visibility"
        label="Visibility"
        required={true}
        options={[
          "Your team only - Hagerstown Flying Boxcars",
          "Custom - Analytics Group 1",
          "Public",
        ]}
        subtext="You can change this option later."
      />
      <SubmitButton btnText="Register" />
      <p aria-live="polite" className="sr-only" role="status">
        {state?.message} {/* Display status message */}
      </p>
    </form>
  );
}
