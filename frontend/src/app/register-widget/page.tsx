import { WidgetForm } from "./WidgetForm"; // Importing the WidgetForm component
import ProtectedRoute from "../components/ProtectedRoutes"; // Importing the ProtectedRoute component
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";

export default function Home() {
  return (
    <ProtectedRoute role="widget developer">
        <SidebarProvider>
        {" "}
        {/* Ensures the route is protected and only accessible to authorized users */}
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger />
            <div className="w-full flex justify-center">
              <WidgetForm />
            </div>
        </SidebarInset>
      </SidebarProvider>

    </ProtectedRoute>
  );
}
