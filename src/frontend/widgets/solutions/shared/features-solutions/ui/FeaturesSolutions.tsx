import {
  FeatureCard,
  FeatureGrid,
} from "@/frontend/shared/components/FeatureCard";
import { LucideIcon } from "lucide-react";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeaturesSolutionsProps {
  content: {
    title: string;
    description: string;
    items: FeatureItem[];
  };
}

export function FeaturesSolutions({ content }: FeaturesSolutionsProps) {
  return (
    <div className="bg-muted/30 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {content.description}
          </p>
        </div>

        <FeatureGrid columns={4}>
          {content.items.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              variant="bordered"
            />
          ))}
        </FeatureGrid>
      </div>
    </div>
  );
}
