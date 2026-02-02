"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/frontend/shared/components/ui/badge";

interface SecurityInfrastructureProps {
  content: {
    badge: string;
    title: string;
    description: string;
    points: string[];
    stats: {
      uptimeLabel: string;
      uptimeValue: string;
      incidentsLabel: string;
      incidentsValue: string;
      breachesLabel: string;
      breachesValue: string;
    };
  };
}

export function SecurityInfrastructure({
  content,
}: SecurityInfrastructureProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6">
              {content.badge}
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {content.title}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {content.description}
            </p>
            <ul className="mt-8 space-y-4">
              {content.points.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-muted-foreground group"
                >
                  <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-1 transition-transform group-hover:scale-110" />
                  <span className="text-base leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-muted/30 p-8 lg:p-10 shadow-inner relative overflow-hidden"
          >
            {/* Декоративний фон */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {content.stats.uptimeLabel}
                  </span>
                  <span className="font-bold text-foreground text-lg">
                    {content.stats.uptimeValue}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "99.98%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground block">
                    {content.stats.incidentsLabel}
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {content.stats.incidentsValue}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground block">
                    {content.stats.breachesLabel}
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {content.stats.breachesValue}
                  </span>
                </div>
              </div>

              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                <p className="text-xs text-muted-foreground text-center italic">
                  * Дані оновлюються в режимі реального часу через незалежні
                  сервіси моніторингу.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
