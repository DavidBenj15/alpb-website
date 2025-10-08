"use client";

import { useState, useEffect } from "react";
import {
  fetchPendingWidgets,
  approveWidget,
  declineWidget,
} from "../../api/widget";
import { PendingWidget } from "@/data/types";
import ProtectedRoute from "../components/ProtectedRoutes";
import { AppSidebar } from "@/app/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function PendingWidgetsPage() {
  const [requests, setRequests] = useState<PendingWidget[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch pending widgets from the backend
  useEffect(() => {
    const loadPendingWidgets = async () => {
      try {
        setLoading(true);
        const data = await fetchPendingWidgets();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching widgets:", error);
        setStatus("Error loading pending widgets");
      } finally {
        setLoading(false);
      }
    };

    loadPendingWidgets();
  }, []);

  // Handle approving a widget
  const handleApproveWidget = async (requestId: string) => {
    try {
      const result = await approveWidget(requestId);
      setStatus("Widget approved successfully");

      // Remove the approved widget from the list
      setRequests((prevWidgets) =>
        prevWidgets.filter((request) => request.request_id !== requestId),
      );
    } catch (error: any) {
      setStatus(error.message || "Error approving widget.");
    }
  };

  // Handle declining a widget
  const handleDeclineWidget = async (requestId: string) => {
    try {
      const result = await declineWidget(requestId);
      setStatus("Widget declined successfully");
      
      // Remove the declined widget from the list
      setRequests((prevWidgets) =>
        prevWidgets.filter((request) => request.request_id !== requestId),
      );
    } catch (error: any) {
      setStatus(error.message || "Error declining widget.");
    }
  };

  return (
    <ProtectedRoute role="master">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger />
          <div className="container mx-auto p-8">
            <h1 className="text-3xl mb-8 text-center">Pending Widgets</h1>

            {status && (
              <p className="text-center text-green-600 mb-4 font-semibold">
                {status}
              </p>
            )}

            {loading ? (
              <p className="text-center text-gray-600">Loading pending widgets...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-gray-600">
                No pending widget requests.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <Card
                    key={request.request_id}
                    className="p-6 bg-white rounded-lg shadow-md border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {request.widget_name}
                    </h3>
                    <p className="text-gray-600 mb-2">{request.description}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      Visibility: {request.visibility}
                    </p>
                    <p className="text-sm text-yellow-600 mb-4">
                      Status: {request.status}
                    </p>
                    <div className="flex justify-between">
                      <Button
                        className="bg-red-500 hover:bg-red-400"
                        onClick={() => handleDeclineWidget(request.request_id)}
                      >
                        Decline
                      </Button>
                      <Button
                        className="bg-green-500 hover:bg-green-400"
                        onClick={() => handleApproveWidget(request.request_id)}
                      >
                        Approve
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
