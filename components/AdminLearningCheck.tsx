import { fetchSheetRows } from "@/lib/sheet-source";
import { getCourses } from "@/lib/sheet-data";
import { parsePaths } from "@/lib/learning-model";

export async function AdminLearningCheck(){
  const source=process.env.COURSES_SHEET_CSV_URL||process.env.RESOURCES_SHEET_CSV_URL;
  const pathSource=process.env.PATHS_SHEET_CSV_URL;
  const [courseRows,pathRows,courses]=await Promise.all([
    source?fetchSheetRows(source,"Courses"):[],pathSource?fetchSheetRows(pathSource,"Paths"):[],getCourses()
  ]);
  const notes:string[]=[];
  const header=courseRows[0]?.map(s=>s.trim().toLowerCase())||[];
  const start=header.findIndex(h=>["môn","course","môn học","khóa học"].includes(h));
  const block=start<0?[]:header.slice(start,header.indexOf("",start)<0?header.length:header.indexOf("",start));
  if(start<0)notes.push("Chưa tìm thấy khối Môn trong nguồn khóa học.");
  if(!block.some(h=>["title","tiêu đề","tên bài"].includes(h)))notes.push("Khối Môn thiếu cột Title.");
  if(!block.some(h=>["url","link","đường dẫn"].includes(h)))notes.push("Khối Môn thiếu cột URL.");
  if(pathSource){
    const columns=(pathRows[0]||[]).map(h=>h.trim().toLowerCase());
    for(const name of ["slug","title","course_slugs"])if(!columns.includes(name))notes.push(`Paths thiếu cột ${name}.`);
    const available=new Set(courses.map(c=>c.slug));
    pathRows.slice(1).forEach((row,i)=>{
      for(const ref of (row[columns.indexOf("course_slugs")]||"").split(/[|,]/).map(s=>s.trim()).filter(Boolean)){
        if(!available.has(ref))notes.push(`Paths dòng ${i+2}: không tìm thấy khóa ${ref}.`);
      }
    });
  }
  return <section className="container section"><h2>Kiểm tra dữ liệu học tập</h2>
    <p>{courses.length} khóa · {parsePaths(pathRows,courses).length} lộ trình hợp lệ.</p>
    {notes.length?<ul>{notes.slice(0,50).map((note,i)=><li key={i}>{note}</li>)}</ul>:<p>Các cột bắt buộc đã có.</p>}
    {!pathSource&&<p>Paths chưa cấu hình. Khóa học vẫn dùng nguồn hiện tại.</p>}
  </section>;
}
