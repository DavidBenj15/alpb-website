import { SignupForm } from "./SignupForm";
import Navbar from "../components/navbar/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <SignupForm />
    </div>
  );
}
