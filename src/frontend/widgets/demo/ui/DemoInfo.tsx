"use client";

import { motion } from "motion/react";
import { Badge } from "@/frontend/shared/components/ui/badge";
import { Calendar } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface DemoInfoProps {
  content: {
    badge: string;
    title: string;
    description: string;
    steps: Step[];
  };
}

export function DemoInfo({ content }: DemoInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl"
    >
      <Badge variant="outline" className="mb-6 py-1.5 px-3 bg-background/50">
        <Calendar className="h-4 w-4 mr-2 text-primary" />
        {content.badge}
      </Badge>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
        {content.title}
      </h1>
      <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
        {content.description}
      </p>

      <div className="mt-12 space-y-8">
        {content.steps.map((step) => (
          <div key={step.number} className="flex items-start gap-5 group">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/10 transition-transform group-hover:scale-110">
              {step.number}
            </div>
            <div className="pt-1">
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground leading-snug">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
