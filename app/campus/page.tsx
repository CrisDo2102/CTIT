import { CampusJournal } from "@/components/CampusJournal";
import { PageShell } from "@/components/PageShell";
import { getCampus } from "@/lib/sheet-data";

export default async function CampusPage() {
  return <PageShell slug="campus" bare><CampusJournal items={await getCampus()} /></PageShell>;
}
