import LoginForm from "./LoginForm";
import Navbar from "../components/navbar/Navbar";
import Link from "next/link";

export default function SignIn() {
  return (
    <div>
      <Navbar />
      <div className="w-full flex justify-center">
        <div className="bg-gray-100 w-1/2 max-w-lg px-10 my-10 shadow-md rounded-lg">
          <div className="flex justify-center">
            <h1>Sign in</h1>
          </div>
          <main className="flex justify-center w-full">
            <LoginForm />
          </main>
          <div>
            <p className="text-sm flex justify-center mb-5">
              {"Don't have an account?"}
              {/* Link to the registration page */}
              <Link href="/register-account" className="text-blue-600 ml-3">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
