interface BenefitItem {
  title: string;
  description: string;
}

interface PracticeBenefitsProps {
  content: {
    title: string;
    items: BenefitItem[];
  };
}

/**
 * Компонент для секції "Переваги для практики".
 * Відображає заголовок та список переваг у двох колонках.
 */
export function PracticeBenefits({ content }: PracticeBenefitsProps) {
  // Розділяємо масив на дві частини для двох колонок
  const half = Math.ceil(content.items.length / 2);
  const firstHalf = content.items.slice(0, half);
  const secondHalf = content.items.slice(half);

  return (
    <div className="py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">
            {content.title}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {firstHalf.map((item) => (
              <div key={item.title}>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {secondHalf.map((item) => (
              <div key={item.title}>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
