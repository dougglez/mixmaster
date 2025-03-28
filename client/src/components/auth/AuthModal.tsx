import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type AuthView = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: AuthView;
}

export function AuthModal({
  open,
  onOpenChange,
  defaultView = 'login',
}: AuthModalProps) {
  const [view, setView] = useState<AuthView>(defaultView);

  const handleLoginClick = () => {
    setView('login');
  };

  const handleRegisterClick = () => {
    setView('register');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="p-6">
          {view === 'login' ? (
            <LoginForm onRegisterClick={handleRegisterClick} />
          ) : (
            <RegisterForm onLoginClick={handleLoginClick} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}