import { notFound } from "next/navigation";

interface ClientPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

/**
 * @description Сторінка деталей клієнта (Кабінет клієнта для юриста).
 * Ця сторінка знаходиться в контексті воркспейсу [slug].
 */
export default async function ClientPage({ params }: ClientPageProps) {
  const { slug, id } = await params;

  if (!slug || !id) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Деталі клієнта</h1>
        <p className="text-muted-foreground">
          Перегляд інформації про клієнта у воркспейсі{" "}
          <span className="font-mono text-foreground">{slug}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-2">Технічна інформація</h3>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">ID клієнта:</p>
            <p className="font-mono break-all">{id}</p>
          </div>
        </div>

        {/* Тут буде основний контент кабінету клієнта */}
        <div className="md:col-span-2 lg:col-span-2 rounded-xl border border-dashed flex items-center justify-center p-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Сторінка в розробці</p>
            <p className="text-xs text-muted-foreground/60">
              Тут буде історія справ, документи та фінанси клієнта
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
