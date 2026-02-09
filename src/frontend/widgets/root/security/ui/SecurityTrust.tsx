"use client";

import { motion } from "motion/react";

interface SecurityTrustProps {
  content: {
    title: string;
    description: string;
  };
}

export function SecurityTrust({ content }: SecurityTrustProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
