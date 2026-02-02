"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/frontend/shared/lib/utils";

interface BlogCategoriesProps {
  categories: string[];
}

export function BlogCategories({ categories }: BlogCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  return (
    <div className="py-8 sticky top-16 z-20 bg-background/80 backdrop-blur-md -mt-8 mb-8 border-b border-border/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
