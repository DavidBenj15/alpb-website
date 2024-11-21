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

// The AuthContextType interface defines the shape of the context object
interface AuthContextType {
  // Indicates if the user is authenticated
  isAuthenticated: boolean;
  // The ID token for the authenticated user
  idToken: string;
  // The role of the authenticated user
  userRole: string;
  // The access token for the authenticated user (currently not used)
  accessToken: string;
  // Indicates if the authentication state is loading
  loading: boolean;
  // Function to log in the user
  login: (token: string, role: string) => void;
  // Function to log out the user
  logout: () => void;
  // The ID of the authenticated user
  userId: string;
  // Function to set the user ID
  setUserId: Dispatch<SetStateAction<string>>;
  // Function to set the ID token
  setIdToken: Dispatch<SetStateAction<string>>;
  // Function to set the user role
  setUserRole: Dispatch<SetStateAction<string>>;
  // Function to set the access token
  setAccessToken: Dispatch<SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component provides the authentication context to its children
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State to track if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to track the user's role
  const [userRole, setUserRole] = useState<string>("");
  // State to track the user's ID
  const [userId, setUserId] = useState<string>("-1");
  // State to track the ID token
  const [idToken, setIdToken] = useState<string>("");
  // State to track the access token (currently not used)
  const [accessToken, setAccessToken] = useState<string>("");
  // State to track if the authentication state is loading
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for token on initial load
  useEffect(() => {
    // If idToken and userRole are present, set the user as authenticated
    if (idToken && userRole) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [idToken, userRole]);

  // Function to log in the user
  const login = (token: string, role: string) => {
    setIsAuthenticated(true);
    setIdToken(token);
    setUserRole(role);
  };

  // Function to log out the user
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole("");
    router.push("/login"); // Redirect to login page on logout
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        idToken,
        userRole,
        accessToken,
        loading,
        login,
        logout,
        userId,
        setUserId,
        setIdToken,
        setUserRole,
        setAccessToken
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
