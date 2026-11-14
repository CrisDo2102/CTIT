import { recent, type CourseInfo } from "@/lib/learning-model";

export function CourseBadges({info,today}:{info?:CourseInfo;today:string}) {
  if(!info)return null;
  const level=info.level?["Cơ bản","Trung bình","Nâng cao"].indexOf(info.level)+1:0;
  return <div className="course-badges">
    {info.code&&<code>{info.code}</code>}{recent(info.updated,today)&&<b>Mới</b>}
    {info.pending&&<strong>Cần cập nhật</strong>}
    {level>0&&<span><i aria-hidden="true">{"▮".repeat(level)}{"▯".repeat(3-level)}</i> {info.level}</span>}
    {info.minutes!==undefined&&<span>{info.minutes} phút</span>}
    {info.language&&<span>{info.language}</span>}
    {info.updated&&<time dateTime={info.updated}>Cập nhật {info.updated.split("-").reverse().join("/")}</time>}
    {info.stars!==undefined&&info.votes!==undefined&&info.votes>=5&&<span>★ {info.stars.toFixed(1)} ({info.votes} lượt)</span>}
  </div>;
}
