"use client";

import { 
  Lock, 
  Key, 
  History, 
  UserCheck, 
  Eye, 
  Server,
  LucideIcon 
} from "lucide-react";
import { FeatureCard, FeatureGrid } from "@/shared/components/FeatureCard";

const iconMap: Record<string, LucideIcon> = {
  Lock,
  Key,
  History,
  UserCheck,
  Eye,
  Server,
};

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface SecurityFeaturesProps {
  content: {
    title: string;
    description: string;
    items: FeatureItem[];
  };
}

export function SecurityFeatures({ content }: SecurityFeaturesProps) {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4 sm:text-4xl">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </div>

        <FeatureGrid columns={3}>
          {content.items.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={iconMap[feature.icon]}
              title={feature.title}
              description={feature.description}
              variant="bordered"
            />
          ))}
        </FeatureGrid>
      </div>
    </section>
  );
}
