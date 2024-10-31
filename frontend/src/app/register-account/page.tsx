import { SignupForm } from "./SignupForm";
import Navbar from "../components/navbar/Navbar";
import ProtectedRoute from "../components/ProtectedRoutes";

export default function Home() {
  return (
    <ProtectedRoute>
    <body>
    <Navbar />
      <div className="w-full flex justify-center">
        <div className="bg-gray-100 w-1/2 max-w-lg px-10 my-10 shadow-md rounded-lg">
          <div className="flex justify-center">
            <h1 className="text-center">Sign up for an account</h1>
          </div>

          <main className="flex justify-center w-full">
            <SignupForm />
          </main>
        </div>
      </div>
    </body>
    </ProtectedRoute>
  );
}
