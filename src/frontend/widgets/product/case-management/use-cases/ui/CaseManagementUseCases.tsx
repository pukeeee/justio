interface UseCaseItem {
  title: string;
  description: string;
}

interface CaseManagementUseCasesProps {
  content: {
    title: string;
    description: string;
    items: UseCaseItem[];
  };
}

export function CaseManagementUseCases({
  content,
}: CaseManagementUseCasesProps) {
  return (
    <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {content.items.map((useCase) => (
            <div
              key={useCase.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {useCase.title}
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
