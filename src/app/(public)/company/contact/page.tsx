"use client";

import { ContactHero } from "@/frontend/widgets/root/contact/ui/ContactHero";
import { ContactMethods } from "@/frontend/widgets/root/contact/ui/ContactMethods";
import { ContactForm } from "@/frontend/widgets/root/contact/ui/ContactForm";
import { contactContent } from "@/content/main/company/contact";

/**
 * Сторінка контактів Justio CRM
 * Побудована за методологією FSD з локалізованим контентом та покращеною формою
 */
export default function ContactPage() {
  return (
    <main>
      <ContactHero content={contactContent.hero} />
      <ContactMethods content={contactContent.methods} />
      <ContactForm content={contactContent.form} />
    </main>
  );
}
