/// contexts/AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user, clearUser } from "@/lib/store";

// The AuthContextType interface defines the shape of the context object
interface AuthContextType {
  // Indicates if the user is authenticated
  isAuthenticated: boolean;
  // The ID token for the authenticated user
  idToken: string;
  // The access token for the authenticated user (currently not used)
  accessToken: string;
  // Indicates if the authentication state is loading
  loading: boolean;
  // Function to set the ID token
  setIdToken: Dispatch<SetStateAction<string>>;
  // Function to set the access token
  setAccessToken: Dispatch<SetStateAction<string>>;
  // Function to log the user out
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component provides the authentication context to its children
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State to track if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to track the ID token
  const [idToken, setIdToken] = useState<string>("");
  // State to track the access token (currently not used)
  const [accessToken, setAccessToken] = useState<string>("");
  // State to track if the authentication state is loading
  const [loading, setLoading] = useState(true);
  const user = useStore($user);
  const router = useRouter();

  // Check for token on initial load
  useEffect(() => {
    // If idToken and userRole are present, set the user as authenticated
    if (idToken && user.role) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [idToken, user.role]);

  const logout = () => {
    console.log("clicked!");
    setIsAuthenticated(false);
    setAccessToken("");
    setIdToken("");
    clearUser();
    router.push("/sign-in"); // Redirect to login page on logout
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        idToken,
        accessToken,
        loading,
        setIdToken,
        setAccessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
