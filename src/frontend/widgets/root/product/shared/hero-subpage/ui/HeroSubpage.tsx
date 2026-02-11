"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Badge } from "@/frontend/shared/components/ui/badge";

/**
 * @prop content - Об'єкт з контентом для Hero секції.
 * @prop content.badge - Текст для "значка" (badge).
 * @prop content.title - Основний заголовок секції.
 * @prop content.description - Опис під заголовком.
 * @prop content.benefits - Масив переваг для списку.
 * @prop content.buttons.primary - Контент для основної кнопки.
 * @prop content.buttons.secondary - Контент для другорядної кнопки.
 * @prop content.screenshot.text - Текст-заглушка для скріншоту.
 */
interface HeroSubpageProps {
  content: {
    badge: string;
    title: string;
    description: string;
    benefits: string[];
    buttons: {
      primary: {
        text: string;
        href: string;
      };
      secondary: {
        text: string;
        href: string;
      };
    };
    screenshot: {
      text: string;
    };
  };
}

/**
 * Компонент Hero-секції для підсторінок продукту.
 * Відображає заголовок, опис, список переваг, кнопки та заглушку для скріншоту.
 * Використовує `motion` для анімації.
 */
export function HeroSubpage({ content }: HeroSubpageProps) {
  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge variant="secondary" className="mb-4">
            {content.badge}
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            {content.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {content.description}
          </p>
          <ul className="space-y-3 mb-8">
            {content.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href={content.buttons.primary.href}>
                {content.buttons.primary.text}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={content.buttons.secondary.href}>
                {content.buttons.secondary.text}
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="aspect-4/3 rounded-xl border bg-linear-to-br from-muted to-muted/50 flex items-center justify-center"
        >
          <p className="text-muted-foreground">{content.screenshot.text}</p>
        </motion.div>
      </div>
    </div>
  );
}
