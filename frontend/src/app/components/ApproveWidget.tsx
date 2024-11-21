"use client";
import React, { useState } from "react";

const ApproveWidget = () => {
  // State to hold the status message
  const [status, setStatus] = useState("");

  // Function to handle the approval process
  const approveWidget = async () => {
    try {
      // Send a POST request to the API endpoint
      const response = await fetch("/api/approve-widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "12345", // Example userId
          email: "user@example.com", // Example email
        }),
      });

      // Parse the JSON response
      const data = await response.json();
      if (response.ok) {
        // If the response is OK, update the status with the API key
        setStatus(`API Key: ${data.apiKey}`);
      } else {
        // If there is an error, update the status with the error message
        setStatus(`Error: ${data.message}`);
      }
    } catch (error: unknown) {
      // Handle any unexpected errors
      if (error instanceof Error) {
        setStatus(`Error: ${error.message}`);
      } else {
        setStatus("An unknown error occurred.");
      }
    }
  };

  return (
    <div>
      {/* Button to trigger the approval process */}
      <button onClick={approveWidget}>Approve Widget</button>
      {/* Display the status message if it exists */}
      {status && <p>{status}</p>}
    </div>
  );
};

export default ApproveWidget;
