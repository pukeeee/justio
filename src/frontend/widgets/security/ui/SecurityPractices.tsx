"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface SecurityPracticesProps {
  content: {
    title: string;
    description: string;
    items: string[];
  };
}

export function SecurityPractices({ content }: SecurityPracticesProps) {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4 sm:text-4xl">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-6xl mx-auto">
          {content.items.map((practice, index) => (
            <motion.div
              key={practice}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
            >
              <CheckCircle className="h-6 w-6 text-accent shrink-0" />
              <span className="text-sm font-medium text-foreground leading-snug">
                {practice}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
