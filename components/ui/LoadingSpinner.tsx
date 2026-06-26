import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div className={cn(sizeClasses[size], "relative")}>
        <div 
          className={cn(
          "absolute inset-0",
          "border-2 border-imm-red-500/20 border-t-imm-red-600 rounded-full animate-spin",
          )}
        />
      </div>
    </div>
  );
}
