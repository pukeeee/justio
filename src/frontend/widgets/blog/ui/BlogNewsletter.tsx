"use client";

import { motion } from "motion/react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Input } from "@/frontend/shared/components/ui/input";

interface BlogNewsletterProps {
  content: {
    title: string;
    description: string;
    placeholder: string;
    button: string;
  };
}

export function BlogNewsletter({ content }: BlogNewsletterProps) {
  return (
    <section className="bg-muted/30 py-20 md:py-28 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Декоративні елементи */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {content.description}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={content.placeholder}
              className="h-12 bg-background border-border shadow-sm focus:ring-primary focus:border-primary"
            />
            <Button className="h-12 px-8 font-bold shadow-md active:scale-95 transition-all">
              {content.button}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
