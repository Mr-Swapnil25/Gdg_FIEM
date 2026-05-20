import Header from "@/components/plan/Header";
import PlanLayoutContent from "@/components/plan/PlanLayoutContent";
import Progress from "@/components/Progress";
import {Toaster} from "@/components/ui/toaster";
import {Analytics} from "@vercel/analytics/react";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "GemiTrek Plan",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {planId: string};
}) {
  return (
    <>
      <Header isPublic={false} />
      <main className="flex min-h-[calc(100svh-4rem)] flex-col items-center bg-blue-50/40 dark:bg-background">
        <PlanLayoutContent planId={params.planId} isPublic={false}>
          {children}
        </PlanLayoutContent>
        <Progress />
        <Analytics />
        <Toaster />
      </main>
    </>
  );
}
