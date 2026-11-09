import type { Course } from "./dashboard-types";
import { parsePaths, topicIds, type LearningPath } from "./learning-model";
import { fetchSheetRows } from "./sheet-source";

/** Editorial sequences select from the current catalog when no Paths tab is configured. */
export function suggestedPaths(courses:Course[]):LearningPath[] {
  const themes=[
    {slug:"nen-tang-he-nhung",title:"Từ nền tảng tới hệ nhúng",summary:"Bắt đầu với điện tử và C, tiếp tục với vi điều khiển và giao tiếp.",order:["electronics","c","mcu","bus","rtos"]},
    {slug:"dieu-khien-va-nang-luong",title:"Đo lường và điều khiển",summary:"Đi từ cảm biến tới điều khiển động cơ và quản lý năng lượng.",order:["analog","motor","power"]},
    {slug:"thiet-ke-bo-mach",title:"Thiết kế bo mạch",summary:"Từ nền tảng điện tử tới công cụ thiết kế và PCB.",order:["electronics","tools","pcb"]}
  ];
  return themes.flatMap(({order,...theme})=>{
    const members=[...new Set(order.flatMap(id=>courses.filter(c=>topicIds(c).some(key=>key===id)).map(c=>c.slug)))];
    return members.length>=2?[{...theme,courses:members}]:[];
  });
}
export async function getLearningPaths(courses:Course[]){
  const url=process.env.PATHS_SHEET_CSV_URL;
  return url ? parsePaths(await fetchSheetRows(url,"Paths"),courses) : suggestedPaths(courses);
}
