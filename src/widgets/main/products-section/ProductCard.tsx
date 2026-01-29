import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productsContent } from "@/content/root/products";

export default function ProductCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30">
        <div className="flex flex-col h-full">
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          <div className="mt-auto pt-4">
            <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {productsContent.productCard.text}
              <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
