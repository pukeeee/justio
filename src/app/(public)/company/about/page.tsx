"use client";

import { AboutHero } from "@/frontend/widgets/root/about/ui/AboutHero";
import { AboutStory } from "@/frontend/widgets/root/about/ui/AboutStory";
import { AboutValues } from "@/frontend/widgets/root/about/ui/AboutValues";
import { AboutTeam } from "@/frontend/widgets/root/about/ui/AboutTeam";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection";
import { aboutContent } from "@/content/main/company/about";

/**
 * Сторінка "Про нас" Justio CRM
 * Побудована за методологією FSD на основі бачення продукту та історії засновників
 */
export default function AboutPage() {
  return (
    <main>
      <AboutHero content={aboutContent.hero} />
      <AboutStory content={aboutContent.story} />
      <AboutValues content={aboutContent.values} />
      <AboutTeam content={aboutContent.team} />
      <CTAsection content={aboutContent.cta} />
    </main>
  );
}
