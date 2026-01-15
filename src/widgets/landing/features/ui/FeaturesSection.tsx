"use client";

import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";

export function FeaturesSection() {
  const { title, subtitle, list } = LANDING_CONTENT.features;

  return (
    <section id="features" className="w-full py-20 md:py-28 bg-muted/30">
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

          {/* Сітка можливостей */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {list.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title}>
                  <Card className="h-full hover-lift border-2 hover:border-primary/50 transition-all duration-300 group">
                    <CardHeader className="space-y-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
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