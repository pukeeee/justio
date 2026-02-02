import { cn } from "@/frontend/shared/lib/utils";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
  variant?: "default" | "bordered" | "filled";
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  variant = "default",
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl p-6 transition-all duration-300 hover:-translate-y-1",
        variant === "default" && "hover:bg-muted/50",
        variant === "bordered" &&
          "border border-border bg-card hover:border-primary hover:border hover:shadow-md",
        variant === "filled" && "bg-muted/50 hover:bg-muted",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/30 text-primary transition-colors group-hover:text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

interface FeatureGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureGrid({
  children,
  columns = 3,
  className,
}: FeatureGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 md:gap-8",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
