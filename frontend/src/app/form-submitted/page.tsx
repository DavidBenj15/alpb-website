import React from "react";
import { CiCircleCheck } from "react-icons/ci";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import ProtectedRoute from "../components/ProtectedRoutes";

export default function page() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        {" "}
        {/* Ensures the route is protected and only accessible to authorized users */}
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger />
            <div>
              <div className="flex flex-col justify-center items-center m-20">
                <h1>Thank you!</h1>
                <p className="text-m">We recieved your registration form.</p>
                <CiCircleCheck size={100} className="m-5" /> {/* Checkmark icon */}
                <p>Look out for an email from us for next steps.</p>
              </div>
            </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>

  );
}
