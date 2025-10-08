// Import the ConfirmSignUpForm component and Navbar component
import { ConfirmSignUpForm } from "./ConfirmSignUpForm";
import { Suspense } from "react";

// Define the Home component as the default export
export default function Home() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center p-20">
        <Suspense fallback={<div>Loading...</div>}>
          <ConfirmSignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
