/**
 * RegisterWidget Component
 *
 * This component provides a user interface for navigating to a widget registration page.
 * It displays a card with a message and a button that redirects the user to the registration page.
 */

"use client"; // Indicates that this is a client-side rendered component in Next.js

import React from "react"; // Import React library
import { Card, CardContent, CardHeader } from "../ui/card"; // Import UI components for card structure
import { Button } from "../ui/button"; // Import UI button component
import { useRouter } from "next/navigation"; // Import Next.js router hook for navigation

/**
 * RegisterWidget Component
 *
 * @returns {JSX.Element} - A card component with a button to navigate to the widget registration page.
 */
export default function RegisterWidget() {
  // Access Next.js router for programmatic navigation
  const router = useRouter();

  /**
   * Handles the button click event.
   * Navigates the user to the widget registration page.
   */
  const handleClick = () => {
    router.push("/register-widget"); // Redirect to the "/register-widget" route
  };

  return (
    <Card>
      {/* Card header with a message */}
      <CardHeader>{"Don't see any widgets?"}</CardHeader>

      {/* Card content with a centered button */}
      <CardContent className="flex justify-center">
        <Button onClick={handleClick}>Register a widget</Button>
      </CardContent>
    </Card>
  );
}
