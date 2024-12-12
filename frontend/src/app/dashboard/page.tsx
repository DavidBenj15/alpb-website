"use client";
import { AppSidebar } from "@/app/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar";
import ProtectedRoute from "../components/ProtectedRoutes";
import useQueryWidgets from "../hooks/use-query-widgets";
import Search from "../components/dashboard/search";
import FilterDropdown from "../components/dashboard/filter-dropdown";
import RegisterWidget from "../components/dashboard/register-widget";
import Widgets from "../components/dashboard/widgets";

export default function Page() {
  const { widgets } = useQueryWidgets();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {" "}
          {/* Ensures the route is protected and only accessible to authenticated users */}
          <SidebarTrigger />
          {widgets.length > 0 && (
            <div className="flex justify-center w-full mt-10">
              <Search /> {/* Search component for filtering widgets */}
              <FilterDropdown />{" "}
              {/* Dropdown for additional filtering options */}
            </div>
          )}
          <div className="flex justify-center p-10">
            {widgets.length > 0 && (
              <div>
                <Widgets /> {/* Component to display the list of widgets */}
              </div>
            )}
            {widgets.length == 0 && <RegisterWidget />}{" "}
            {/* Component to register a new widget if none exist */}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
