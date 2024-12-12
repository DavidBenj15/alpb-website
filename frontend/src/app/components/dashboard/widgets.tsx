/**
 * Widgets Component
 *
 * This component is responsible for fetching and displaying a list of widgets.
 * It handles filtering widgets based on user role, search query, favorite status,
 * and widget developer status. It uses React hooks and state management with nanostores
 * to manage the filtering and display of widgets dynamically.
 */

import React, { useEffect, useMemo, useState } from "react";
import Widget from "./widget"; // Component to display individual widget details
import { fetchWidgets } from "../../../api/widget"; // API call to fetch widgets
import { useAuth } from "@/app/contexts/AuthContext"; // Custom hook to get user authentication state
import { WidgetType } from "@/data/types"; // Type definition for widget data
import useQueryWidgets from "@/app/hooks/use-query-widgets"; // Custom hook to query widgets
import {
  $favWidgetIds,
  $filtersVersion,
  $filters,
  $widgetQuery,
  $widgetsVersion,
  $user,
} from "@/lib/store"; // Nanostores for managing application state
import { useStore } from "@nanostores/react"; // Hook to access the store

/**
 * Widgets Component
 *
 * @returns {JSX.Element} - A grid of filtered widgets based on user preferences and role.
 */
export default function Widgets() {
  // Local state to manage loading status and developer status
  const [loading, setLoading] = useState(true);
  const [isDev, setIsDev] = useState(false);

  // Fetch widgets using a custom hook
  const { widgets } = useQueryWidgets();

  // Accessing global store values using nanostores
  const widgetsVersion = useStore($widgetsVersion);
  const favWidgetIds = useStore($favWidgetIds);
  const filtersVersion = useStore($filtersVersion);
  const widgetQuery = useStore($widgetQuery);
  const filters = useStore($filters);
  const user = useStore($user);

  useEffect(() => {
    console.log(widgets);
  }, [widgets])

  /**
   * Sets the user role (whether the user is a "Widget Developer").
   * Based on the user's role, it adjusts the `isDev` state to control widget visibility.
   */
  const setUserRole = async () => {
    try {
      if (user.role.toLowerCase() === "widget developer") {
        setIsDev(true); // Set to true if the user is a widget developer
      } else {
        setIsDev(false); // Set to false for other roles
      }
    } catch (error) {
      console.error("Error fetching widgets:", error);
    } finally {
      setLoading(false); // Stop loading after role is set
    }
  };

  // Set user role whenever userId or userRole changes
  useEffect(() => {
    setUserRole();
  }, [user.id, user.role]);

  /**
   * Filters the widgets based on:
   * - Search query: widget name or description must match the query.
   * - Favorites filter: only favorite widgets will be shown if the "favorites" filter is active.
   * - Developer filter: if the user is a widget developer, only widgets created by the user will be shown.
   * @returns {WidgetType[]} - Filtered list of widgets based on the active filters.
   */
  const filteredWidgets = useMemo(() => {
    return widgets.filter((widget) => {
      const lowerName = widget.name.toLowerCase();
      const lowerDescription = widget.description?.toLowerCase();
      const lowerQuery = widgetQuery.toLowerCase();

      // Check if widget name or description matches the search query
      if (
        !(
          lowerName.includes(lowerQuery) ||
          lowerDescription?.includes(lowerQuery)
        )
      ) {
        return false;
      }

      // If "favorites" filter is enabled, only show widgets in the favorites list
      if (filters.has("favorites") && !favWidgetIds.has(widget.id)) {
        return false;
      }

      // If the user is a widget developer, only show widgets they created
      if (isDev) {
        if (user.id && widget.developerIds?.includes(String(user.id))) {
          return true; // Widget is created by the current user
        }
        return false; // Widget is not created by the current user
      }

      // Show all widgets that match the search and filtering criteria
      return true;
    });
  }, [
    filtersVersion,
    widgetsVersion,
    widgets,
    favWidgetIds,
    widgetQuery,
    isDev,
    user,
    filters,
  ]);

  // Display loading message while widgets are being fetched
  if (loading) {
    return <p>Loading widgets...</p>; // This message can be improved with a loader
  }

  return (
    <div className="grid gap-10 p-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
      {/* Map through filtered widgets and display them */}
      {filteredWidgets.map((widget) => (
        <Widget
          key={widget.id}
          {...widget} // Spread the widget properties as props
          isDev={isDev} // Pass developer status
          visibility={widget.visibility ?? "Private"} // Pass visibility status (default to "Private")
          isFavorite={favWidgetIds.has(widget.id)} // Pass whether the widget is in favorites
        />
      ))}
    </div>
  );
}
