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
        "w-full max-w-2xl mx-auto bg-card rounded-2xl p-8 shadow-lg animate-slide-up",
        className
      )}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
