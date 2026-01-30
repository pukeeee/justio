"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

interface SecurityHeroProps {
  content: {
    badge: string;
    title: string;
    description: string;
    button: {
      text: string;
      href: string;
    };
  };
}

export function SecurityHero({ content }: SecurityHeroProps) {
  return (
    <section className="py-16 sm:py-24 bg-linear-to-b from-muted/50 to-background overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 py-1 px-3 bg-background/50 backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5 mr-2 text-primary" />
              {content.badge}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
              {content.title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {content.description}
            </p>
            <div className="mt-10">
              <Button size="lg" className="group" asChild>
                <Link href={content.button.href}>
                  {content.button.text}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
