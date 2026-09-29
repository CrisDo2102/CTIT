"use client";

import Link from "next/link";
import { useState } from "react";
import { guides } from "@/lib/admin-guide";

type Props = {
  csv: Record<string, string>; // key -> link CSV (doc tu .env.local o server)
  editUrl: string; // SHEET_EDIT_URL, "" neu chua co
};

export function AdminGuide({ csv, editUrl }: Props) {
  const [key, setKey] = useState("campus");
  const [copied, setCopied] = useState("");
  const guide = guides.find((g) => g.key === key) ?? guides[0];
  const csvUrl = csv[guide.key] ?? "";
  const header = guide.sample[0];

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* trinh duyet chan clipboard: bo qua */
    }
  };

  return (
    <div className="container">
      <div className="type-chips" role="tablist" aria-label="Chọn trang / tab Google Sheet">
        {guides.map((g) => (
          <button key={g.key} type="button" role="tab" aria-selected={g.key === key} className={`chip ${g.key === key ? "is-active" : ""}`} onClick={() => setKey(g.key)}>
            {g.label}
          </button>
        ))}
      </div>

      <section className="card guide-links">
        <div className="guide-links-row">
          <span className="type">Tab {guide.tab}</span>
          <Link className="chip" href={guide.path}>Xem trang {guide.path} ↗</Link>
          {editUrl ? <a className="chip" href={editUrl} target="_blank" rel="noreferrer">Mở Google Sheet ↗</a> : null}
          {csvUrl ? (
            <>
              <a className="chip" href={csvUrl} target="_blank" rel="noreferrer">Mở CSV ↗</a>
              <button type="button" className="chip" onClick={() => copy("csv", csvUrl)}>{copied === "csv" ? "Đã copy ✓" : "Copy link CSV"}</button>
            </>
          ) : null}
        </div>
        {csvUrl ? (
          <code className="guide-url">{csvUrl}</code>
        ) : (
          <p className="guide-warn">Chưa có link CSV. Thêm <code>{guide.env}=…</code> vào <code>.env.local</code> rồi chạy lại <code>npm run dev</code>.</p>
        )}
        {guide.note ? <p className="guide-note">{guide.note}</p> : null}
      </section>

      <div className="grid two guide-body">
        <section className="card form-card">
          <span className="type">Cách thêm dữ liệu · tab {guide.tab}</span>
          <h3>3 bước</h3>
          <ol className="guide-steps">
            <li>Mở Google Sheet, qua tab <strong>{guide.tab}</strong> (chưa có thì tạo tab mới đặt đúng tên đó).</li>
            <li>Dòng 1 là header đúng tên cột bên cạnh{header ? <> (bấm <em>Copy header</em> rồi dán vào ô A1)</> : null}. Mỗi dòng bên dưới là 1 mục.</li>
            <li>Sheet đã publish + tick &quot;Automatically republish&quot; thì trang <code>{guide.path}</code> tự cập nhật (<code>npm run dev</code> luôn lấy dữ liệu mới, chạy thật cache 60 giây).</li>
          </ol>
          <p>
            Lần đầu: File → Share → Publish to web → chọn đúng tab <strong>{guide.tab}</strong> → CSV → Publish, dán link vào <code>{guide.env}</code> trong <code>.env.local</code>, rồi tắt và chạy lại <code>npm run dev</code>.
          </p>
          {guide.imageFolder ? <p>Ảnh để trong: <code>{guide.imageFolder}</code></p> : null}
          {guide.rules.length > 0 ? (
            <ul className="guide-rules">
              {guide.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          ) : null}
        </section>

        <section className="card">
          <div className="guide-head">
            <div>
              <span className="type">Cấu trúc cột tab {guide.tab}</span>
              <h3>{guide.columns.length > 0 ? guide.columnsHeading ?? `${guide.columns.length} cột` : "Chưa định nghĩa"}</h3>
            </div>
            {header ? (
              <button type="button" className="chip" onClick={() => copy("header", header.join("\t"))}>
                {copied === "header" ? "Đã copy ✓" : "Copy header"}
              </button>
            ) : null}
          </div>
          {guide.columns.length > 0 ? (
            <div className="guide-cols">
              {guide.columns.map((column) => (
                <div className="guide-col" key={column.name}>
                  <div>
                    <h4>{column.name}</h4>
                    <p>{column.desc}</p>
                  </div>
                  <span className="type">{column.required ? "Bắt buộc" : "Tuỳ chọn"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="guide-note">Tab này chưa có cấu trúc cột. Khi dev xong, bảng cột sẽ hiện ở đây.</p>
          )}
          {header ? (
            <>
              <span className="type guide-sample-label">Ví dụ (dán được thẳng vào Sheets)</span>
              <pre className="guide-sample">{guide.sample.map((row) => row.join("\t")).join("\n")}</pre>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
