import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-md px-5 py-10">
      <Link href="/" className="text-sm font-medium text-primary">
        ← {APP_NAME}
      </Link>
      <h1 className="mb-4 mt-6 text-2xl font-bold">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-relaxed text-muted">
        <p>
          {APP_NAME} is a private subscription tracker. We never connect to your
          bank or payment accounts — you add subscriptions manually, and your
          data stays with you.
        </p>
        <p>
          We store the account details you provide (email, optional name) and
          the subscriptions you enter, solely to operate the service. You can
          export all of your data or permanently delete your account, with all
          associated data, at any time from Settings.
        </p>
        <p>
          We do not sell your data. Payment information, when you upgrade, is
          handled entirely by our payment processor (Stripe) and is never stored
          by us.
        </p>
        <p className="text-xs">
          This is a placeholder policy for development. Replace with a reviewed
          GDPR-compliant policy before launch.
        </p>
      </div>
    </article>
  );
}
