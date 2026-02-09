import {
  FeatureCard,
  FeatureGrid,
} from "@/frontend/shared/components/FeatureCard";
import { LucideIcon } from "lucide-react";

/**
 * @prop icon - Іконка можливості.
 * @prop title - Заголовок можливості.
 * @prop description - Опис можливості.
 */
interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * @prop content - Об'єкт з контентом для секції.
 * @prop content.title - Заголовок секції.
 * @prop content.description - Опис секції.
 * @prop content.items - Масив можливостей для відображення.
 */
interface FeaturesSubpageProps {
  content: {
    title: string;
    description: string;
    items: FeatureItem[];
  };
}

/**
 * Компонент для секції "Можливості" на підсторінках продукту.
 * Відображає заголовок, опис та сітку з картками можливостей.
 */
export function FeaturesSubpage({ content }: FeaturesSubpageProps) {
  return (
    <div className="bg-muted/30 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <FeatureGrid columns={3}>
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
