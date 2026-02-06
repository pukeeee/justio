import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Badge } from "@/frontend/shared/components/ui/badge";
import { ProductMockup } from "@/frontend/shared/components/ProductMockup";

interface ProductArchitectureProps {
  content: {
    badge: string;
    title: string;
    description1: string;
    description2: string;
    cta: {
      text: string;
      href: string;
    };
  };
}

export function ProductArchitecture({ content }: ProductArchitectureProps) {
  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <Badge variant="outline" className="mb-6">
              {content.badge}
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {content.title}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              {content.description1}
            </p>
            <p className="mt-4 text-muted-foreground">{content.description2}</p>
            <Button className="mt-8" variant="outline" asChild>
              <Link href={content.cta.href}>
                {content.cta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}
