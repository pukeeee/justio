import { Suspense } from "react";
import { MainHeader } from "@/frontend/widgets/root/header/ui/MainHeader";
import HeaderSkeleton from "@/frontend/widgets/root/header/ui/HeaderSkeleton";
import { Footer } from "@/frontend/widgets/root/footer/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderSkeleton />}>
        <MainHeader />
      </Suspense>
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}
