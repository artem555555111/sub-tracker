import Link from "next/link";
import { PlusIcon } from "@/components/icons";

export function AddFab({ label }: { label: string }) {
  return (
    <Link
      href="/subscriptions/new"
      className="fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary py-3.5 pl-4 pr-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:opacity-90"
    >
      <PlusIcon className="size-5" />
      {label}
    </Link>
  );
}
