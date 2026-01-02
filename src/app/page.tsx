import Link from "next/link";

export default function Page() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to SaaS CRM</h1>
        <p className="mb-8">
          <Link href="/docs" className="text-blue-500 hover:underline text-lg">
            Переглянути документацію
          </Link>
        </p>
      </main>
    </div>
  );
}
