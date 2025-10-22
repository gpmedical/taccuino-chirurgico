import { cn } from "@/lib/utils";

export const Spinner = ({ className }: { className?: string }) => (
  <div
    role="status"
    aria-label="Loading..."
    className={cn(
      "animate-spin rounded-full border-b-2 border-primary",
      className
    )}
  ></div>
); 