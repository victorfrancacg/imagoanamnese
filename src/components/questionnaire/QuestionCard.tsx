import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function QuestionCard({ title, subtitle, children, className }: QuestionCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg animate-slide-up",
        className
      )}
    >
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-1 sm:mb-2">{title}</h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
    </div>
  );
}
