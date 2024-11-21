/**
 * SubmitButton Component
 *
 * A reusable button component for form submission. It includes support for
 * dynamically changing the text and a disabled state when the form is pending.
 */

import { useFormStatus } from "react-dom"; // Hook to track form submission status

/**
 * Props for the SubmitButton Component
 *
 * @property {string} btnText - The text to display on the button.
 */
type InputProps = {
  btnText: string;
};

/**
 * SubmitButton Component
 *
 * @param {InputProps} props - Props for the SubmitButton component.
 * @returns {JSX.Element} - The JSX representation of the submit button.
 */
export default function SubmitButton({ btnText }: InputProps) {
  const { pending } = useFormStatus(); // Tracks whether the form is pending submission

  return (
    <button
      type="submit" // Sets the button type to submit for form submission
      aria-disabled={pending} // Adds accessibility support for the disabled state
      className={`
        bg-slate-50
        px-5
        py-3
        my-7
        rounded
        text-black
        hover:bg-alpbBlue
        hover:text-white
        transition
        duration-100
        ${pending ? "opacity-50 cursor-not-allowed" : ""}
      `}
      disabled={pending} // Disables the button when the form is pending
    >
      {btnText}
    </button>
  );
}

