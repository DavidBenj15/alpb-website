import React from "react";

type InputProps = {
  id: string;
  label: string;
  required: boolean;
  options: string[];
  subtext?: string;
};

export default function SelectField({
  id,
  label,
  required,
  options,
  subtext,
}: InputProps) {
  return (
    <div key={id} className="mb-5 w-full">
      <label htmlFor={id} className="block mb-1 text-m">
        {label}
      </label>

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
      {subtext ? (
        <div className="text-sm text-gray-500 mt-1">{subtext}</div>
      ) : null}
    </div>
  );
}
