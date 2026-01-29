import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { finalCtaContent } from "../../../content/root/final-cta";

export default function FinalSection() {
  const { header, buttons } = finalCtaContent;

  return (
    <section className="py-16 sm:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            {header.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            {header.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={buttons.demo.href}>
                {buttons.demo.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={buttons.pricing.href}>{buttons.pricing.text}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
