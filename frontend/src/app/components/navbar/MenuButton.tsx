/**
 * MenuButton Component
 *
 * A reusable button component that displays a menu icon.
 * It uses the `IoMdMenu` icon from `react-icons` for the menu representation.
 * The button is styled with utility classes and is designed for easy integration
 * into navigation or toolbar components.
 */

import React from "react";
import { IoMdMenu } from "react-icons/io"; // Menu icon from the react-icons library

/**
 * MenuButton Component
 *
 * @returns {JSX.Element} - The JSX representation of a menu button.
 */
export default function MenuButton() {
  return (
    <button
      className="mx-5 size-10" // Utility classes for margin and size
      aria-label="Open menu" // Accessibility label for screen readers
    >
      <IoMdMenu
        className="size-full" // Utility class to make the icon fill the button
        color="white" // White color for the icon
      />
    </button>
  );
}

