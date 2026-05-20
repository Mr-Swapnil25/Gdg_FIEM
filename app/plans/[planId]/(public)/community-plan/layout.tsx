import Header from "@/components/plan/Header";
import PlanLayoutContent from "@/components/plan/PlanLayoutContent";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "GemiTrek Community Plan",
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
      <Header isPublic={true} />
      <main className="flex min-h-[calc(100svh-4rem)] flex-col items-center bg-blue-50/40 dark:bg-background">
        <PlanLayoutContent planId={params.planId} isPublic={true}>
          {children}
        </PlanLayoutContent>
      </main>
    </>
  );
}
