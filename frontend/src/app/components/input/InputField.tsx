/**
 * TextInput Component
 *
 * A reusable input component for forms. It includes support for labels, placeholders,
 * subtext, and required fields. This component is designed for text-based inputs
 * but can be extended or adapted for other input types.
 */

import React from "react";

/**
 * Props for the TextInput Component
 *
 * @property {string} id - The unique identifier for the input element.
 * @property {string} label - The label text displayed above the input field.
 * @property {string} type - The type of input (e.g., "text", "email", "password").
 * @property {boolean} required - Whether the input is required.
 * @property {string} [placeholder] - Placeholder text displayed inside the input field.
 * @property {string} [subtext] - Optional subtext displayed below the input field.
 */
type InputProps = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  subtext?: string;
};

/**
 * TextInput Component
 *
 * @param {InputProps} props - Props for the TextInput component.
 * @returns {JSX.Element} - The JSX representation of the input field.
 */
export default function TextInput({
  id,
  label,
  type,
  required,
  placeholder,
  subtext,
}: InputProps) {
  return (
    <div key={id} className="mb-5 w-full">
      {/* Label for the input */}
      <label htmlFor={id} className="block mb-1 text-m">
        {label}
      </label>

      {/* Input field */}
      <input
        type={type}
        id={id}
        name={id}
        required={required}
        placeholder={placeholder}
        className={`
          border 
          border-gray-300 
          rounded 
          p-2
          text-black
          text-sm
          font-normal
          w-full
        `}
      />

      {/* Optional subtext */}
      {subtext ? (
        <div className="text-sm text-gray-500 mt-1">{subtext}</div>
      ) : null}
    </div>
  );
}

