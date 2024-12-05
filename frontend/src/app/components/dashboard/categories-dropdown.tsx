/**
 * CategoriesDropdown Component
 *
 * This component renders a dropdown menu for selecting categories and filtering items.
 * It uses the `@nanostores/react` library for state management and integrates UI components
 * from a custom dropdown menu library.
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/app/components/ui/dropdown-menu"; // Importing custom dropdown components
import { Button } from "../ui/button"; // Importing a custom button component
import { MixerVerticalIcon } from "@radix-ui/react-icons"; // Importing an icon from Radix UI
import { useStore } from "@nanostores/react"; // Importing nanostores state management hooks
import {
  $activeCategoryIds,
  $filters,
  addFilter,
  removeFilter,
} from "@/lib/store"; // Importing stores and actions
import { useState, useEffect } from "react"; // React hooks for state and lifecycle management

/**
 * CategoriesDropdown Component
 *
 * @returns {JSX.Element} - A dropdown menu for category selection and filtering.
 */
function CategoriesDropdown() {
  // Accessing the current filter states using nanostores
  const filters = useStore($filters); // Retrieves the current list of applied filters
  const activeCategories = useStore($activeCategoryIds); // Retrieves the active category IDs

  // Placeholder for potential side effects or lifecycle management
  // useEffect(() => {
  //   // Logic for handling updates to the dropdown or categories could go here
  // }, []);

  // Placeholder for toggle functionality for favorites filter
  // const toggleFavsFilter = () => {
  //   // Logic for toggling "Favorites" filter goes here
  // }

  return (
    <DropdownMenu>
      {/* Dropdown trigger button */}
      <DropdownMenuTrigger asChild>
        <button className="mx-3">Categories</button>
      </DropdownMenuTrigger>

      {/* Dropdown content */}
      <DropdownMenuContent className="w-56">
        {/* Dropdown label */}
        <DropdownMenuLabel>Categories</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Favorites checkbox */}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <DropdownMenuCheckboxItem
            // checked={} // Add logic to determine if "Favorites" is checked
            // onCheckedChange={} // Add handler for toggling "Favorites"
            >
              Favorites
            </DropdownMenuCheckboxItem>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Placeholder for additional category items */}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            heyyy {/* Replace with dynamic category content */}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CategoriesDropdown;
