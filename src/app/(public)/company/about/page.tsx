"use client";

import { AboutHero } from "@/widgets/about/ui/AboutHero";
import { AboutStory } from "@/widgets/about/ui/AboutStory";
import { AboutValues } from "@/widgets/about/ui/AboutValues";
import { AboutTeam } from "@/widgets/about/ui/AboutTeam";
import { CTAsection } from "@/widgets/cta-section/ui/CTAsection";
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