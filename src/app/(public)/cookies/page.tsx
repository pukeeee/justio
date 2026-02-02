"use client";

import { CookiesHero } from "@/frontend/widgets/cookies/ui/CookiesHero";
import { CookiesTable } from "@/frontend/widgets/cookies/ui/CookiesTable";
import { CookiesSections } from "@/frontend/widgets/cookies/ui/CookiesSections";
import { cookiesContent } from "@/content/main/cookies";

/**
 * Сторінка Політики використання файлів Cookie Justio CRM
 */
export default function CookiesPage() {
  return (
    <main>
      <CookiesHero content={cookiesContent.hero} />
      <CookiesTable content={cookiesContent.cookieTypes} />
      <CookiesSections sections={cookiesContent.sections} />
    </main>
  );
}
