"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCtaSection() {
  const { title, subtitle, cta } = LANDING_CONTENT.finalCta;

  return (
    <section id="cta" className="w-full py-20 md:py-28 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-chart-2/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl">
          {/* Card container */}
          <div
            className="bg-linear-to-br from-primary to-chart-2 rounded-3xl p-1"
          >
            <div className="bg-background rounded-[calc(1.5rem-1px)] p-8 md:p-12 lg:p-16">
              <div className="text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Спеціальна пропозиція
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  {title}
                </h2>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  {subtitle}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Button size="lg" asChild className="group w-full sm:w-auto">
                    <Link href={cta.href}>
                      {cta.label}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <Link href="/demo">Переглянути демо</Link>
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Безкоштовний таріф</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Без прив`язки карти</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Скасування у будь-який час</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}