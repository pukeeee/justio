import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

interface ProductFeaturesProps {
  content: {
    title: string;
    description: string;
    items: FeatureItem[];
    learnMore: string;
  };
}

export function ProductFeatures({ content }: ProductFeaturesProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {content.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.items.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <div className="rounded-xl border border-border bg-card p-8 hover:border-primary hover:shadow-lg transition-all duration-300 h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/30 text-primary">
                  <feature.icon className="h-6 w-6 " />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-accent group-hover:text-primary">
                  {content.learnMore}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
