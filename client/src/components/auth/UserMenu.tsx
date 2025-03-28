import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, User, Heart, BookMarked, List } from "lucide-react";

export function UserMenu() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const getInitials = () => {
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    } else {
      return user.email.slice(0, 2).toUpperCase();
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/favorites">
            <div className="flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              <span>Favorites</span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/collections">
            <div className="flex items-center">
              <BookMarked className="mr-2 h-4 w-4" />
              <span>Collections</span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/recipes">
            <div className="flex items-center">
              <List className="mr-2 h-4 w-4" />
              <span>My Recipes</span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <div className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}