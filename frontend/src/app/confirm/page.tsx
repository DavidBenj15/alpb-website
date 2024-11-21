// Import the ConfirmSignUpForm component and Navbar component
import { ConfirmSignUpForm } from "./ConfirmSignUpForm";
import Navbar from "../components/navbar/Navbar";

// Define the Home component as the default export
export default function Home() {
  return (
    // Define the body of the HTML document
    <body>
      {/* Render the Navbar component */}
      <Navbar />
      {/* Center the content horizontally */}
      <div className="w-full flex justify-center">
        {/* Define a container with specific styling */}
        <div className="bg-gray-100 w-1/2 max-w-lg px-10 my-10 shadow-md rounded-lg">
          {/* Center the heading horizontally */}
          <div className="flex justify-center">
            <h1 className="text-center">Sign up for an account</h1>
          </div>
          {/* Main content area */}
          <main className="flex justify-center w-full">
            {/* Render the ConfirmSignUpForm component */}
            <ConfirmSignUpForm />
          </main>
        </div>
      </div>
    </body>
  );
}
