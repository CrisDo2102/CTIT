import type { Course } from "@/lib/dashboard-types";

export const topics = [
  ["electronics","Nền tảng điện tử","Đọc sơ đồ, hiểu linh kiện và tín hiệu.","∿","điện tử|electronics"],
  ["c","C cho nhúng","Viết chương trình C cho hệ thống nhúng.","{ }","lập trình c|ngôn ngữ c|embedded c"],
  ["mcu","STM32 / ARM Cortex-M","Làm việc với lõi xử lý và ngoại vi.","µ","stm32|cortex|vi điều khiển"],
  ["bus","Giao tiếp","Trao đổi dữ liệu qua UART, SPI, I²C và CAN.","⇄","uart|spi|i2c|i²c|can bus|giao tiếp"],
  ["rtos","RTOS","Lập lịch và phối hợp tác vụ thời gian thực.","τ","rtos|thời gian thực"],
  ["analog","Cảm biến & Analog","Đo tín hiệu và xử lý dữ liệu cảm biến.","≈","cảm biến|analog|sensor"],
  ["motor","Điều khiển động cơ","Điều khiển chuyển động và truyền động điện.","↻","động cơ|motor"],
  ["power","Nguồn & BMS","Quản lý năng lượng và giám sát bộ pin.","±","bms|nguồn|quản lý pin"],
  ["pcb","PCB","Thiết kế, đi dây và kiểm tra bo mạch.","▦","pcb|bo mạch"],
  ["tools","Công cụ","Khám phá IDE, KiCad và quản lý mã nguồn.","⌘","kicad|git|cubeide|công cụ"]
] as const;

export type CourseInfo = {
  code?: string; level?: string; language?: string; updated?: string;
  minutes?: number; hardware?: boolean; pending?: boolean; category?: string;
  popularity?: number; stars?: number; votes?: number; teacher?: string;
  outcomes?: string; prerequisites?: string;
};
export type LearningPath = {slug:string; title:string; summary:string; courses:string[]};

export function topicIds(course: Course) {
  const text = (course.info?.category || [course.title, ...course.tracks.map(t=>t.name)].join(" ")).toLocaleLowerCase("vi");
  return topics.filter(([id,label,,,terms])=>text===id||text===label.toLocaleLowerCase("vi")||terms.split("|").some(word=>text.includes(word))).map(t=>t[0]);
}

export function readInfo(get:(key:string)=>string): CourseInfo {
  const num=(k:string,max=Infinity)=>{
    const value=get(k); if(!value)return undefined;
    const n=Number(value.replace(",","."));
    return Number.isFinite(n)&&n>=0&&n<=max?n:undefined;
  };
  const date=get("updated");
  const validDate=/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date;
  const hw=get("requires_hardware").toLowerCase();
  const levels: Record<string,string>={basic:"Cơ bản",intermediate:"Trung bình",advanced:"Nâng cao","cơ bản":"Cơ bản","trung bình":"Trung bình","nâng cao":"Nâng cao"};
  return {code:get("code")||undefined,level:levels[get("level").toLowerCase()],language:get("language")||undefined,
    updated:validDate?date:undefined,minutes:num("duration_min"),hardware:["true","1","có"].includes(hw)?true:["false","0","không"].includes(hw)?false:undefined,
    pending:["cần cập nhật","update pending","pending"].includes(get("status").toLowerCase()),category:get("category")||undefined,
    popularity:num("views"),stars:num("rating",5),votes:num("rating_count"),teacher:get("instructor")||undefined,outcomes:get("outcomes")||undefined,prerequisites:get("prerequisites")||undefined};
}

export function parsePaths(rows:string[][], courses:Course[]) {
  const [header=[],...body]=rows;
  const columns=header.map(h=>h.trim().toLowerCase());
  const values=(row:string[],key:string)=>row[columns.indexOf(key)]?.trim()||"";
  const allowed=new Set(courses.map(c=>c.slug)), seen=new Set<string>();
  const paths: LearningPath[]=[];
  for(const row of body){
    const slug=values(row,"slug"), title=values(row,"title");
    const members=[...new Set(values(row,"course_slugs").split(/[|,]/).map(s=>s.trim()).filter(s=>allowed.has(s)))];
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||seen.has(slug)||!title||!members.length)continue;
    seen.add(slug);paths.push({slug,title,summary:values(row,"summary"),courses:members});
  }
  return paths;
}
export function recent(date:string|undefined,today:string){
  if(!date)return false;
  const age=(Date.parse(today)-Date.parse(date))/86400000;
  return age>=0&&age<14;
}

export type QuizQuestion = {question:string; options:string[]; answer:number; explanation?:string};

export function parseQuiz(value:string):QuizQuestion[] | undefined {
  if(!value || value.length>24000)return;
  try {
    const rows:unknown=JSON.parse(value);
    if(!Array.isArray(rows)||rows.length<3||rows.length>5)return;
    const valid=rows.every(q=>q && typeof q.question==="string" && q.question.trim() &&
      Array.isArray(q.options) && q.options.length>=2 && q.options.length<=5 &&
      q.options.every((v:unknown)=>typeof v==="string" && v.trim()) &&
      Number.isInteger(q.answer) && q.answer>=0 && q.answer<q.options.length &&
      (q.explanation===undefined||typeof q.explanation==="string"));
    return valid?rows:undefined;
  } catch {return;}
}
