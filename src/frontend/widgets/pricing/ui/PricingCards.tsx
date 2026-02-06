"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Badge } from "@/frontend/shared/components/ui/badge";
import { cn } from "@/frontend/shared/lib/utils";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/frontend/shared/components/ui/toggle-group";

interface Plan {
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  popular: boolean;
  features: string[];
  cta: string;
  href: string;
}

interface PricingCardsProps {
  content: {
    plans: Plan[];
    billing: {
      monthly: string;
      yearly: string;
      saveBadge: string;
      billedAnnually: string;
    };
  };
}

/**
 * Картки тарифів з перемикачем періоду оплати
 */
export function PricingCards({ content }: PricingCardsProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const { plans, billing } = content;

  return (
    <section className="pb-16 sm:pb-20">
      {/* Перемикач періоду оплати */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="pb-10 flex items-center justify-center gap-4">
          <ToggleGroup
            type="single"
            value={billingPeriod}
            onValueChange={(value) =>
              value && setBillingPeriod(value as "monthly" | "yearly")
            }
            className="bg-muted p-1 rounded-lg"
          >
            <ToggleGroupItem
              value="monthly"
              className="px-6 py-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm transition-all"
            >
              {billing.monthly}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="yearly"
              className="px-6 py-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm transition-all"
            >
              {billing.yearly}
              <Badge
                variant="ghost"
                className="ml-2 text-destructive text-xs font-medium"
              >
                {billing.saveBadge}
              </Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl border bg-card p-6 lg:p-8 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                plan.popular
                  ? "border-accent shadow-lg lg:scale-105 z-10 ring-1 ring-accent/20"
                  : "border-border",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground px-4 py-1">
                    Популярний вибір
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                  {plan.description}
                </p>
                <div className="mt-6 flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={billingPeriod}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-baseline gap-1"
                    >
                      <span className="text-4xl font-bold text-foreground tracking-tight">
                        {billingPeriod === "monthly"
                          ? plan.monthlyPrice
                          : plan.yearlyPrice}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">
                        {plan.period}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {billingPeriod === "yearly" &&
                    plan.monthlyPrice !== "0 ₴" &&
                    plan.monthlyPrice !== "Індивідуально" && (
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        {billing.billedAnnually}
                      </p>
                    )}
                </div>
              </div>

              <ul className="space-y-4 grow mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full mt-auto group transition-all",
                  plan.popular
                    ? "bg-accent hover:bg-accent/90 shadow-md"
                    : "hover:bg-accent/5 hover:border-accent hover:text-accent",
                )}
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
