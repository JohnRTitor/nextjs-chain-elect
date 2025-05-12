import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  message?: string;
  size?: "default" | "sm";
  className?: string;
};

export function LoadingSpinner({ message, size = "default", className }: LoadingSpinnerProps) {
  // Use a span for small spinners to avoid nesting block elements inside paragraph elements
  if (size === "sm") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
        {message && <span className="ml-2 text-sm text-muted-foreground">{message}</span>}
      </span>
    );
  }

  // Use div for regular spinners (default behavior)
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
