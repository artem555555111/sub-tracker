import { BottomNav } from "@/components/bottom-nav";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Route guard for the whole authed area.
  await requireUser();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      <main className="flex-1 px-4 pb-24 pt-5">{children}</main>
      <BottomNav />
    </div>
  );
}
