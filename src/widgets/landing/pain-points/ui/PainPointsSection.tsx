"use client";

import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";

export function PainPointsSection() {
  const { title, points } = LANDING_CONTENT.painPoints;

  return (
    <section id="pain-points" className="w-full py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Заголовок секції */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center tracking-tight">
            {title}
          </h2>

          {/* Сітка проблем */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {points.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.title}>
                  <Card className="h-full border-2 hover-lift hover:border-destructive/50 transition-all duration-300 group">
                    <CardHeader className="space-y-4">
                      <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                        <Icon className="h-6 w-6 text-destructive" />
                      </div>
                      <CardTitle className="text-lg">{point.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {point.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}