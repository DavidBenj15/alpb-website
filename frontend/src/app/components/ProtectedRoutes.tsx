"use client";

/**
 * ProtectedRoute Component
 *
 * A higher-order component (HOC) that wraps around protected content to enforce authentication
 * and optional role-based access control. Redirects unauthenticated users to the sign-in page
 * and unauthorized users to an unauthorized access page.
 */

import { useEffect } from "react"; // React hook for managing side effects
import { useRouter } from "next/navigation"; // Next.js router for client-side navigation
import { useAuth } from "../contexts/AuthContext"; // Custom authentication context
import Loading from "./layout/loading";
import { useStore } from "@nanostores/react";
import { $user } from "@/lib/store";

/**
 * Props for the ProtectedRoute Component
 *
 * @property {string} [role] - Optional role required to access the route.
 * @property {React.ReactNode} children - The content to render if access is granted.
 */
interface ProtectedRouteProps {
  role?: string;
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * @param {ProtectedRouteProps} props - Props for the component.
 * @returns {JSX.Element | null} - Protected content or a redirect based on authentication and role.
 */
const ProtectedRoute = ({ role, children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth(); // Custom hook for authentication state
  const user = useStore($user);
  const router = useRouter(); // Next.js router instance

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect unauthenticated users to the sign-in page
        router.push("/sign-in");
      } else if (role && user.role.toLowerCase() !== role) {
        // Redirect users without the required role to the unauthorized page
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, user.role, loading, router, role]);

  // Display a loading message while authentication state is being determined
  if (loading) {
    return <Loading />;
  }

  // Render the children if the user is authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
