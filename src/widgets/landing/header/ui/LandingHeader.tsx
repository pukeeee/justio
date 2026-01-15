"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils/utils";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Закриття мобільного меню при зміні розміру вікна
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Блокування scroll при відкритому меню
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

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/signin">Увійти</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={LANDING_CONTENT.header.cta.href}>
                {LANDING_CONTENT.header.cta.label}
              </Link>
            </Button>
          </div>

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

              <div
                className="pt-4 space-y-2 animate-fade-in-up"
                style={{ animationDelay: "200ms" }}
              >
                <Button asChild variant="outline" className="w-full">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Увійти
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link
                    href={LANDING_CONTENT.header.cta.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {LANDING_CONTENT.header.cta.label}
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
