/**
 * FilterDropdown Component
 *
 * This component renders a dropdown menu for managing filters. It includes functionality to toggle
 * a "Favorites" filter and provides a placeholder for additional filters like categories.
 * The state is managed using React's `useState` and `useEffect` hooks, along with `@nanostores/react` for shared state.
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
} from "@/app/components/ui/dropdown-menu"; // UI components for dropdown functionality
import { MixerVerticalIcon } from "@radix-ui/react-icons"; // Icon used for the dropdown trigger
import { Button } from "../ui/button"; // Button component (not currently used but imported for possible extension)
import { useStore } from "@nanostores/react"; // React hook for accessing nanostores
import { $filters, addFilter, removeFilter } from "@/lib/store"; // Nanostores state and actions for filters
import { useState, useEffect } from "react"; // React hooks for managing component state and lifecycle
import CategoriesDropdown from "./categories-dropdown"; // CategoriesDropdown component (currently commented out)

/**
 * FilterDropdown Component
 *
 * @returns {JSX.Element} - A dropdown menu with filter options.
 */
function FilterDropdown() {
  // Local state to track whether the "Favorites" filter is active
  const [favsFilterActive, setFavsFilterActive] = useState(false);

  // Accessing the shared filters state using nanostores
  const filters = useStore($filters);

  /**
   * Sync local state with the global filters state.
   * If "favorites" is present in the global filters, mark it as active locally.
   */
  useEffect(() => {
    if (filters.has("favorites")) {
      setFavsFilterActive(true);
    }
  }, [filters]); // Runs whenever the `filters` state changes

  /**
   * Toggles the "Favorites" filter.
   * Adds or removes "favorites" from the global filters and updates the local state.
   */
  const toggleFavsFilter = () => {
    if (filters.has("favorites")) {
      removeFilter("favorites"); // Remove the "favorites" filter globally
      setFavsFilterActive(false); // Update local state to inactive
    } else {
      addFilter("favorites"); // Add the "favorites" filter globally
      setFavsFilterActive(true); // Update local state to active
    }
  };

  return (
    <DropdownMenu>
      {/* Dropdown trigger button with an icon */}
      <DropdownMenuTrigger asChild>
        <button className="mx-3">
          <MixerVerticalIcon className="size-6" />
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown menu content */}
      <DropdownMenuContent className="w-56">
        {/* Dropdown label */}
        <DropdownMenuLabel>Filters</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Favorites filter option */}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <DropdownMenuCheckboxItem
              checked={favsFilterActive} // Checked state based on local state
              onCheckedChange={toggleFavsFilter} // Toggles the "Favorites" filter
            >
              Favorites
            </DropdownMenuCheckboxItem>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Placeholder for additional filters, such as categories */}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            {/* Uncomment and use the CategoriesDropdown for additional category filters */}
            {/* <CategoriesDropdown /> */}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default FilterDropdown;
