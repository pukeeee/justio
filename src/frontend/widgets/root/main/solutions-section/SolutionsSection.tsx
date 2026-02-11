"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Card, CardContent } from "@/frontend/shared/components/ui/card";
import { ArrowRight, LucideIcon, User, Scale, Building2 } from "lucide-react"; // Імпортуємо всі LucideIcon

// Мапування назв іконок до їхніх компонентів
const IconMap: { [key: string]: LucideIcon } = {
  User: User,
  Scale: Scale,
  Building2: Building2,
};

// Інтерфейс для пропсів SolutionsSection
interface SolutionsSectionProps {
  content: {
    header: {
      tagline: string;
      title: string;
      description: string;
    };
    audiences: Array<{
      icon: string; // Змінено на рядок
      title: string;
      description: string;
      href: string;
    }>;
    footer: {
      title: string;
    };
  };
}

export default function SolutionsSection({ content }: SolutionsSectionProps) {
  const { header, audiences, footer } = content;
  return (
    <section className="py-16 sm:py-20 bg-background">
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

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {audiences.map((audience, index) => {
            const IconComponent = IconMap[audience.icon]; // Отримуємо компонент іконки з мапи
            return (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={audience.href} className="group block h-full">
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/30 text-primary">
                        {IconComponent && <IconComponent />}{" "}
                        {/* Відображаємо компонент */}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        {audience.title}
                      </h3>
                      <p className="text-base text-muted-foreground mb-4 grow">
                        {audience.description}
                      </p>
                      <span className="inline-flex items-center text-sm font-medium text-primary mt-auto">
                        {footer.title}
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
