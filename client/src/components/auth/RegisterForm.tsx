import { useState } from "react";
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

interface RegisterFormProps {
  onLoginClick: () => void;
}

export function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const { toast } = useToast();
  const { registerMutation, verifyMutation, resendVerificationMutation } = useAuth();
  const [verificationStep, setVerificationStep] = useState(false);
  const [email, setEmail] = useState("");

  // Register form
  const registerFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
  });

  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      username: "",
    },
  });

  function onRegisterSubmit(values: z.infer<typeof registerFormSchema>) {
    setEmail(values.email);
    registerMutation.mutate(
      {
        email: values.email,
        username: values.username || undefined,
      },
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
                Verify & Continue
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
        <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
        <p className="text-muted-foreground">
          Register to save cocktails and set your preferences
        </p>
      </div>

      <Form {...registerForm}>
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
          <div className="space-y-4">
            <FormField
              control={registerForm.control}
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

            <FormField
              control={registerForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="cocktail_lover" {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a display name for your profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Register
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0" onClick={onLoginClick}>
            Log in
          </Button>
        </p>
      </div>
    </div>
  );
}