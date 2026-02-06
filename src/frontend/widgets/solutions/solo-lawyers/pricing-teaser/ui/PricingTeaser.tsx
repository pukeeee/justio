import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Badge } from "@/frontend/shared/components/ui/badge";

interface PricingTeaserProps {
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

export function PricingTeaser({ content }: PricingTeaserProps) {
  return (
    <div className="py-16 md:py-20">
      <div className="text-center max-w-3xl mx-auto px-4 sm:px-0">
        <Badge variant="outline" className="mb-6">
          {content.badge}
        </Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {content.title}
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          {content.description}
        </p>
        <Button size="lg" variant="outline" className="mt-10" asChild>
          <Link href={content.button.href}>
            {content.button.text}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
