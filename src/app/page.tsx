import { getItems } from "@/actions/items";
import DatabaseView from "./_components/DatabaseView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getItems();
  return <DatabaseView data={data} />;
}
