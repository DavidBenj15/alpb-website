// Import the ConfirmSignUpForm component and Navbar component
import { ConfirmSignUpForm } from "./ConfirmSignUpForm";
import Navbar from "../components/navbar/Navbar";

// Define the Home component as the default export
export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center p-20">
        <ConfirmSignUpForm />
      </div>
    </div>
  );
}
