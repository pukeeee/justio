"use client";

import { motion } from "motion/react";

interface ValueItem {
  title: string;
  description: string;
}

interface AboutValuesProps {
  content: {
    title: string;
    items: ValueItem[];
  };
}

export function AboutValues({ content }: AboutValuesProps) {
  return (
    <div className="bg-muted/30 py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-foreground text-center mb-16 sm:text-4xl">
            {content.title}
          </h2>
          <div className="grid gap-10 md:grid-cols-2">
            {content.items.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-background border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/20"
              >
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
