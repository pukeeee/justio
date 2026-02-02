/**
 * @prop content - Об'єкт з контентом для секції.
 * @prop content.title - Основний заголовок секції.
 * @prop content.problem - Текст, що описує проблему.
 * @prop content.solution - Текст, що описує рішення.
 */
interface ProblemSolutionSubpageProps {
  content: {
    title: string;
    problem: string;
    solution: string;
  };
}

/**
 * Компонент для секції "Проблема-Рішення" на підсторінках продукту.
 * Відображає заголовок, опис проблеми та її рішення.
 */
export function ProblemSolutionSubpage({
  content,
}: ProblemSolutionSubpageProps) {
  return (
    <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground text-center md:text-left">
          {content.title}
        </h2>
        <p className="mt-6 text-lg text-muted-foreground text-center md:text-left">
          {content.problem}
        </p>
        <p className="mt-4 text-lg text-muted-foreground text-center md:text-left">
          {content.solution}
        </p>
      </div>
    </div>
  );
}
