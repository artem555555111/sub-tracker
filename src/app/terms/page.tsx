import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-md px-5 py-10">
      <Link href="/" className="text-sm font-medium text-primary">
        ← {APP_NAME}
      </Link>
      <h1 className="mb-4 mt-6 text-2xl font-bold">Terms of Service</h1>
      <div className="space-y-4 text-sm leading-relaxed text-muted">
        <p>
          {APP_NAME} helps you track your own subscriptions and recurring bills.
          It provides reminders and informational insights only — it does not
          cancel subscriptions on your behalf and is not financial advice.
        </p>
        <p>
          You are responsible for the accuracy of the data you enter. The
          service is provided “as is”, without warranties, during this
          development phase.
        </p>
        <p className="text-xs">
          This is a placeholder document for development. Replace with reviewed
          terms before launch.
        </p>
      </div>
    </article>
  );
}
