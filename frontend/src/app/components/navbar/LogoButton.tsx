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

type LogoButtonProps = {
  width: number;
  height: number;
};

/**
 * LogoButton Component
 *
 * @returns {JSX.Element} - The JSX representation of a button with a logo.
 */
export default function LogoButton({ width, height }: LogoButtonProps) {
  const router = useRouter(); // Hook to access the Next.js router

  /**
   * Handles the button click event.
   * Navigates the user to the home page ("/").
   */
  const handleClick = () => {
    router.push("/"); // Redirect to the home page
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: width,
        height: height,
        cursor: "pointer",
      }}
      className="flex justify-center items-center"
    >
      <Image
        src="/alpb-logo.png"
        alt="ALPB Logo"
        width={width}
        height={height}
      />
    </div>
  );
}
