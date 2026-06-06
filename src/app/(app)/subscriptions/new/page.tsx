import { AddFlow } from "@/components/subscriptions/add-flow";
import { GENERIC_BILLS } from "@/lib/catalog-data";
import { CATEGORIES } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { CURRENCIES } from "@/lib/money";
import { requireUser } from "@/lib/session";

export default async function NewSubscriptionPage() {
  const user = await requireUser();
  const catalog = await prisma.serviceCatalog.findMany({
    orderBy: { name: "asc" },
  });

  const items = catalog.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    country: c.country,
    typicalPrice: c.typicalPrice,
    typicalCurrency: c.typicalCurrency,
    defaultCycle: c.defaultCycle,
  }));

  return (
    <AddFlow
      catalog={items}
      genericBills={GENERIC_BILLS}
      userCurrency={user.currency}
      userCountry={user.country}
      defaultReminder={user.reminderDaysBefore}
      categories={CATEGORIES}
      currencies={[...CURRENCIES]}
    />
  );
}
