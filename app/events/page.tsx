import { EventsJournal } from "@/components/EventsJournal";
import { PageShell } from "@/components/PageShell";
import { getEvents } from "@/lib/sheet-data";

export default async function EventsPage() {
  return (
    <PageShell slug="events" bare>
      <EventsJournal items={await getEvents()} />
    </PageShell>
  );
}
