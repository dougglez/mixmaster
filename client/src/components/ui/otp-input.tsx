import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface OtpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  length?: number;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}

export function OtpInput({
  length = 6,
  onComplete,
  disabled = false,
  className,
  ...props
}: OtpInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = (targetIndex: number) => {
    const input = inputs.current[targetIndex];
    input?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // If empty and Backspace is pressed, focus previous input
      focusInput(index - 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    
    // Handle paste of full code
    if (index === 0 && value.length === length) {
      const newCode = value.split("").slice(0, length);
      setCode(newCode);
      
      if (onComplete) {
        onComplete(newCode.join(""));
      }
      return;
    }
    
    // Normal single-digit input
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto focus next input if we have a value
      if (value && index < length - 1) {
        focusInput(index + 1);
      }
      
      // Check if code is complete
      const completeCode = newCode.join("");
      if (completeCode.length === length && onComplete) {
        onComplete(completeCode);
      }
    }
  };

  return (
    <div className={cn("flex gap-2 w-full", className)}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={index === 0 ? length : 1}
          value={code[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputs.current[index] = el)}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-xl focus:ring-2 focus:ring-primary",
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
}