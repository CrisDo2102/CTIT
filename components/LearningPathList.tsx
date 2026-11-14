"use client";
import Link from "next/link";
import type { Course } from "@/lib/dashboard-types";
import type { LearningPath } from "@/lib/learning-model";
import { useDone } from "@/lib/saved";

export function LearningPathList({paths,courses}:{paths:LearningPath[];courses:Course[]}) {
  const {done}=useDone();
  return <div className="path-grid">{paths.map(path=>{
    const members=path.courses.flatMap(slug=>courses.filter(c=>c.slug===slug));
    const ids=members.flatMap(c=>c.tracks.flatMap(t=>t.lessons.flatMap((l,i)=>l.url?[`${c.slug}:${t.slug}:${i}`]:[])));
    const count=ids.filter(id=>done.has(id)).length;
    return <article id={path.slug} key={path.slug} className="path-card">
      <small>LỘ TRÌNH · {members.length} KHÓA</small><h3>{path.title}</h3><p>{path.summary}</p>
      <ol>{members.map(c=><li key={c.slug}><Link href={`/resources/courses/${c.slug}`}>{c.title}</Link></li>)}</ol>
      {ids.length>0&&<><progress value={count} max={ids.length} aria-label="Tiến độ lộ trình"/><span>Đã học {count}/{ids.length} bài · {Math.round(count*100/ids.length)}%</span></>}
    </article>;
  })}</div>;
}
