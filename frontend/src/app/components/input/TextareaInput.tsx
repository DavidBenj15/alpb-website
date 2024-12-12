/**
 * TextareaInput Component
 *
 * A reusable textarea component for forms. It supports labels, placeholders,
 * and required fields, and is styled with utility classes.
 */

import React from "react";

/**
 * Props for the TextareaInput Component
 *
 * @property {string} id - The unique identifier for the textarea element.
 * @property {string} label - The label text displayed above the textarea.
 * @property {boolean} required - Whether the textarea field is required.
 * @property {string} placeholder - Placeholder text displayed inside the textarea.
 */
type TextareaProps = {
  id: string;
  label: string;
  required: boolean;
  placeholder: string;
};

/**
 * TextareaInput Component
 *
 * @param {TextareaProps} props - Props for the TextareaInput component.
 * @returns {JSX.Element} - The JSX representation of the textarea field.
 */
export default function TextareaInput({
  id,
  label,
  required,
  placeholder,
}: TextareaProps) {
  return (
    <div key={id} className="mb-5 w-full">
      {/* Label for the textarea */}
      <label htmlFor={id} className="block mb-1 text-m">
        {label}
      </label>

      {/* Textarea field */}
      <textarea
        id={id}
        name={id}
        required={required}
        placeholder={placeholder}
        className="border
                    border-gray-300
                    rounded
                    p-2
                    text-black
                    w-full
                    text-sm
                    font-normal"
      />
    </div>
  );
}
