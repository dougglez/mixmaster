import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// User types
interface User {
  id: number;
  email: string;
  username?: string;
  is_verified: boolean;
  auth_provider: string;
  default_alcohol?: string;
  default_characteristics?: string[];
  default_ingredients?: string[];
  theme?: string;
  theme_color?: string;
  title_font?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsVerification: boolean;
  
  // Registration
  register: (email: string, username?: string) => Promise<void>;
  
  // Verification
  verifyCode: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  
  // Login/Logout
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // User preferences
  updatePreferences: (preferences: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch current user data
  const { 
    data: user, 
    error, 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    }
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ email, username }: { email: string; username?: string }) => {
      const res = await apiRequest('POST', '/api/auth/register', { email, username });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Registration successful',
        description: 'Please check your email for verification code.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Verify code mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const res = await apiRequest('POST', '/api/auth/verify', { email, code });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Verification failed');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      toast({
        title: 'Verification successful',
        description: 'Your email has been verified.',
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Resend code mutation
  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest('POST', '/api/auth/resend-code', { email });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to resend code');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Code sent',
        description: 'A new verification code has been sent to your email.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to resend code',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest('POST', '/api/auth/login', { email });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.needsVerification) {
        toast({
          title: 'Verification needed',
          description: 'Please check your email for verification code.',
        });
      } else {
        refetch();
        toast({
          title: 'Login successful',
          description: 'You are now logged in.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Logout failed');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      toast({
        title: 'Logout successful',
        description: 'You have been logged out.',
      });
      setLocation('/auth');
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<User>) => {
      const res = await apiRequest('PATCH', '/api/user/preferences', preferences);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update preferences');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update preferences',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Register function
  const register = async (email: string, username?: string) => {
    await registerMutation.mutateAsync({ email, username });
  };
  
  // Verify code function
  const verifyCode = async (email: string, code: string) => {
    await verifyMutation.mutateAsync({ email, code });
  };
  
  // Resend code function
  const resendCode = async (email: string) => {
    await resendMutation.mutateAsync(email);
  };
  
  // Login function
  const login = async (email: string) => {
    await loginMutation.mutateAsync(email);
  };
  
  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  // Update preferences function
  const updatePreferences = async (preferences: Partial<User>) => {
    return await updatePreferencesMutation.mutateAsync(preferences);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        needsVerification: loginMutation.data?.needsVerification || registerMutation.data?.needsVerification || false,
        register,
        verifyCode,
        resendCode,
        login,
        logout,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}