/**
 * Navbar Component
 *
 * A responsive navigation bar component that includes:
 * - A menu button for toggling navigation menus.
 * - A logo button that redirects to the home page.
 * - A profile button displaying user initials if provided.
 * The layout is styled with utility classes for a clean and functional design.
 */

import React from "react";
import ProfileButton from "./ProfileButton"; // Button for user profile actions
import MenuButton from "./MenuButton"; // Button for toggling navigation menus
import LogoButton from "./LogoButton"; // Button with the application's logo

/**
 * Props for the Navbar Component
 *
 * @property {string} [initials] - Optional initials to display in the profile button.
 */
type InputProps = {
  initials?: string;
};

/**
 * Navbar Component
 *
 * @param {InputProps} props - Props for the Navbar component.
 * @returns {JSX.Element} - The JSX representation of the navigation bar.
 */
export default function Navbar({ initials }: InputProps) {
  return (
    <div
      className="w-full sticky top-0 h-20 bg-alpbBlue flex items-center z-50"
      // Utility classes:
      // - `w-full`: Full-width container
      // - `sticky top-0`: Sticks the navbar to the top of the viewport
      // - `h-20`: Sets the navbar height
      // - `bg-alpbBlue`: Background color
      // - `flex items-center`: Centers the content vertically
      // - `z-50`: Ensures the navbar appears above other elements
    >
      {/* Menu Button */}
      <MenuButton />

      {/* Spacer to center the logo */}
      <div className="flex-grow" />

      {/* Logo Button */}
      <LogoButton />

      {/* Spacer to center the profile button */}
      <div className="flex-grow" />

      {/* Profile Button or Placeholder */}
      {initials ? (
        <ProfileButton initials={initials} />
      ) : (
        <div className="size-10 mx-5" />
        // Placeholder for the profile button when initials are not provided
      )}
    </div>
  );
}

