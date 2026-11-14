import { afterEach, expect, it, vi } from "vitest";

afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.restoreAllMocks();});

it("reads optional metadata only from the course block and preserves lesson identity",async()=>{
  const csv=[
    "level,,Môn,Title,URL,Description,Track,Group,code,level,duration_min,updated,status,requires_hardware,lesson_duration_min,,level",
    "Internal,,STM32,,,Lập trình board,,,MCU-02,basic,45,2026-11-01,pending,false,,,foreign",
    "Internal,,STM32,GPIO,https://example.com/gpio,LED,ARM,Chương 1,,,,,,,12,,foreign"
  ].join("\n");
  vi.stubEnv("COURSES_SHEET_CSV_URL","https://docs.google.com/spreadsheets/d/e/test/pub?output=csv");
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(csv)));
  const {getCourses}=await import("@/lib/sheet-data");
  const [course]=await getCourses();
  expect(course.slug).toBe("stm32");
  expect(course.info).toMatchObject({code:"MCU-02",level:"Cơ bản",minutes:45,hardware:false,pending:true});
  expect(course.tracks[0].lessons[0]).toMatchObject({title:"GPIO",group:"Chương 1",minutes:12});
});
