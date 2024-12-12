"use client";

import Link from "next/link";
import Image from "next/image";
import { AuthProvider } from "./contexts/AuthContext";

export default function Home() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-black flex flex-col font-sans">
        {/* Hero Section */}
        <div className="relative w-full h-screen">
          <Image
            src="/alpb_background.png"
            alt="ALPB Background"
            layout="fill"
            objectFit="cover"
            className="opacity-60"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-gray-900" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            {/* Logo */}
            <div className="mb-6">
              <Image
                src="/alpb-logo.png"
                alt="ALPB Logo"
                width={120}
                height={120}
                className="mx-auto"
                priority={true}
              />
            </div>

            {/* Header */}
            <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
              Welcome to <span className="text-white">ALPB Analytics</span>
            </h1>
            <p className="text-lg font-bold text-white mt-4 max-w-2xl">
            Discover advanced insights and data that redefine your understanding
            of the game. Developed by the Johns Hopkins Sports Analytics Research Group.
            </p>

            {/* Buttons */}
            <div className="flex mt-8 space-x-4">
              <Link href="/sign-in">
                <button className="text-lg font-bold text-black bg-white px-8 py-3 rounded-full border-2 border-black hover:bg-black hover:text-white transition duration-300">
                  Sign In
                </button>
              </Link>
              <Link href="/register-account">
                <button className="text-lg font-bold text-black bg-white px-8 py-3 rounded-full border-2 border-black hover:bg-black hover:text-white transition duration-300">
                  Register
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="w-full bg-white py-6 text-center text-black">
          <p className="text-sm font-bold">
            Questions?{" "}
            <Link href="/help" className="text-blue-500 hover:underline font-bold">
              Contact bsantan3@jh.edu, dbenjam9@jh.edu, or xlu62@jh.edu.
            </Link>
          </p>
        </footer>
      </div>
    </AuthProvider>
  );
}
