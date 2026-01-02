"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/lib/utils/utils";

// --- Локальні визначення типів для View Transitions API ---
interface ViewTransition {
  readonly finished: Promise<void>;
  readonly ready: Promise<void>;
  readonly updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => ViewTransition;
};
// -------------------------------------------------------------

type AnimationVariant = "circle" | "circle-blur" | "gif" | "polygon";

type StartPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// Допоміжний хук для View Transitions API
export const useThemeTransition = () => {
  const startTransition = useCallback((updateFn: () => void) => {
    const doc = document as DocumentWithViewTransition;
    if (doc.startViewTransition) {
      doc.startViewTransition(updateFn);
    } else {
      updateFn();
    }
  }, []);

  return { startTransition };
};

export function ThemeToggle({
  variant = "circle-blur",
  start = "bottom-left",
  className,
}: {
  variant?: AnimationVariant;
  start?: StartPosition;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const { startTransition } = useThemeTransition();

  const { state: sidebarState } = useSidebar();

  const showLabel = sidebarState === "expanded";
  const themeToSet = resolvedTheme === "light" ? "dark" : "light";

  const handleClick = useCallback(() => {
    const styleId = `theme-transition-${Date.now()}`;
    const style = document.createElement("style");
    style.id = styleId;

    let css = "";
    const positions = {
      center: "center",
      "top-left": "top left",
      "top-right": "top right",
      "bottom-left": "bottom left",
      "bottom-right": "bottom right",
    };

    if (variant === "circle") {
      const cx =
        start === "center" ? "50" : start.includes("left") ? "0" : "100";
      const cy =
        start === "center" ? "50" : start.includes("top") ? "0" : "100";
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) { animation: none; }
          ::view-transition-new(root) {
            animation: circle-expand 0.4s ease-out;
            transform-origin: ${positions[start]};
          }
          @keyframes circle-expand {
            from { clip-path: circle(0% at ${cx}% ${cy}%); }
            to { clip-path: circle(150% at ${cx}% ${cy}%); }
          }
        }
      `;
    } else if (variant === 'circle-blur') {
      const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100';
      const cy = start === 'center' ? '50' : start.includes('top') ? '0' : '100';
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.5s ease-out;
            transform-origin: ${positions[start]};
            filter: blur(0);
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              filter: blur(0);
            }
          }
        }
      `;
    } else if (variant === "polygon") {
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) { animation: none; }
          ::view-transition-new(root) {
            animation: ${
              resolvedTheme === "light" ? "wipe-in-dark" : "wipe-in-light"
            } 0.4s ease-out;
          }
          @keyframes wipe-in-dark {
            from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
            to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
          }
          @keyframes wipe-in-light {
            from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }
            to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
          }
        }
      `;
    }

    if (css) {
      style.textContent = css;
      document.head.appendChild(style);
      setTimeout(() => document.getElementById(styleId)?.remove(), 3000);
    }

    startTransition(() => {
      setTheme(themeToSet);
    });
  }, [resolvedTheme, setTheme, startTransition, variant, start, themeToSet]);

  return (
    <Button
      variant="outline"
      size={showLabel ? "default" : "icon"}
      onClick={handleClick}
      className={cn("gap-2", className)}
      aria-label={`Перемкнути на ${themeToSet} тему`}
    >
      <div className="relative h-[1.2rem] w-[1.2rem]">
        <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>

      {showLabel && (
        <span className="text-sm">
          {resolvedTheme === "light" ? "Світла" : "Темна"}
        </span>
      )}
      <span className="sr-only">Перемкнути тему</span>
    </Button>
  );
}