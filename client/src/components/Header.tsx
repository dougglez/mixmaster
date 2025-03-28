import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ui/theme-provider";
import cocktailLogo from "../assets/cocktail-logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthButton } from "./auth/AuthButton";
import { Settings } from "lucide-react";

interface HeaderProps {
  onConfigClick: () => void;
  onThemeClick: () => void;
}

export default function Header({ onConfigClick, onThemeClick }: HeaderProps) {
  const { isDarkMode } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-neutral-100 py-4 px-4 sticky top-0 z-10 shadow-sm dark:bg-neutral-900/90 dark:border-neutral-800">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-primary to-pink-500 text-white rounded-full h-10 w-10 flex items-center justify-center shadow-sm">
            <img src={cocktailLogo} alt="MixMaster Logo" className="h-6 w-6" />
          </div>
          <h1 className="brand-heading gradient-heading text-2xl">MixMaster</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <AuthButton />
          
          <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-neutral-200 hover:border-primary/30 hover:bg-primary/5 dark:border-neutral-700 dark:hover:border-primary/50 dark:hover:bg-primary/20"
                aria-label="Open settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuLabel className="font-normal text-xs text-neutral-500 uppercase tracking-wider px-2 pb-1">
                Settings
              </DropdownMenuLabel>
              
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2 rounded-md py-2 my-1 focus:bg-primary/10"
                onClick={() => {
                  setIsSettingsOpen(false);
                  onThemeClick();
                }}
              >
                <i className="ri-palette-line text-base"></i>
                <span>Appearance Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2 rounded-md py-2 my-1 focus:bg-primary/10"
                onClick={() => {
                  setIsSettingsOpen(false);
                  onConfigClick();
                }}
              >
                <i className="ri-key-2-line text-base"></i>
                <span>API Configuration</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuLabel className="font-normal text-xs text-neutral-500 px-2 pb-1">
                About
              </DropdownMenuLabel>
              
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2 rounded-md py-2 my-1 focus:bg-primary/10"
                onClick={() => {
                  setIsSettingsOpen(false);
                  window.open("https://replit.com", "_blank");
                }}
              >
                <i className="ri-information-line text-base"></i>
                <span>Made with ♥ on Replit</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}