"use client";

import { Badge } from "@/frontend/shared/components/ui/badge";
import { motion } from "motion/react";

interface ProductHeroProps {
  content: {
    badge: string;
    title: string;
    description: string;
  };
}

export function ProductHero({ content }: ProductHeroProps) {
  return (
    <section className="py-16 sm:py-24 bg-linear-to-b from-muted/50 to-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6">
              {content.badge}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl whitespace-pre-line">
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
