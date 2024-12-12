/**
 * ProfileButton Component
 *
 * A reusable button component that displays user initials.
 * It is styled as a circular button, making it ideal for use in navigation bars or user menus.
 */

import React from "react";

/**
 * Props for the ProfileButton Component
 *
 * @property {string} initials - The initials of the user to be displayed inside the button.
 */
type InputProps = {
  initials: string;
};

/**
 * ProfileButton Component
 *
 * @param {InputProps} props - Props for the ProfileButton component.
 * @returns {JSX.Element} - The JSX representation of the profile button.
 */
export default function ProfileButton({ initials }: InputProps) {
  return (
    <button
      className="rounded-full size-10 bg-white mx-5 justify-self-end"
      // Utility classes:
      // - `rounded-full`: Makes the button circular
      // - `size-10`: Sets the width and height of the button
      // - `bg-white`: Sets the background color to white
      // - `mx-5`: Adds horizontal margin for spacing
      // - `justify-self-end`: Aligns the button to the end of its container if applicable
    >
      <p className="text-sm">{initials}</p>
      {/* The text inside the button, styled with `text-sm` for smaller font size */}
    </button>
  );
}
