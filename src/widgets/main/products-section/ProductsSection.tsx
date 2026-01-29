import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productsContent } from "../../../content/root/products";

export default function ProductsSection() {
  const { header, features, exploreAllFeatures } = productsContent;

  return (
    <section className="py-16 sm:py-20 bg-popover">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 text-xs sm:text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">
            {header.tagline}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            {header.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {header.description}
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <ProductCard
              key={index}
              title={feature.title}
              description={feature.description}
              href={feature.href}
            />
          ))}
          <Link
            href={exploreAllFeatures.href}
            className="flex items-center text-muted-foreground justify-center rounded-xl border border-dashed border-border p-6 sm:p-8 hover:text-primary font-medium hover:underline hover:bg-primary/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              {exploreAllFeatures.text}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
