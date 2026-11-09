import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LearningPathList } from "@/components/LearningPathList";
import { getCourses } from "@/lib/sheet-data";
import { getLearningPaths } from "@/lib/learning-paths";
import "../resources/courses/courses.css";

export const metadata={title:"Lộ trình học"};
export default async function Roadmap(){
  const courses=await getCourses();
  const paths=await getLearningPaths(courses);
  return <><Header/><main id="main" className="container section"><p className="learn-kicker">THƯ VIỆN HỌC TẬP CTIT</p><h1>Lộ trình học</h1><p>Học từng khóa theo thứ tự của lộ trình và theo dõi số bài đã hoàn thành.</p>
    {paths.length?<LearningPathList paths={paths} courses={courses}/>:<p>Chưa có lộ trình được công bố.</p>}
    <Link href="/resources/courses">Khám phá khóa học →</Link></main><Footer/></>;
}
