import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { UserMenu } from "./UserMenu";

export function AuthButton() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return <UserMenu />;
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/auth">Sign In</Link>
    </Button>
  );
}