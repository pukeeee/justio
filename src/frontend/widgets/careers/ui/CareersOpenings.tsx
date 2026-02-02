"use client";

import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";

interface Opening {
  title: string;
  team: string;
  location: string;
  type: string;
}

interface CareersOpeningsProps {
  content: {
    title: string;
    description: string;
    items: Opening[];
  };
}

export function CareersOpenings({ content }: CareersOpeningsProps) {
  return (
    <div className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {content.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.description}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {content.items.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="font-medium px-2 py-0.5 rounded-md bg-muted text-foreground/70">
                        {job.team}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary/60" />
                        {job.location}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all">
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
