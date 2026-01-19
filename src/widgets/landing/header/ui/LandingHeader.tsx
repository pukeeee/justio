"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import { Menu, X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils/utils";
import { useAuthModal } from "@/shared/stores/use-auth-modal.store";
import { useAuth } from "@/shared/hooks/use-auth";
import { AuthenticatedUser } from "./AuthenticatedUser";

/**
 * Компонент хедера для landing page
 */
export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { open: openAuthModal } = useAuthModal();
  const { isAuthenticated, loading } = useAuth();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect для управління показом skeleton з таймаутом
  useEffect(() => {
    // Очищуємо попередній таймер при кожній зміні loading
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (loading) {
      // Показуємо skeleton одразу
      setShowSkeleton(true);

      // Ховаємо skeleton через 3 секунди
      timeoutRef.current = setTimeout(() => {
        setShowSkeleton(false);
      }, 3000);
    } else {
      // Якщо loading=false, ховаємо skeleton одразу
      setShowSkeleton(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  /**
   * Рендерить блок автентифікації для desktop
   */
  const renderAuthBlock = () => {
    // Показуємо скелетон тільки якщо loading=true і не минув таймаут
    if (showSkeleton) {
      return (
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Завантаження...
            </span>
          </div>
        </div>
      );
    }

    // Якщо авторизований - показуємо AuthenticatedUser
    if (isAuthenticated) {
      return <AuthenticatedUser />;
    }

    // Fallback: кнопка Увійти
    return (
      <div className="hidden md:flex items-center">
        <Button variant="ghost" size="sm" onClick={openAuthModal}>
          Увійти
        </Button>
      </div>
    );
  };

  /**
   * Рендерить блок автентифікації для mobile
   */
  const renderMobileAuthBlock = () => {
    if (showSkeleton) {
      return (
        <div
          className="pt-4 space-y-2 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Завантаження...</span>
          </div>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div
          className="pt-4 space-y-2 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <Button asChild className="w-full">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              Дашборд
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div
        className="pt-4 space-y-2 animate-fade-in-up"
        style={{ animationDelay: "200ms" }}
      >
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            openAuthModal();
            setMobileMenuOpen(false);
          }}
        >
          Увійти
        </Button>
      </div>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm"
          : "bg-background/95 backdrop-blur-md",
      )}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl font-bold gradient-text">
              {LANDING_CONTENT.header.logo}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {LANDING_CONTENT.header.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop Auth Block */}
            {renderAuthBlock()}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Закрити меню" : "Відкрити меню"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm md:hidden z-40 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-background border-b shadow-lg animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="container py-6 space-y-1">
              {LANDING_CONTENT.header.nav.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground animate-fade-in-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {renderMobileAuthBlock()}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
