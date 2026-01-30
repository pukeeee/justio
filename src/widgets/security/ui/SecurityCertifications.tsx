"use client";

import { FileCheck } from "lucide-react";
import { motion } from "motion/react";

interface CertificationItem {
  name: string;
  description: string;
}

interface SecurityCertificationsProps {
  content: {
    title: string;
    description: string;
    items: CertificationItem[];
  };
}

export function SecurityCertifications({ content }: SecurityCertificationsProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4 sm:text-4xl">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((cert, index) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <FileCheck className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-foreground text-lg">{cert.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {cert.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
