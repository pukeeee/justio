import { Badge } from "@/frontend/shared/components/ui/badge";
import { Button } from "@/frontend/shared/components/ui/button";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { ProductMockup } from "@/frontend/shared/components/ProductMockup";

interface SecuritySectionProps {
  content: {
    header: {
      tagline: string;
      title: string;
      description: string;
    };
    features: string[];
    cta: {
      text: string;
      href: string;
    };
  };
}

export default function SecuritySection({ content }: SecuritySectionProps) {
  const { header, features, cta } = content;

  return (
    <section className="py-16 sm:py-20 bg-secondary-foreground text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop layout - two columns */}
        <div className="hidden lg:grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <Badge variant="secondary" className="mb-6">
              {header.tagline}
            </Badge>
            <h2 className="text-3xl text-background font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {header.title}
            </h2>

            <p className="mt-6 text-base sm:text-lg text-muted/80">
              {header.description}
            </p>
            <ul className="mt-8 space-y-4">
              {features.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-muted/90"
                >
                  <Shield className="h-5 w-5 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button size="lg" variant="secondary" className="mt-10" asChild>
              <Link href={cta.href}>
                {cta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-tr from-accent/20 to-transparent rounded-2xl" />
              <ProductMockup
                variant="simple"
                className="border-primary-foreground/20"
              />
            </div>
          </div>
        </div>

        {/* Mobile layout - stacked */}
        <div className="lg:hidden">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-6">
              {header.tagline}
            </Badge>
            <h2 className="text-3xl text-background font-semibold tracking-tight sm:text-4xl">
              {header.title}
            </h2>

            <p className="mt-6 text-base sm:text-lg text-muted/80">
              {header.description}
            </p>
          </div>

          <div className="mb-10">
            <ul className="space-y-4">
              {features.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-muted/90"
                >
                  <Shield className="h-5 w-5 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 w-full"
              asChild
            >
              <Link href={cta.href}>
                {cta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-tr from-accent/20 to-transparent rounded-2xl" />
            <ProductMockup
              variant="simple"
              className="border-primary-foreground/20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
