"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/app/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar";
import ProtectedRoute from "../components/ProtectedRoutes";
import { fetchPendingDevelopers, approveDeveloper, declineDeveloper } from "@/api/developer";
import { PendingDeveloper } from "@/data/types";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function PendingDevelopersPage() {
  const [requests, setRequests] = useState<PendingDeveloper[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch pending developers from the backend
  useEffect(() => {
    const loadPendingDevelopers = async () => {
      try {
        setLoading(true);
        const data = await fetchPendingDevelopers();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching pending developers:", error);
        setStatus("Error loading pending developers");
      } finally {
        setLoading(false);
      }
    };

    loadPendingDevelopers();
  }, [setLoading]);

  // Handle approving a developer
  const handleApproveDeveloper = async (requestId: string) => {
    try {
      const result = await approveDeveloper(requestId);
      setStatus(result.message || "Developer approved successfully");

      // Remove the approved developer from the list
      setRequests((prevDevelopers) =>
        prevDevelopers.filter((request) => request.request_id !== requestId),
      );
    } catch (error: any) {
      setStatus(error.message || "Error approving developer.");
    }
  };

  // Handle declining a developer
  const handleDeclineDeveloper = async (requestId: string) => {
    try {
      const result = await declineDeveloper(requestId);
      setStatus(result.message || "Developer declined successfully");
      
      // Remove the declined developer from the list
      setRequests((prevDevelopers) =>
        prevDevelopers.filter((request) => request.request_id !== requestId),
      );
    } catch (error: any) {
      setStatus(error.message || "Error declining developer.");
    }
  };

  return (
    <ProtectedRoute role="master">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger />
          <div className="container mx-auto p-8">
              <h1 className="text-3xl mb-8 text-center">Pending Developers</h1>

            {status && (
                <p className="text-center text-green-600 mb-4 font-semibold">
                {status}
                </p>
            )}

            {loading ? (
              <p className="text-center text-gray-600">Loading pending developers...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-gray-600">
                No pending developer requests.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <Card
                    key={request.request_id}
                    className="p-6 bg-white rounded-lg shadow-md border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {request.first_name} {request.last_name}
                    </h3>
                    <p className="text-gray-600 mb-2">{request.email}</p>
                      <p className="text-sm text-yellow-600 mb-4">
                      Status: {request.status}
                    </p>
                      <div className="flex justify-between">
                        <Button
                          className="bg-red-500 hover:bg-red-400"
                          onClick={() =>
                            handleDeclineDeveloper(request.request_id)
                          }
                      >
                        Decline
                      </Button>
                        <Button
                          className="bg-green-500 hover:bg-green-400"
                          onClick={() =>
                            handleApproveDeveloper(request.request_id)
                          }
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
