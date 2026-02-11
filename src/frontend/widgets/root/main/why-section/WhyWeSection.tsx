"use client";

import {
  FeatureCard,
  FeatureGrid,
} from "@/frontend/shared/components/FeatureCard";
import { LucideIcon, Scale, Shield, Clock, FileText } from "lucide-react"; // Імпортуємо всі LucideIcon

// Мапування назв іконок до їхніх компонентів
const IconMap: { [key: string]: LucideIcon } = {
  Scale: Scale,
  Shield: Shield,
  Clock: Clock,
  FileText: FileText,
};

// Інтерфейс для пропсів WhyWeSection
interface WhyWeSectionProps {
  content: {
    header: {
      tagline: string;
      title: string;
      description: string;
    };
    features: Array<{
      title: string;
      description: string;
      icon: string; // Змінено на рядок
    }>;
  };
}

export default function WhyWeSection({ content }: WhyWeSectionProps) {
  const { header, features } = content;

  return (
    <section className="py-16 sm:py-20 lg:py-30 bg-popover">
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

        {/* Feature cards grid */}
        <FeatureGrid columns={4}>
          {features.map((feature, index) => {
            const IconComponent = IconMap[feature.icon];
            return (
              <FeatureCard
                key={index}
                icon={IconComponent}
                title={feature.title}
                description={feature.description}
                variant="bordered"
              />
            );
          })}
        </FeatureGrid>
      </div>
    </section>
  );
}
