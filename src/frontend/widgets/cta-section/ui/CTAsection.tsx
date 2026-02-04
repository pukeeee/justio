"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";

interface ProductCTAProps {
  content: {
    title: string;
    description: string;
    button: {
      text: string;
      href: string;
    };
  };
}

export function CTAsection({ content }: ProductCTAProps) {
  return (
    <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80">
            {content.description}
          </p>
          <Button size="lg" variant="secondary" className="mt-10" asChild>
            <Link href={content.button.href}>
              {content.button.text}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
