/**
 * Search Component
 *
 * This component provides a search input for filtering widgets based on a user query.
 * It updates the global state with the current search term using `setWidgetQuery` from the store.
 */

import React from "react"; // Import React library
import { Input } from "../ui/input"; // Custom Input component for styled input fields
import { setWidgetQuery } from "@/lib/store"; // Action to update the widget search query in the global store

/**
 * Search Component
 *
 * @returns {JSX.Element} - A styled input field for searching widgets.
 */
export default function Search() {
  return (
    <Input
      type="text" // Input type set to text for free-form text entry
      placeholder="Search for widgets" // Placeholder text displayed inside the input field
      className="w-1/3 max-w-72" // Tailwind CSS classes for responsive styling
      onChange={(e) => setWidgetQuery(e.target.value)} // Updates the global search query state on user input
    />
  );
}

