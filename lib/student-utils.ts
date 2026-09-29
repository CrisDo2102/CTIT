import type { Student } from "@/lib/dashboard-types";

// File nay chi chua ham thuan (khong fetch, khong doc process.env) de dung
// duoc ca o server (trang chu) lan o client (StudentsShowcase co filter).

export function groupStudentsBySchool(
  students: Student[]
): Array<{ school: string; schoolFull: string; students: Student[] }> {
  const order: string[] = [];
  const grouped = new Map<string, Student[]>();

  for (const student of students) {
    if (!grouped.has(student.school)) {
      grouped.set(student.school, []);
      order.push(student.school);
    }
    grouped.get(student.school)!.push(student);
  }

  return order.map((school) => {
    const members = grouped.get(school)!;
    return {
      school,
      schoolFull: members.find((member) => member.schoolFull)?.schoolFull ?? "",
      students: members
    };
  });
}

/**
 * Danh sach cac truong hoc thuc su co trong du lieu sheet, sap xep A->Z.
 * Dung de render dropdown filter: chi hien truong nao thuc su ton tai,
 * khong hardcode san mot danh sach truong co dinh.
 */
export function getDistinctSchools(students: Student[]): string[] {
  const set = new Set<string>();
  for (const student of students) {
    if (student.school) {
      set.add(student.school);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
}
