import LoginForm from "./LoginForm";
import Link from "next/link";

export default function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <LoginForm />
      <div className="flex my-6 font-regular text-sm text-gray-500">
        <p className="mr-3">Don&apos;t have an account yet?</p>
        <Link href="/register-account" className="text-[#2272B4]">
          Register
        </Link>
      </div>
    </div>
  );
}
