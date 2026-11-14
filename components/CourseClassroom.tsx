"use client";
import { LessonPlayer } from "./LessonPlayer";
import { LessonQuiz } from "./LessonQuiz";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Course, CourseTrack } from "@/lib/dashboard-types";
import { useDone } from "@/lib/saved";
import { CourseProgress, LessonDone } from "@/components/LessonDone";
import { TrackTools } from "@/components/CourseProgressUI";
import { lessonEmbed } from "@/lib/course-media";
import { CourseHardware, type CoursePart } from "@/components/CourseHardware";
import { contact } from "@/lib/site-config";

export function CourseClassroom({course,track,initialLesson,parts}:{course:Course;track:CourseTrack;initialLesson?:number;parts:CoursePart[]|null}){
 const clamp=(n:number)=>Math.max(0,Math.min(track.lessons.length-1,Number.isFinite(n)?Math.floor(n):0));
 const [selected,setSelected]=useState(clamp(initialLesson??0));
 const [tab,setTab]=useState("lesson");const [play,setPlay]=useState(false);const [query,setQuery]=useState("");
 const titleRef=useRef<HTMLHeadingElement>(null);
 const {done}=useDone();const key=`ctit-last-lesson:${course.slug}:${track.slug}`;
 const ids=track.lessons.flatMap((l,i)=>l.url?[`${course.slug}:${track.slug}:${i}`]:[]);
 useEffect(()=>{
   if(initialLesson===undefined){try{const raw=localStorage.getItem(key);if(raw!==null)setSelected(clamp(Number(raw)));}catch{}}
   const back=()=>{setSelected(clamp(Number(new URLSearchParams(location.search).get("lesson")||0)));setPlay(false);};
   window.addEventListener("popstate",back);return()=>window.removeEventListener("popstate",back);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key,initialLesson]);
 const select=(i:number)=>{const n=clamp(i);setSelected(n);setPlay(false);setTab("lesson");try{localStorage.setItem(key,String(n));}catch{}const p=new URLSearchParams(location.search);p.set("track",track.slug);p.set("lesson",String(n));history.pushState(null,"",`${location.pathname}?${p}`);titleRef.current?.focus();};
 const lesson=track.lessons[selected];if(!lesson)return <p className="course-empty">Nhánh này chưa có bài học.</p>;
 const embed=lessonEmbed(lesson.url);
 const simulation=lesson.url.match(/^https:\/\/wokwi\.com\/projects\/(\d+)\/?(?:[?#].*)?$/)?.[1];const id=`${course.slug}:${track.slug}:${selected}`;
 const resources=track.lessons.map((l,i)=>({l,i})).filter(({l})=>l.url&&!/video/i.test(l.type));
 const found=track.lessons.map((l,i)=>({l,i})).filter(({l})=>`${l.title} ${l.group}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));
 return <div className="classroom">
  <aside className="classroom-sidebar" aria-label="Đề cương khóa học"><div className="classroom-sidebar-head"><p className="learn-kicker">NỘI DUNG KHÓA HỌC</p><h2>{track.name||course.title}</h2><CourseProgress ids={ids}/><label>Tìm trong đề cương<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tên bài hoặc chương…"/></label></div>
   <nav className="classroom-list" aria-label="Chọn bài học">{found.map(({l,i},n)=><div key={i}>{l.group&&(n===0||found[n-1].l.group!==l.group)&&<h3>{l.group}</h3>}<button className={selected===i?"selected":""} aria-current={selected===i?"step":undefined} onClick={()=>select(i)}><span className="classroom-number">{done.has(`${course.slug}:${track.slug}:${i}`)?"✓":String(i+1).padStart(2,"0")}</span><span><strong>{l.title}</strong><small>{l.url?l.type||"Tài liệu":"Sắp có"}{l.minutes ? ` · ${l.minutes} phút` : ""}</small></span></button></div>)}</nav>{!found.length&&<p>Không tìm thấy bài học.</p>}
  </aside>
  <div className="classroom-main">
    <div className="classroom-tabs" role="group" aria-label="Thông tin khóa học">{[["lesson","Bài học"],["overview","Tổng quan"],["resources","Tài liệu"],["hardware","Vật tư"],["help","Hỗ trợ"]].map(([value,label])=><button key={value} className={tab===value?"selected":""} aria-pressed={tab===value} onClick={()=>setTab(value)}>{label}</button>)}</div>
    <section className="classroom-panel">
      <p className="learn-card-meta">{track.name||course.title} · Bài {selected+1}/{track.lessons.length}</p>
      <h2 ref={titleRef} tabIndex={-1}>{lesson.title}</h2>
      {tab==="lesson"&&<>
        {lesson.description&&<p className="classroom-description">{lesson.description}</p>}
        {embed?<LessonPlayer key={embed} embed={embed} title={lesson.title}/>:<div className="classroom-resource"><span>{lesson.url?lesson.type||"Tài liệu":"ĐANG CHUẨN BỊ"}</span><h3>{lesson.url?"Mở nội dung để bắt đầu học":"Bài học sắp có"}</h3><p>{lesson.url?"Nội dung được mở từ nguồn của bài học. Bạn có thể quay lại đây để đánh dấu tiến độ và chuyển bài.":"Nội dung sẽ xuất hiện khi liên kết được cập nhật."}</p></div>}
        {simulation&&<div className="course-lab">{play?<iframe title={lesson.title} src={`https://wokwi.com/projects/${simulation}?embed=1`} loading="lazy" allowFullScreen/>:<button className="btn" onClick={()=>setPlay(true)}>Mở mô phỏng Wokwi</button>}</div>}
        {lesson.url&&<div className="classroom-source"><a href={lesson.url} target="_blank" rel="noopener noreferrer">Mở nguồn bài học ↗</a><span>Nếu video không phát, hãy mở nguồn trực tiếp.</span></div>}
      </>}
      {tab==="lesson" && lesson.quiz && <LessonQuiz key={id} questions={lesson.quiz}/>}
      {tab==="overview"&&<div className="classroom-overview"><h3>Về khóa học</h3><p>{course.description||"Chọn nhánh phù hợp và học lần lượt theo đề cương."}</p>{track.description&&<p>{track.description}</p>}<dl><div><dt>Tổng số bài</dt><dd>{course.lessonCount}</dd></div><div><dt>Nhánh học</dt><dd>{course.tracks.length}</dd></div><div><dt>Có thể học trong nhánh này</dt><dd>{ids.length}/{track.lessons.length} bài</dd></div></dl><TrackTools ids={ids}/><Link href="/verify">Tra cứu chứng nhận đã cấp →</Link></div>}
      {tab==="resources"&&<div className="classroom-materials"><h3>Tài liệu trong nhánh</h3>{resources.length?resources.map(({l,i})=><a key={i} href={l.url} target="_blank" rel="noopener noreferrer"><strong>{l.title}</strong><span>{l.type||"Tài liệu"} ↗</span></a>):<p>Nhánh này chưa có tài liệu riêng. Kiểm tra mô tả từng bài hoặc thư viện tài liệu.</p>}<Link href="/resources/documents">Mở thư viện tài liệu →</Link></div>}
      {tab==="hardware" && <CourseHardware parts={parts} course={course.title} track={track.name} />}
      {tab==="help"&&<div className="classroom-resource"><h3>Cần hỗ trợ bài học?</h3><p>Gửi tên khóa, nhánh và tên bài để CTIT có thể hỗ trợ đúng nội dung.</p><a className="btn" href={`mailto:${contact.email}?subject=${encodeURIComponent(`Hỏi về ${course.title} — ${lesson.title}`)}`}>Gửi câu hỏi</a></div>}
    </section>
    <div className="classroom-bottom"><button disabled={selected===0} onClick={()=>select(selected-1)}>← Bài trước</button>{lesson.url&&<div className="classroom-done"><LessonDone id={id} title={lesson.title}/><span>{done.has(id)?"Đã học":"Đánh dấu đã học"}</span></div>}<button disabled={selected===track.lessons.length-1} onClick={()=>select(selected+1)}>Bài tiếp theo →</button></div>
    <p className="learn-storage-note">Tiến độ và bài xem gần nhất được lưu trên trình duyệt này. Video YouTube hỗ trợ tiếp tục ở mốc đã lưu trên thiết bị này.</p>
  </div>
 </div>;
}
