"use client";

import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import { ArrowRight } from "lucide-react";

export function SolutionSection() {
  const { title, steps } = LANDING_CONTENT.solution;

  return (
    <section id="solution" className="w-full py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Заголовок */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center tracking-tight">
            {title}
          </h2>

          {/* Кроки */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-0.5 bg-linear-to-r from-primary via-primary to-primary/30" />

            {steps.map((step, index) => {
              return (
                <div key={step.number} className="relative">
                  <div className="flex flex-col items-center text-center space-y-6 group">
                    {/* Number badge */}
                    <div className="relative">
                      <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 z-10 relative">
                        <span className="text-2xl font-bold text-primary-foreground">
                          {step.number}
                        </span>
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all duration-300" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl md:text-2xl font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow indicator for mobile */}
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-6 w-6 text-primary md:hidden mt-4 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA hint */}
          <div className="text-center pt-8">
            <p className="text-sm text-muted-foreground">
              Почніть працювати за 5 хвилин — без складних налаштувань
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}