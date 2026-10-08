import { PageShell } from "@/components/PageShell";
import { StudentsShowcase } from "@/components/StudentsShowcase";
import { getStudents } from "@/lib/sheet-data";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const students = await getStudents();
  return (
    <PageShell slug="schools" bare>
      <StudentsShowcase students={students} />
    </PageShell>
  );
}
