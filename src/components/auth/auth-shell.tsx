import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-10">
      <Link href="/" className="mb-10 text-lg font-bold tracking-tight">
        {APP_NAME}
      </Link>
      <div className="flex flex-1 flex-col justify-center pb-10">{children}</div>
    </div>
  );
}
