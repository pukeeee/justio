import {
  FeatureCard,
  FeatureGrid,
} from "@/frontend/shared/components/FeatureCard";
import { LucideIcon } from "lucide-react";

interface PhilosophyPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ProductPhilosophyProps {
  content: {
    title: string;
    description: string;
    points: PhilosophyPoint[];
  };
}

export function ProductPhilosophy({ content }: ProductPhilosophyProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground">{content.description}</p>
        </div>

        <FeatureGrid columns={3}>
          {content.points.map((point) => (
            <FeatureCard
              key={point.title}
              icon={point.icon}
              title={point.title}
              description={point.description}
              variant="filled"
            />
          ))}
        </FeatureGrid>
      </div>
    </section>
  );
}
