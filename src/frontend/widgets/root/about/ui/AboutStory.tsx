"use client";

import { motion } from "motion/react";

interface AboutStoryProps {
  content: {
    title: string;
    paragraphs: string[];
  };
}

export function AboutStory({ content }: AboutStoryProps) {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-foreground text-center mb-12 sm:text-4xl">
            {content.title}
          </h2>
          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
            {content.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
