import { navMetadata } from "@/lib/page-meta";
import { EventsJournal } from "@/components/EventsJournal";
import { PageShell } from "@/components/PageShell";
import { todayInVietnam } from "@/lib/format";
import { getEvents } from "@/lib/sheet-data";

export const metadata = navMetadata("/events");

export default async function EventsPage() {
  return (
    <PageShell slug="events" bare>
      <EventsJournal items={await getEvents()} today={todayInVietnam()} />
    </PageShell>
  );
}
