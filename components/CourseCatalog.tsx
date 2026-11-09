"use client";
import { LearningPathList } from "./LearningPathList";
import { CourseBadges } from "./CourseBadges";
import { topics, topicIds, type LearningPath } from "@/lib/learning-model";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Course } from "@/lib/dashboard-types";
import { SafeImage } from "@/components/SafeImage";
import { CourseCardProgress, LearningSummary } from "@/components/CourseProgressUI";
import { useDone,useStudyStreak } from "@/lib/saved";

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g,"d").toLowerCase();
const ids = (c: Course) => c.tracks.flatMap(t => t.lessons.flatMap((l,i) => l.url ? [`${c.slug}:${t.slug}:${i}`] : []));
const defaults = { q:"", subject:"", type:"", progress:"", topic:"",level:"",duration:"",language:"",hardware:"",sort:"sheet", view:"courses", page:1 };
type Filters = typeof defaults;
function readFilters(): Filters {
  const p = new URLSearchParams(location.search);
  return {topic:p.get("topic")||"",level:p.get("level")||"",duration:p.get("duration")||"",language:p.get("language")||"",hardware:p.get("hardware")||"",q:p.get("q") || "",subject:p.get("subject") || "",type:p.get("type") || "",progress:p.get("progress") || "",sort:p.get("sort") || "sheet",view:["courses","tracks","lessons","paths"].includes(p.get("view") || "") ? p.get("view")! : "courses",page:Math.max(1,Number(p.get("page")) || 1)};
}
function courseHref(c: Course, track?: string, lesson?: number) {
  const p = new URLSearchParams(); if(track) p.set("track",track); if(lesson!==undefined) p.set("lesson",String(lesson));
  return `/resources/courses/${c.slug}${p.size ? `?${p}` : ""}`;
}
export function CourseCatalog({ courses, paths, today }: {courses: Course[];paths:LearningPath[];today:string}) {
  const [f,setF] = useState(defaults);
  const {done} = useDone();
  const streak=useStudyStreak();
  useEffect(()=>{const sync=()=>setF(readFilters());sync();window.addEventListener("popstate",sync);return()=>window.removeEventListener("popstate",sync);},[]);
  const update = (patch: Partial<Filters>) => {
    const next={...f,...patch,page:patch.page ?? 1};setF(next);
    const p=new URLSearchParams(location.search);
    Object.entries(next).forEach(([k,v])=> {if(v===defaults[k as keyof Filters])p.delete(k);else p.set(k,String(v));});
    history.replaceState(null,"",`${location.pathname}${p.size?`?${p}`:""}${location.hash}`);
  };
  const types=[...new Set(courses.flatMap(c=>c.tracks.flatMap(t=>t.lessons.map(l=>l.type))).filter(Boolean))].sort();
  const progress=(c: Course)=>{const all=ids(c),n=all.filter(id=>done.has(id)).length;return !n?"new":n===all.length?"done":"learning";};
  const eligible = (c:Course) => {
    const m=c.info, minutes=m?.minutes;
    if(f.topic && !topicIds(c).some(id=>id===f.topic))return false;
    if(f.level && m?.level!==f.level)return false;
    if(f.language && m?.language!==f.language)return false;
    if(f.hardware && (m?.hardware===undefined || String(m.hardware)!==f.hardware))return false;
    if(f.duration && (minutes===undefined || (f.duration==="short"?minutes>=30:f.duration==="medium"?minutes<30||minutes>90:minutes<=90)))return false;
    return true;
  };
  const matches = (c:Course,text:string,typeList:string[]) => eligible(c)&&(!f.subject||f.subject===c.slug)&&(!f.type||typeList.includes(f.type))&&(!f.progress||progress(c)===f.progress)&&fold(text).includes(fold(f.q.trim()));
  const rows=useMemo(()=>{
    const result: {key:string;title:string;description:string;href:string;course:Course;meta:string;size:number}[]=[];
    if(f.view==="paths")return result;
    for(const c of courses){
      if(f.view==="courses"){
        if(matches(c,[c.title,c.description,...c.tracks.flatMap(t=>[t.name,...t.lessons.map(l=>l.title)])].join(" "),c.tracks.flatMap(t=>t.lessons.map(l=>l.type))))result.push({key:c.slug,title:c.title,description:c.description,href:courseHref(c),course:c,meta:`${c.lessonCount} bài · ${c.tracks.length} nhánh`,size:c.lessonCount});
      }else for(const t of c.tracks){
        if(f.view==="tracks"){
          if(matches(c,`${c.title} ${t.name} ${t.description}`,t.lessons.map(l=>l.type)))result.push({key:`${c.slug}:${t.slug}`,title:t.name||c.title,description:t.description||c.description,href:courseHref(c,t.slug),course:c,meta:`${c.title} · ${t.lessons.length} bài`,size:t.lessons.length});
        }else t.lessons.forEach((l,i)=>{if(matches(c,`${c.title} ${t.name} ${l.title} ${l.description} ${l.group}`,[l.type]))result.push({key:`${c.slug}:${t.slug}:${i}`,title:l.title,description:l.description,href:courseHref(c,t.slug,i),course:c,meta:`${c.title} · ${t.name||"Nội dung chung"} · ${l.url?l.type||"Tài liệu":"Sắp có"}`,size:i});});
      }
    }
    if(f.sort==="az")result.sort((a,b)=>a.title.localeCompare(b.title,"vi"));
    if(f.sort==="few")result.sort((a,b)=>a.size-b.size);
    if(f.sort==="updated")result.sort((a,b)=>(b.course.info?.updated||"").localeCompare(a.course.info?.updated||""));
    if(f.sort==="shortest")result.sort((a,b)=>(a.course.info?.minutes??Infinity)-(b.course.info?.minutes??Infinity));
    if(f.sort==="popular")result.sort((a,b)=>(b.course.info?.popularity??-1)-(a.course.info?.popularity??-1));
    return result;
  // done is the shared, stable progress snapshot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[courses,f,done]);
  const pathRows=paths.filter(path=>{
    const members=courses.filter(c=>path.courses.includes(c.slug));
    return fold([path.title,path.summary,...members.map(c=>c.title)].join(" ")).includes(fold(f.q.trim()))
      &&members.some(c=>eligible(c)&&(!f.subject||c.slug===f.subject)&&(!f.progress||progress(c)===f.progress)&&(!f.type||c.tracks.some(t=>t.lessons.some(l=>l.type===f.type))));
  });
  if(f.sort==="az")pathRows.sort((a,b)=>a.title.localeCompare(b.title,"vi"));
  const total=f.view==="paths"?pathRows.length:rows.length;
  const latest=courses.filter(c=>c.info?.updated && c.info.updated<=today).sort((a,b)=>b.info!.updated!.localeCompare(a.info!.updated!)).slice(0,4);
  const pages=Math.max(1,Math.ceil(total/12)),page=Math.min(pages,Math.floor(f.page));
  const ongoing=courses.filter(c=>progress(c)==="learning");
  return <div className="learning-catalog">
    {streak>0&&<p className="learn-kicker">Chuỗi học tập · {streak} ngày liên tiếp</p>}
    <LearningSummary courses={courses.map(c=>({slug:c.slug,title:c.title,ids:ids(c)}))}/>
    {ongoing.length>0&&<section className="learn-continue"><h2>Tiếp tục học</h2><div>{ongoing.map(c=>{const target=c.tracks.flatMap(t=>t.lessons.map((l,i)=>({l,t,i}))).find(({l,t,i})=>l.url&&!done.has(`${c.slug}:${t.slug}:${i}`));return <Link key={c.slug} href={courseHref(c,target?.t.slug,target?.i)}><strong>{c.title}</strong><span>{target?.l.title}</span><CourseCardProgress ids={ids(c)}/></Link>;})}</div></section>}
    {latest.length>0&&<section className="learn-feature"><h2>Mới cập nhật</h2><div>{latest.map(c=><Link key={c.slug} href={courseHref(c)}><strong>{c.title}</strong><CourseBadges info={c.info} today={today}/></Link>)}</div></section>}
    {paths.length>0&&<section className="learn-feature"><h2>Lộ trình đề xuất</h2><div>{paths.slice(0,3).map(path=><Link href={`/roadmap#${path.slug}`} key={path.slug}><small>{path.courses.length} khóa học</small><strong>{path.title}</strong><span>{path.summary}</span></Link>)}</div><Link href="/roadmap">Tất cả lộ trình →</Link></section>}
    <section className="learn-directory"><div className="learn-heading"><div><p className="learn-kicker">THƯ VIỆN HỌC TẬP CTIT</p><h2>Chọn điều bạn muốn khám phá</h2></div><p>Học theo môn, chọn nhánh và đi từng bài theo thứ tự.</p></div>
      <div className="learn-subjects">{topics.map(([id,label,description,icon])=>{
        const count=courses.filter(c=>topicIds(c).some(key=>key===id)).length;
        return <button key={id} className={f.topic===id?"selected":""} aria-pressed={f.topic===id} onClick={()=>update({topic:f.topic===id?"":id})}><i aria-hidden="true">{icon}</i><strong>{label}</strong><span>{description}</span><small>{count} khóa</small></button>;
      })}</div>
    </section>
    <section className="learn-browser" aria-label="Tìm khóa học">
      <div className="learn-switch" role="group" aria-label="Loại kết quả">{[["paths","Lộ trình"],["courses","Khóa học"],["tracks","Nhánh học"],["lessons","Bài học"]].map(([value,label])=><button key={value} aria-pressed={f.view===value} className={f.view===value?"selected":""} onClick={()=>update({view:value,sort:"sheet"})}>{label}</button>)}</div>
      <div className="learn-filters"><label className="learn-search">Tìm kiếm<input type="search" value={f.q} onChange={e=>update({q:e.target.value})} placeholder="Tên môn, nhánh hoặc bài học…"/></label><label>Định dạng<select value={f.type} onChange={e=>update({type:e.target.value})}><option value="">Tất cả</option>{types.map(t=><option key={t}>{t}</option>)}</select></label><label>Tiến độ khóa<select value={f.progress} onChange={e=>update({progress:e.target.value})}><option value="">Tất cả</option><option value="new">Chưa bắt đầu</option><option value="learning">Đang học</option><option value="done">Hoàn thành</option></select></label><label>Môn<select value={f.subject} onChange={e=>update({subject:e.target.value})}><option value="">Tất cả</option>{courses.map(c=><option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label>
      <label>Mức độ<select value={f.level} onChange={e=>update({level:e.target.value})}><option value="">Tất cả</option>{["Cơ bản","Trung bình","Nâng cao"].map(l=><option key={l}>{l}</option>)}</select></label>
      <label>Thời lượng<select value={f.duration} onChange={e=>update({duration:e.target.value})}><option value="">Tất cả</option><option value="short">Dưới 30 phút</option><option value="medium">30–90 phút</option><option value="long">Trên 90 phút</option></select></label>
      <label>Ngôn ngữ<select value={f.language} onChange={e=>update({language:e.target.value})}><option value="">Tất cả</option>{[...new Set(courses.flatMap(c=>c.info?.language?[c.info.language]:[]))].sort().map(l=><option key={l}>{l}</option>)}</select></label>
      <label>Phần cứng<select value={f.hardware} onChange={e=>update({hardware:e.target.value})}><option value="">Tất cả</option><option value="true">Cần phần cứng</option><option value="false">Không cần phần cứng</option></select></label>
      <label>Sắp xếp<select value={f.sort} onChange={e=>update({sort:e.target.value})}><option value="sheet">Thứ tự đề cương</option><option value="az">Tên A–Z</option>{f.view!=="paths"&&<><option value="updated">Mới nhất</option><option value="shortest">Ngắn nhất</option><option value="popular">Phổ biến</option></>}{f.view!=="lessons"&&f.view!=="paths"&&<option value="few">Ít bài nhất</option>}</select></label></div>
      <div className="learn-result-bar"><span role="status">{total} kết quả{f.subject?` · ${courses.find(c=>c.slug===f.subject)?.title||f.subject}`:""}</span><button onClick={()=>update({...defaults,view:f.view})}>Xóa bộ lọc</button></div>
      {!total?<p className="course-empty">Không có kết quả phù hợp. Thử từ khóa khác hoặc xóa bộ lọc.</p>:f.view==="paths"?<LearningPathList paths={pathRows.slice((page-1)*12,page*12)} courses={courses}/>:<div className={`courses-grid ${f.view==="lessons"?"learn-lesson-results":""}`}>{rows.slice((page-1)*12,page*12).map(r=><Link key={r.key} href={r.href} className="course-card">{f.view!=="lessons"&&<div className="course-cover"><SafeImage src={r.course.image} alt="" loading="lazy" fallback={<span className="course-cover-mark">{r.title.slice(0,2)}</span>}/></div>}<div className="course-body"><small className="learn-card-meta">{r.meta}</small><h3>{r.title}</h3>{f.view==="courses"&&<CourseBadges info={r.course.info} today={today}/>}{r.description&&<p>{r.description}</p>}{f.view==="courses"&&<div className="course-tracks">{r.course.tracks.filter(t=>t.name).map(t=><span className="course-track-chip" key={t.slug}>{t.name}</span>)}</div>}<CourseCardProgress ids={f.view==="lessons"?[r.key]:ids(r.course)}/><span className="learn-card-link">{f.view==="lessons"?"Mở bài học":"Xem nội dung"} →</span></div></Link>)}</div>}
      {pages>1&&<nav className="learn-pagination" aria-label="Phân trang"><button disabled={page<=1} onClick={()=>update({page:page-1})}>← Trước</button><span>Trang {page} / {pages}</span><button disabled={page>=pages} onClick={()=>update({page:page+1})}>Sau →</button></nav>}
    </section><p className="learn-storage-note">Tiến độ lưu trên trình duyệt này. Xóa dữ liệu trình duyệt sẽ xóa tiến độ đã lưu.</p>
  </div>;
}
