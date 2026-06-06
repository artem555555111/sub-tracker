import { getTranslations } from "next-intl/server";
import { WifiOffIcon } from "@/components/icons";

// Served by the service worker when a navigation fails offline.
export default async function OfflinePage() {
  const t = await getTranslations("offline");

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-primary">
        <WifiOffIcon className="size-7" />
      </div>
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <p className="max-w-xs text-sm text-muted">{t("desc")}</p>
    </div>
  );
}
