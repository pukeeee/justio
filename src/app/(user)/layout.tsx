import { Suspense } from "react";
import { MainHeader } from "@/frontend/widgets/header/ui/MainHeader";
import HeaderSkeleton from "@/frontend/widgets/header/ui/HeaderSkeleton";
import { Footer } from "@/frontend/widgets/footer/Footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderSkeleton />}>
        <MainHeader />
      </Suspense>
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
