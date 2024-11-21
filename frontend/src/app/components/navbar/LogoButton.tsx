"use client";

/**
 * LogoButton Component
 *
 * A reusable button component that displays a logo and navigates to the home page 
 * when clicked. It uses Next.js's `useRouter` for navigation and `next/image` for 
 * optimized image rendering.
 */

import React from "react";
import { useRouter } from "next/navigation"; // Next.js hook for client-side navigation
import Image from "next/image"; // Optimized image component from Next.js

/**
 * LogoButton Component
 *
 * @returns {JSX.Element} - The JSX representation of a button with a logo.
 */
export default function LogoButton() {
  const router = useRouter(); // Hook to access the Next.js router

  /**
   * Handles the button click event.
   * Navigates the user to the home page ("/").
   */
  const handleClick = () => {
    router.push("/"); // Redirect to the home page
  };

  return (
    <button
      className="h-10 w-12 relative" // Utility classes for button dimensions and positioning
      onClick={handleClick} // Attach the click handler
    >
      {/* Logo Image */}
      <Image
        src="/alpb-logo.png" // Path to the logo image
        alt="ALPB logo" // Alternative text for accessibility
        fill={true} // Allows the image to fill the container
        sizes="(max-width: 768px) 100vw" // Responsive sizes for image optimization
      />
    </button>
  );
}

