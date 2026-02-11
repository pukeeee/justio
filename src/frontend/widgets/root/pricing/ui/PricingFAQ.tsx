"use client";

interface FAQItem {
  question: string;
  answer: string;
}

interface PricingFAQProps {
  content: {
    title: string;
    description: string;
    items: FAQItem[];
  };
}

/**
 * Блок частих запитань (FAQ) для сторінки тарифів
 */
export function PricingFAQ({ content }: PricingFAQProps) {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {content.description}
          </p>
        </div>

        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 max-w-5xl mx-auto">
          {content.items.map((item) => (
            <div key={item.question} className="group">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
                {item.question}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
