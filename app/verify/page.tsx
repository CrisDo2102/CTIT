import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PrintCertificate } from "@/components/PrintCertificate";
import { fetchSheetRows } from "@/lib/sheet-source";
import "./verify.css";

export const metadata={title:"Xác minh chứng nhận CTIT",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function Verify({searchParams}:{searchParams:Promise<{code?:string|string[]}>}){
  const input=(await searchParams).code;
  const code=typeof input==="string"?input.trim().toUpperCase().slice(0,64):"";
  const url=process.env.CERTIFICATES_SHEET_CSV_URL;
  const rows=code&&url?await fetchSheetRows(url,"Certificates"):[];
  const header=(rows[0]||[]).map(s=>s.trim().toLowerCase());
  const value=(row:string[],field:string)=>row[header.indexOf(field)]?.trim()||"";
  const matches=rows.slice(1).filter(row=>value(row,"code").toUpperCase()===code);
  const row=matches.length===1&&value(matches[0],"recipient")&&value(matches[0],"course")&&value(matches[0],"issued")?matches[0]:undefined;
  return <><Header/><main className="container section verify-course" id="main"><h1>Xác minh chứng nhận</h1>
    <form action="/verify"><label>Mã chứng nhận <input name="code" maxLength={64} required defaultValue={code}/></label><button className="btn">Tra cứu</button></form>
    {code&&(row?<article className="certificate"><small>C T I T</small><h2>Chứng nhận hoàn thành</h2><p>Closed Thinking Institute of Technology xác nhận</p><h3>{value(row,"recipient")}</h3><p>đã hoàn thành khóa <strong>{value(row,"course")}</strong>.</p><p>Ngày cấp · {value(row,"issued")}</p><code>{code}</code><p>Tra cứu tại /verify bằng mã trên.</p><PrintCertificate/></article>:<p role="status">Chưa xác minh được chứng nhận với mã này.</p>)}
  </main><Footer/></>;
}
