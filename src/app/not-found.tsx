import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

/**
 * Глобальна сторінка 404 (Не знайдено).
 * Відображається, коли Next.js не може знайти відповідний роут.
 */
export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Сторінку не знайдено</h2>
      <p className="text-muted-foreground">
        На жаль, сторінка, яку ви шукаєте, не існує.
      </p>
      <Button asChild>
        <Link href="/">Повернутися на головну</Link>
      </Button>
    </div>
  );
}
