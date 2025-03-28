import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [view, setView] = useState<"login" | "register">("login");

  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSwitchToRegister = () => {
    setView("register");
  };

  const handleSwitchToLogin = () => {
    setView("login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Column */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-heading">Cocktail App</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to save your favorite cocktail recipes
            </p>
          </div>

          <Tabs
            defaultValue={view}
            value={view}
            onValueChange={(value) => setView(value as "login" | "register")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onRegisterClick={handleSwitchToRegister} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onLoginClick={handleSwitchToLogin} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Column */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/10 flex-col items-center justify-center p-12">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6">Discover Perfect Cocktails Tailored Just for You</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="rounded-full bg-primary/20 p-2 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                  <path d="M7 7h.01"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Personalized Recommendations</h3>
                <p className="text-muted-foreground">
                  Tell us what you're in the mood for, and we'll craft the perfect cocktail for your taste
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="rounded-full bg-primary/20 p-2 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M20 7h-3a2 2 0 0 1-2-2V2"></path>
                  <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"></path>
                  <path d="M3 10v10a2 2 0 0 0 2 2h11"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Save Your Favorites</h3>
                <p className="text-muted-foreground">
                  Create custom lists to remember your favorite recipes and cocktails to try
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="rounded-full bg-primary/20 p-2 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                  <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                  <path d="M8 14l.921-.944c.813-.836 1.36-1.4 1.6-1.373.238.027.267.883.284 2.553L10.816 17"></path>
                  <path d="M13 8.8c.684 1.626.984 2.64.9 3.04-.084.4-.932.483-2.544.248"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">AI-Powered Experience</h3>
                <p className="text-muted-foreground">
                  Advanced AI helps you discover unique cocktails you'll love, with beautiful visualizations
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}