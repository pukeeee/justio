"use client";

import { LANDING_CONTENT } from "@/shared/lib/config/landing";

export function DifferentiatorsSection() {
  const { title, subtitle, list } = LANDING_CONTENT.differentiators;

  return (
    <section
      id="differentiators"
      className="w-full py-20 md:py-28 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Заголовки */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Список переваг */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {list.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title}>
                  <div className="flex flex-col items-center text-center space-y-4 group">
                    <div className="relative">
                      {/* Icon container */}
                      <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary/10 to-chart-2/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-chart-2/20 transition-all duration-300 relative z-10">
                        <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <h3 className="text-lg md:text-xl font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust indicator */}
          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Розроблено в Україні, для України
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}