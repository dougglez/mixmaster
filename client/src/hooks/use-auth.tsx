import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Login/Register
  loginMutation: UseMutationResult<User, Error, LoginData>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  
  // Verification
  verifyMutation: UseMutationResult<User, Error, VerifyData>;
  resendVerificationMutation: UseMutationResult<void, Error, { email: string }>;
  
  // User preferences
  updatePreferencesMutation: UseMutationResult<User, Error, Partial<User>>;
};

type LoginData = {
  email: string;
};

type RegisterData = {
  email: string;
  username?: string;
};

type VerifyData = {
  email: string;
  code: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Update authentication state when user data changes
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/auth/user"], userData);
      toast({
        title: "Login successful",
        description: "Verification code has been sent to your email",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      toast({
        title: "Registration successful",
        description: "Verification code has been sent to your email",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyData) => {
      const res = await apiRequest("POST", "/api/auth/verify", data);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/auth/user"], userData);
      toast({
        title: "Verification successful",
        description: "You are now logged in",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      await apiRequest("POST", "/api/auth/resend", data);
    },
    onSuccess: () => {
      toast({
        title: "Verification code sent",
        description: "A new verification code has been sent to your email",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<User>) => {
      const res = await apiRequest("PATCH", "/api/auth/preferences", preferences);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/auth/user"], userData);
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated,
        loginMutation,
        registerMutation,
        logoutMutation,
        verifyMutation,
        resendVerificationMutation,
        updatePreferencesMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}