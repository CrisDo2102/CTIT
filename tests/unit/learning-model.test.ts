import { describe, expect, it } from "vitest";
import { parsePaths, readInfo,recent,parseQuiz } from "../../lib/learning-model";
import { studyStreak } from "../../lib/study-days";
import type { Course } from "../../lib/dashboard-types";

describe("Learning data",()=>{
  it("keeps path order and includes existing slugs only once",()=>{
    const courses=["a","b"].map(slug=>({slug,title:slug,description:"",image:"",lessonCount:0,tracks:[]} satisfies Course));
    const rows=[["title","course_slugs","slug"],["Nhúng","b|unknown|a|b","nhung"]];
    expect(parsePaths(rows,courses)[0].courses).toEqual(["b","a"]);
  });
  it("distinguishes an empty hardware cell from false",()=>{
    expect(readInfo(()=> "").hardware).toBeUndefined();
    expect(readInfo(key=> key==="requires_hardware"?"không":"").hardware).toBe(false);
  });
  it("uses a fourteen-day window and excludes future dates",()=>{
    expect(recent("2026-10-20","2026-11-02")).toBe(true);
    expect(recent("2026-10-19","2026-11-02")).toBe(false);
    expect(recent("2026-11-03","2026-11-02")).toBe(false);
  });
  it("rejects invalid quizzes without breaking the lesson",()=>{
    expect(parseQuiz("broken")).toBeUndefined();
    const q={question:"Q",options:["A","B"],answer:0};
    expect(parseQuiz(JSON.stringify([q,q,q]))).toHaveLength(3);
    expect(parseQuiz(JSON.stringify([q,q,{...q,answer:3}]))).toBeUndefined();
  });
  it("counts consecutive learning days over a month boundary",()=>{
    expect(studyStreak(["2026-10-31","2026-11-01"],"2026-11-02")).toBe(2);
    expect(studyStreak(["2026-10-30"],"2026-11-02")).toBe(0);
  });
});
