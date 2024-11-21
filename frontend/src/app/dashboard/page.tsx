"use client";
import Link from "next/link";
import Navbar from "../components/navbar/Navbar";
import Widgets from "../components/dashboard/widgets";
import Search from "../components/dashboard/search";
import ProtectedRoute from "../components/ProtectedRoutes";
import { $widgets } from "@/lib/store";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import RegisterWidget from "../components/dashboard/register-widget";
import useQueryWidgets from "../hooks/use-query-widgets";
import FilterDropdown from "../components/dashboard/filter-dropdown";

export default function Dashboard() {
  const { widgets } = useQueryWidgets(); // Custom hook to fetch widgets

  return (
    <ProtectedRoute> {/* Ensures the route is protected and only accessible to authenticated users */}
      <Navbar />
      {widgets.length > 0 && (
        <div className="flex justify-center w-full mt-10">
          <Search /> {/* Search component for filtering widgets */}
          <FilterDropdown /> {/* Dropdown for additional filtering options */}
        </div>
      )}
      <div className="flex justify-center p-10">
        {widgets.length > 0 && (
          <div>
            <Widgets /> {/* Component to display the list of widgets */}
          </div>
        )}
        {widgets.length == 0 && <RegisterWidget />} {/* Component to register a new widget if none exist */}
      </div>
    </ProtectedRoute>
  );
}
