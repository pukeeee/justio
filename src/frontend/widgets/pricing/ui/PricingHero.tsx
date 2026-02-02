"use client";

import { motion } from "motion/react";
import { Badge } from "@/frontend/shared/components/ui/badge";

interface PricingHeroProps {
  content: {
    badge: string;
    title: string;
    description: string;
  };
}

/**
 * Секція Hero для сторінки тарифів
 */
export function PricingHero({ content }: PricingHeroProps) {
  return (
    <section className="py-16 sm:py-24 bg-linear-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6">
              {content.badge}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
