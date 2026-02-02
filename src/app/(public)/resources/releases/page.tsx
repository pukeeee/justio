"use client";

import { ReleasesHero } from "@/frontend/widgets/releases/ui/ReleasesHero";
import { ReleasesTimeline } from "@/frontend/widgets/releases/ui/ReleasesTimeline";
import { releasesContent } from "@/content/main/resources/releases";

/**
 * Сторінка історії оновлень Justio CRM
 * Побудована за методологією FSD з деталізацією змін та покращеною версткою
 */
export default function ReleasesPage() {
  return (
    <main>
      <ReleasesHero content={releasesContent.hero} />
      <ReleasesTimeline
        content={{
          items: releasesContent.items,
          types: releasesContent.types,
          sections: releasesContent.sections,
        }}
      />
    </main>
  );
}
