import Link from "next/link";
import { Separator } from "@/shared/components/ui/separator";
import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function LandingFooter() {
  const { copyright, columns } = LANDING_CONTENT.footer;
  // const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12">
          {/* Logo & Description Column */}
          <div className="space-y-4 sm:col-span-2">
            <Link href="/" className="inline-block">
              <h3 className="text-xl font-bold gradient-text">
                {LANDING_CONTENT.header.logo}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              CRM для малого бізнесу в Україні. Працює офлайн, інтегрується з
              локальними сервісами.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <a href="mailto:hello@crm4smb.com" aria-label="Email">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h4 className="font-semibold text-sm">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block hover:translate-x-1 duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">{copyright}</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Конфіденційність
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Умови
            </Link>
            <Link
              href="/cookies"
              className="hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
