"use client";

import { motion } from "motion/react";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { ProductMockup } from "../../../shared/components/ProductMockup";
import { heroContent } from "@/content/root/hero";
import { routes } from "@/shared/config/routes";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-muted/50 to-background" />
      <div className="container-wide relative">
        <div className="py-20 md:py-28 lg:py-36">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 text-sm font-medium"
              >
                {heroContent.badgeText}
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance"
            >
              {heroContent.heading.main}
              <br />
              <span className="gradient-text">
                {heroContent.heading.highlight}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance md:text-xl"
            >
              {heroContent.description}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-accent/90 text-primary-foreground"
                asChild
              >
                <Link href={routes.demo}>
                  {heroContent.buttons.demo.text}
                  <ArrowRight
                    className="ml-2 h-4 w-4"
                    aria-label={heroContent.buttons.demo.iconLabel}
                  />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={routes.pricing}>
                  {heroContent.buttons.pricing.text}
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Product Mockup */}
          <motion.div
            className="mt-16 md:mt-24"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <ProductMockup className="mx-auto max-w-5xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
