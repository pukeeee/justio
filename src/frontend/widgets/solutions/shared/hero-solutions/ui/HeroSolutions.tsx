"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Badge } from "@/frontend/shared/components/ui/badge";

interface HeroSolutionsProps {
  content: {
    badge: string;
    title: string;
    description: string;
    buttons: {
      primary: {
        text: string;
        href: string;
      };
      secondary: {
        text: string;
        href: string;
      };
    };
  };
}

export function HeroSolutions({ content }: HeroSolutionsProps) {
  return (
    <div className="bg-linear-to-b from-muted/50 to-background -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto py-20 md:py-28 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Badge variant="outline" className="mb-6">
            <Briefcase className="h-3 w-3 mr-1" />
            {content.badge}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl whitespace-pre-line">
            {content.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
              <Link href={content.buttons.primary.href}>
                {content.buttons.primary.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={content.buttons.secondary.href}>
                {content.buttons.secondary.text}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
