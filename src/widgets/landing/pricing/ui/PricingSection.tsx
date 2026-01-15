"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils/utils";
import { LANDING_CONTENT } from "@/shared/lib/config/landing";

export function PricingSection() {
  const { title, subtitle, plans } = LANDING_CONTENT.pricing;

  return (
    <section id="pricing" className="w-full py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-7xl space-y-16">
          {/* Заголовки */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Сітка тарифів */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {plans.map((plan) => {
              return (
                <div key={plan.id}>
                  <Card
                    className={cn(
                      "relative flex flex-col h-full transition-all duration-300",
                      plan.highlighted
                        ? "border-primary shadow-xl shadow-primary/10 scale-105 lg:scale-110"
                        : "hover-lift border-2",
                    )}
                  >
                    {plan.highlighted && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1.5 shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Популярний
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="space-y-4 pb-8">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {plan.description}
                        </CardDescription>
                      </div>

                      <div className="flex items-baseline gap-1">
                        {plan.price === "Індивідуально" ? (
                          <span className="text-3xl font-bold">
                            {plan.price}
                          </span>
                        ) : (
                          <>
                            <span className="text-4xl font-bold">
                              {plan.price}
                            </span>
                            <span className="text-muted-foreground"> ₴</span>
                            {plan.period && (
                              <span className="text-muted-foreground">
                                /{plan.period}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-3 pb-8">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </CardContent>

                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={plan.highlighted ? "default" : "outline"}
                        size="lg"
                        asChild
                      >
                        <Link href={plan.href}>{plan.cta}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Додаткова інформація */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Всі тарифи включають 14-денний безкоштовний період.
              <br />
              Без прив`язки карти. Скасування у будь-який час.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}