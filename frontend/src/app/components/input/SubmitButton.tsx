/**
 * SubmitButton Component
 *
 * A reusable button component for form submission. It includes support for
 * dynamically changing the text and a disabled state when the form is pending.
 */

import { useFormStatus } from "react-dom"; // Hook to track form submission status
import { Button } from "../ui/button";

/**
 * Props for the SubmitButton Component
 *
 * @property {string} btnText - The text to display on the button.
 */
type InputProps = {
  btnText: string;
  className?: string;
};

/**
 * SubmitButton Component
 *
 * @param {InputProps} props - Props for the SubmitButton component.
 * @returns {JSX.Element} - The JSX representation of the submit button.
 */
export default function SubmitButton({ btnText, className }: InputProps) {
  const { pending } = useFormStatus(); // Tracks whether the form is pending submission

  return (
    <Button
      type="submit" // Sets the button type to submit for form submission
      aria-disabled={pending} // Adds accessibility support for the disabled state
      className={`
        ${className} 
        w-full
        transition
        duration-100
        bg-alpbBlue
        hover:bg-[#25366b]
        ${pending ? "opacity-50 cursor-not-allowed" : ""}
      `}
      disabled={pending} // Disables the button when the form is pending
    >
      {btnText}
    </Button>
  );
}
