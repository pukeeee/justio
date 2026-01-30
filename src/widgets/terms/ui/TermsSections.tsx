"use client";

import { motion } from "motion/react";

interface TermsSection {
  title: string;
  content: string;
}

interface TermsSectionsProps {
  intro: string;
  sections: TermsSection[];
}

export function TermsSections({ intro, sections }: TermsSectionsProps) {
  return (
    <section className="max-w-4xl mx-auto py-12 md:py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="text-xl text-muted-foreground leading-relaxed mb-16 italic border-l-4 border-primary pl-6">
          {intro}
        </p>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className="border-b border-border pb-10 last:border-0"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">
                {section.title}
              </h2>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed text-lg">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
