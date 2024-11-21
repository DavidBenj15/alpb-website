/**
 * SelectField Component
 *
 * A reusable select dropdown component for forms. It includes support for labels, 
 * required fields, a list of options, and optional subtext for additional information.
 */

import React from "react";

/**
 * Props for the SelectField Component
 *
 * @property {string} id - The unique identifier for the select element.
 * @property {string} label - The label text displayed above the select dropdown.
 * @property {boolean} required - Whether the select field is required.
 * @property {string[]} options - An array of options to populate the dropdown.
 * @property {string} [subtext] - Optional subtext displayed below the select dropdown.
 */
type InputProps = {
  id: string;
  label: string;
  required: boolean;
  options: string[];
  subtext?: string;
};

/**
 * SelectField Component
 *
 * @param {InputProps} props - Props for the SelectField component.
 * @returns {JSX.Element} - The JSX representation of the select dropdown.
 */
export default function SelectField({
  id,
  label,
  required,
  options,
  subtext,
}: InputProps) {
  return (
    <div key={id} className="mb-5 w-full">
      {/* Label for the select dropdown */}
      <label htmlFor={id} className="block mb-1 text-m">
        {label}
      </label>

      {/* Select dropdown */}
      <select
        id={id}
        name={id}
        required={required}
        className="w-full text-sm border border-gray-300 rounded p-2"
      >
        {options.map((val, index) => (
          <option key={index} value={val}>
            {val}
          </option>
        ))}
      </select>

      {/* Optional subtext */}
      {subtext ? (
        <div className="text-sm text-gray-500 mt-1">{subtext}</div>
      ) : null}
    </div>
  );
}

