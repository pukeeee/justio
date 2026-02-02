"use client";

import { motion } from "motion/react";
import { Mail, MessageSquare, Phone, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Mail,
  MessageSquare,
  Phone,
};

interface ContactMethod {
  icon: string;
  title: string;
  description: string;
  value: string;
}

interface ContactMethodsProps {
  content: {
    items: ContactMethod[];
  };
}

export function ContactMethods({ content }: ContactMethodsProps) {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {content.items.map((method, index) => {
            const Icon = iconMap[method.icon];
            return (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-primary/20 hover:shadow-lg flex flex-col h-full"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto transition-transform group-hover:scale-110">
                  {Icon && <Icon className="h-7 w-7" />}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {method.description}
                </p>
                <p className="mt-auto text-base font-semibold text-primary">
                  {method.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
