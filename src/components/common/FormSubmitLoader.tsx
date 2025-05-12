import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormSubmitLoaderProps {
  message?: string;
  description?: string;
  isPending: boolean;
  isConfirming?: boolean;
  variant?: "overlay" | "inline" | "button";
  buttonText?: string;
  className?: string;
}

/**
 * FormSubmitLoader component that can be used in three variants:
 * - overlay: Shows a full screen overlay (default for form submissions)
 * - inline: Shows a simple spinner with text that can be placed anywhere
 * - button: Replaces the text in a button with a loading state
 */
export function FormSubmitLoader({
  message,
  description,
  isPending,
  isConfirming = false,
  variant = "overlay",
  buttonText,
  className = "",
}: FormSubmitLoaderProps) {
  const isLoading = isPending || isConfirming;

  // Default texts
  const loadingMessage =
    message || (isPending ? "Processing..." : isConfirming ? "Confirming..." : "Please wait...");

  const loadingDescription =
    description ||
    (isConfirming
      ? "Your transaction is being confirmed on the blockchain"
      : "Processing your request");

  if (!isLoading) return null;

  // Overlay variant - full screen modal with blur background
  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-background p-8 rounded-lg shadow-lg flex flex-col items-center">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">{loadingMessage}</p>
          <p className="text-sm text-muted-foreground mt-2">{loadingDescription}</p>
        </div>
      </div>
    );
  }

  // Inline variant - for embedding in pages
  if (variant === "inline") {
    return (
      <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
        <Loader2Icon className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-base font-medium">{loadingMessage}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{loadingDescription}</p>}
      </div>
    );
  }

  // Button variant - for button loading states
  if (variant === "button") {
    return (
      <Button disabled className={className}>
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        {loadingMessage || buttonText || "Loading..."}
      </Button>
    );
  }

  return null;
}
