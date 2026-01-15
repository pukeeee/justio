"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/shared/lib/utils/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Показувати кнопку після прокрутки на 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-8 right-8 z-40 h-12 w-12 rounded-full shadow-lg transition-all duration-300",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none",
      )}
      aria-label="Прокрутити вгору"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
