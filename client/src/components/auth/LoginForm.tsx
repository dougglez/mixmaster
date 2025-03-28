import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { OtpInput } from "../../components/ui/otp-input";

interface LoginFormProps {
  onRegisterClick: () => void;
}

export function LoginForm({ onRegisterClick }: LoginFormProps) {
  const { toast } = useToast();
  const { loginMutation, verifyMutation, resendVerificationMutation } = useAuth();
  const [verificationStep, setVerificationStep] = useState(false);
  const [email, setEmail] = useState("");
  
  // Auto-login for development/testing
  useEffect(() => {
    const testEmail = 'maxfield.douglas@gmail.com';
    setEmail(testEmail);
    
    // Only run once to prevent infinite loops
    const hasAutoLoggedIn = sessionStorage.getItem('hasAutoLoggedIn');
    if (!hasAutoLoggedIn) {
      loginMutation.mutate({ email: testEmail });
      sessionStorage.setItem('hasAutoLoggedIn', 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Email form
  const emailFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "maxfield.douglas@gmail.com", // Default to test email
    },
  });

  function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    setEmail(values.email);
    loginMutation.mutate(
      { email: values.email },
      {
        onSuccess: () => {
          setVerificationStep(true);
        },
      }
    );
  }

  // Verification form
  const verificationFormSchema = z.object({
    code: z.string().min(6, { message: "Verification code must be 6 digits" }),
  });

  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      code: "",
    },
  });

  function onVerificationSubmit(values: z.infer<typeof verificationFormSchema>) {
    verifyMutation.mutate({
      email,
      code: values.code,
    });
  }

  function handleResendCode() {
    resendVerificationMutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast({
            title: "Verification code sent",
            description: "A new code has been sent to your email",
          });
        },
      }
    );
  }

  if (verificationStep) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Verify Your Email</h2>
          <p className="text-muted-foreground">
            Enter the 6-digit code we sent to {email}
          </p>
        </div>

        <Form {...verificationForm}>
          <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)}>
            <div className="space-y-4">
              <FormField
                control={verificationForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <OtpInput
                        length={6}
                        onComplete={(value: string) => {
                          field.onChange(value);
                          verificationForm.handleSubmit(onVerificationSubmit)();
                        }}
                        disabled={verifyMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={resendVerificationMutation.isPending}
                >
                  {resendVerificationMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Resend Code
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setVerificationStep(false)}
                >
                  Change Email
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify & Login
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Login</h2>
        <p className="text-muted-foreground">
          Enter your email to log in or create an account
        </p>
      </div>

      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
          <div className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Continue with Email
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0" onClick={onRegisterClick}>
            Register
          </Button>
        </p>
      </div>
    </div>
  );
}