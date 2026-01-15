"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import { Check, ArrowRight } from "lucide-react";

export function LandingHero() {
  const { title, subtitle, primaryCta, secondaryCta, badges } =
    LANDING_CONTENT.hero;

  return (
    <section
      id="hero"
      className="relative w-full py-20 sm:py-20 md:py-28 lg:py-36 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-chart-2/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Заголовок */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="gradient-text">
              {title.split(" ").slice(0, 3).join(" ")}
            </span>
            <br />
            {title.split(" ").slice(3).join(" ")}
          </h1>

          {/* Підзаголовок */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {badges.map((badge) => (
              <Badge
                key={badge}
                variant="secondary"
                className="flex items-center gap-1.5 py-1.5 px-3 text-sm hover-lift"
              >
                <Check className="h-3.5 w-3.5 text-primary" />
                {badge}
              </Badge>
            ))}
          </div>

          {/* CTA кнопки */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="group w-full sm:w-auto">
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto hover-lift"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          </div>

          {/* Соціальний proof */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Приєднуйтесь до сотень українських підприємців
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-linear-to-br from-primary/20 to-chart-2/20 border-2 border-background"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                +500 активних користувачів
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
