"use client";

import { cn } from "@/frontend/shared/lib/utils";

interface ProductMockupProps {
  className?: string;
  variant?: "dashboard" | "simple";
}

export function ProductMockup({
  className,
  variant = "dashboard",
}: ProductMockupProps) {
  if (variant === "simple") {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card overflow-hidden shadow-xl",
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
        </div>
        <div className="aspect-16/10 bg-linear-to-br from-muted/30 to-muted/60 p-6">
          <div className="h-full rounded-lg border border-border/50 bg-card/50 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden shadow-2xl",
        className,
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-destructive/70" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <div className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            justio.com
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:block w-56 border-r border-border bg-muted/30 p-4">
          <div className="space-y-2">
            <div className="h-8 w-full rounded-md bg-accent/20" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-full rounded-md bg-muted" />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 bg-background">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 rounded-md bg-muted" />
              <div className="h-8 w-24 rounded-md bg-accent/20" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="h-4 w-20 rounded bg-muted mb-2" />
                  <div className="h-8 w-16 rounded bg-muted" />
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 p-4 border-b border-border">
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border-b border-border last:border-0"
                >
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted/70" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-accent/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
