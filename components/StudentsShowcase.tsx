"use client";

import { useMemo, useRef, useState } from "react";
import { getDistinctSchools, groupStudentsBySchool } from "@/lib/student-utils";
import { SafeImage } from "@/components/SafeImage";
import { resolvePhotoUrl } from "@/lib/photo-url";
import type { Student } from "@/lib/dashboard-types";

type Props = {
  students: Student[];
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Mau nen avatar fallback: on dinh theo ten (cung 1 nguoi luon ra 1 mau).
function toneOf(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

export function StudentsShowcase({ students }: Props) {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [keyword, setKeyword] = useState("");

  // Danh sach truong lay tu chinh du lieu sheet (khong hardcode), sap xep A-Z.
  const schools = getDistinctSchools(students);

  const countBySchool = useMemo(() => {
    const map = new Map<string, number>();
    for (const student of students) {
      map.set(student.school, (map.get(student.school) ?? 0) + 1);
    }
    return map;
  }, [students]);

  const filteredStudents = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return students.filter((student) => {
      if (selectedSchool && student.school !== selectedSchool) return false;
      if (!query) return true;
      return [student.name, student.major, student.faculty, student.school, student.schoolFull]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query));
    });
  }, [students, selectedSchool, keyword]);

  // Ten day du theo tung truong (tu cot "Tên đầy đủ" trong sheet) de hien tooltip o chip loc.
  const fullNameBySchool = useMemo(() => {
    const map = new Map<string, string>();
    for (const student of students) {
      if (student.schoolFull && !map.has(student.school)) {
        map.set(student.school, student.schoolFull);
      }
    }
    return map;
  }, [students]);

  const groups = groupStudentsBySchool(filteredStudents);
  const hasData = students.length > 0;
  const directoryRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0 });

  const facultyCountBySchool = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const student of students) {
      if (!map.has(student.school)) map.set(student.school, new Set());
      if (student.faculty) map.get(student.school)!.add(student.faculty);
    }
    return map;
  }, [students]);

  function scrollDirectory(direction: number) {
    directoryRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    const el = directoryRef.current;
    if (!el) return;
    setIsDragging(true);
    dragState.current = { startX: event.clientX, scrollLeft: el.scrollLeft };
    el.setPointerCapture(event.pointerId);
  }

  function drag(event: React.PointerEvent<HTMLDivElement>) {
    const el = directoryRef.current;
    if (!el || !isDragging) return;
    el.scrollLeft = dragState.current.scrollLeft - (event.clientX - dragState.current.startX);
  }

  function endDrag() {
    setIsDragging(false);
  }

  return (
    <section className="section no-top students-section">
      <div className="container">
        <div className="section-title">
          <div>
            <h2>Học viên tiêu biểu</h2>
            <p>Khám phá cộng đồng CTIT theo trường, ngành học và lĩnh vực chuyên môn.</p>
          </div>
          {hasData ? (
            <div className="students-count">
              <strong>{filteredStudents.length}</strong>
              <span>
                {selectedSchool || keyword ? "kết quả hiển thị" : "học viên trong sheet"}
              </span>
            </div>
          ) : null}
        </div>

        {hasData && schools.length > 0 ? (
          <section className="schools-directory" aria-labelledby="schools-directory-title">
            <div className="schools-directory-head">
              <div>
                <span className="schools-directory-kicker">Explore the network</span>
                <h3 id="schools-directory-title">Schools & Departments</h3>
                <p>Kéo, vuốt hoặc dùng phím mũi tên để khám phá từng trường và khoa.</p>
              </div>
              <div className="schools-directory-controls">
                <button type="button" className="directory-arrow" aria-label="Trường trước" onClick={() => scrollDirectory(-1)}>←</button>
                <button type="button" className="directory-arrow" aria-label="Trường tiếp theo" onClick={() => scrollDirectory(1)}>→</button>
              </div>
            </div>

            <div
              ref={directoryRef}
              className={`schools-directory-track ${isDragging ? "is-dragging" : ""}`}
              onPointerDown={startDrag}
              onPointerMove={drag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
              onWheel={(event) => {
                if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                  event.currentTarget.scrollLeft += event.deltaY;
                }
              }}
            >
              <button
                type="button"
                className={`school-directory-card ${selectedSchool === "" ? "is-active" : ""}`}
                onClick={() => setSelectedSchool("")}
              >
                <span className="directory-card-index">00</span>
                <span className="directory-card-name">Tất cả trường</span>
                <span className="directory-card-meta">{students.length} học viên · {schools.length} trường</span>
                <span className="directory-card-arrow">↗</span>
              </button>

              {schools.map((school, index) => {
                const facultyCount = facultyCountBySchool.get(school)?.size ?? 0;
                return (
                  <button
                    type="button"
                    key={school}
                    title={fullNameBySchool.get(school) || school}
                    className={`school-directory-card ${selectedSchool === school ? "is-active" : ""}`}
                    onClick={() => setSelectedSchool(school)}
                  >
                    <span className="directory-card-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="directory-card-name">{school}</span>
                    <span className="directory-card-full">{fullNameBySchool.get(school) || "School"}</span>
                    <span className="directory-card-meta">{countBySchool.get(school) ?? 0} học viên · {facultyCount} khoa</span>
                    <span className="directory-card-arrow">↗</span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {hasData ? (
          <div className="students-toolbar">
            <div className="students-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              <input
                className="input"
                type="search"
                value={keyword}
                placeholder="Tìm theo tên, trường, ngành, khoa…"
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>

            {schools.length > 1 ? (
              <div className="school-chips" role="tablist" aria-label="Lọc theo trường">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedSchool === ""}
                  className={`chip ${selectedSchool === "" ? "is-active" : ""}`}
                  onClick={() => setSelectedSchool("")}
                >
                  Tất cả trường
                  <em>{students.length}</em>
                </button>
                {schools.map((school) => (
                  <button
                    key={school}
                    type="button"
                    role="tab"
                    title={fullNameBySchool.get(school) || school}
                    aria-selected={selectedSchool === school}
                    className={`chip ${selectedSchool === school ? "is-active" : ""}`}
                    onClick={() => setSelectedSchool(school)}
                  >
                    {school}
                    <em>{countBySchool.get(school) ?? 0}</em>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {!hasData ? (
          <div className="empty-state">
            Chưa có dữ liệu học viên. Kiểm tra biến môi trường{" "}
            <code>STUDENTS_SHEET_CSV_URL</code> trong <code>.env.local</code>.
          </div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            Không tìm thấy học viên nào khớp với bộ lọc hiện tại.
            <button
              type="button"
              className="btn ghost empty-reset"
              onClick={() => {
                setKeyword("");
                setSelectedSchool("");
              }}
            >
              Xoá bộ lọc
            </button>
          </div>
        ) : (
          <div className="school-groups">
            {groups.map((group, groupIndex) => (
              <div className="school-group" key={group.school}>
                <div className="school-head">
                  <span className="school-index">
                    {String(groupIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="school-title">
                    <h3 className="school-name">{group.schoolFull || group.school}</h3>
                    {group.schoolFull ? <span className="school-abbr">{group.school}</span> : null}
                  </div>
                  <span className="school-count">{group.students.length} học viên</span>
                </div>

                <div className="student-grid">
                  {group.students.map((student) => (
                    <article
                      className="student-card"
                      key={`${group.school}-${student.name}`}
                    >
                      <div className="student-card-top">
                        <div className="student-photo">
                          <SafeImage
                            src={student.photo ? resolvePhotoUrl(student.photo, "students") : ""}
                            alt={student.name}
                            fallback={
                              <span
                                className="student-photo-fallback"
                                style={{ ["--tone" as string]: `${toneOf(student.name)}` }}
                                aria-hidden="true"
                              >
                                {initials(student.name)}
                              </span>
                            }
                          />
                        </div>

                        <div className="student-id">
                          <h4>{student.name}</h4>
                          {student.faculty ? (
                            <span className="student-faculty">{student.faculty}</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="student-facts">
                        <div className="student-fact">
                          <span className="fact-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M3 9.5 12 4l9 5.5" />
                              <path d="M5.5 10.5v6.5M10 10.5v6.5M14 10.5v6.5M18.5 10.5v6.5" />
                              <path d="M3 20h18" />
                            </svg>
                          </span>
                          <div className="fact-body">
                            {student.schoolFull ? (
                              <div className="fact-head">
                                <em className="school-abbr">{student.school}</em>
                              </div>
                            ) : null}
                            <p className="fact-value">{student.schoolFull || student.school}</p>
                          </div>
                        </div>
                        {student.major ? (
                          <div className="student-fact">
                            <span className="fact-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24">
                                <path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Z" />
                                <path d="M12 6.5v13" />
                              </svg>
                            </span>
                            <div className="fact-body">
                              <div className="fact-head">
                                <span className="fact-label">Ngành</span>
                              </div>
                              <p className="fact-value">{student.major}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
