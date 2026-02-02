"use client";

import { motion } from "motion/react";
import { Badge } from "@/frontend/shared/components/ui/badge";

interface PrivacyHeroProps {
  content: {
    badge: string;
    title: string;
    lastUpdated: string;
    description: string;
  };
}

export function PrivacyHero({ content }: PrivacyHeroProps) {
  return (
    <section className="bg-linear-to-b from-muted/50 to-background -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-none">
      <div className="max-w-4xl mx-auto py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Badge variant="outline" className="mb-6">
            {content.badge}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground font-medium">
            {content.lastUpdated}
          </p>
          <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
