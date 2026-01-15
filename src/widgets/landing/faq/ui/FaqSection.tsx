"use client";

import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export function FaqSection() {
  const { title, items } = LANDING_CONTENT.faq;

  return (
    <section id="faq" className="w-full py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Заголовок */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {title}
            </h2>
            <p className="text-muted-foreground">
              Знайдіть відповіді на найпопулярніші запитання
            </p>
          </div>

          {/* Accordion FAQ */}
          <div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {items.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-lg px-6 hover:border-primary/50 transition-colors bg-card"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-semibold text-base md:text-lg pr-4">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 pt-2 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact support CTA */}
          <div className="text-center space-y-4 pt-8">
            <p className="text-muted-foreground">
              Не знайшли відповідь на своє питання?
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/support" className="group">
                <MessageCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Зв`язатися з підтримкою
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}