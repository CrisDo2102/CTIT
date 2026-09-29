"use client";

import { useEffect, useMemo, useState } from "react";
import type { Resource, ResourceType } from "@/data/resources";
import { fallbackResources, resourceTypes } from "@/data/resources";

const STORAGE_KEY = "embedded-link-library-resources-v2";

const emptyForm = {
  title: "",
  description: "",
  url: "",
  type: "PDF" as ResourceType,
  topic: "Embedded",
  level: "Core",
  source: "Custom"
};

export function LocalResourceStudio() {
  const [customResources, setCustomResources] = useState<Resource[]>([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setCustomResources(JSON.parse(raw));
      } catch {
        setCustomResources([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customResources));
  }, [customResources]);

  const resources = useMemo(() => {
    return [...customResources, ...fallbackResources];
  }, [customResources]);

  function addResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.url.trim()) {
      return;
    }

    const item: Resource = {
      id: `custom-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim() || "Tài liệu do admin thêm.",
      url: form.url.trim(),
      type: form.type,
      topic: form.topic.trim() || "Embedded",
      level: form.level.trim() || "Core",
      source: form.source.trim() || "Custom",
      featured: true
    };

    setCustomResources((current) => [item, ...current]);
    setForm(emptyForm);
  }

  function removeResource(id: string) {
    setCustomResources((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="grid two">
      <section className="card form-card">
        <span className="type">Admin input</span>
        <h3>Thêm link tài liệu</h3>
        <p>
          Bản này lưu bằng localStorage để chạy ngay. Khi nối database, form này sẽ
          ghi vào Supabase hoặc server riêng.
        </p>

        <form className="form-grid" onSubmit={addResource}>
          <input
            className="input"
            placeholder="Tên tài liệu"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />

          <input
            className="input"
            placeholder="Link Google Drive, GitHub, YouTube, PDF..."
            value={form.url}
            onChange={(event) => setForm({ ...form, url: event.target.value })}
          />

          <textarea
            className="textarea"
            placeholder="Mô tả ngắn"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />

          <select
            className="select"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value as ResourceType })}
          >
            {resourceTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <div className="form-grid two-fields">
            <input
              className="input"
              placeholder="Chủ đề: AVR, STM32, CAN, BMS..."
              value={form.topic}
              onChange={(event) => setForm({ ...form, topic: event.target.value })}
            />

            <input
              className="input"
              placeholder="Nguồn: GitHub, Drive, Microchip..."
              value={form.source}
              onChange={(event) => setForm({ ...form, source: event.target.value })}
            />
          </div>

          <button className="btn" type="submit">
            Thêm link
          </button>
        </form>
      </section>

      <section className="card">
        <span className="type">Library state</span>
        <h3>Link đang có</h3>
        <p>
          Link admin thêm sẽ xuất hiện ở Resources trên cùng trình duyệt này.
          Muốn mọi người cùng thấy trên nhiều máy thì bước sau nối database.
        </p>

        <div className="resource-list">
          {resources.map((resource) => (
            <div className="resource-row" key={resource.id}>
              <div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="meta">
                  <span>{resource.type}</span>
                  <span>{resource.topic}</span>
                  <span>{resource.source}</span>
                </div>
              </div>

              <div className="row-actions">
                <a className="btn secondary" href={resource.url} target="_blank" rel="noreferrer">
                  Mở
                </a>
                {resource.id.startsWith("custom-") ? (
                  <button className="btn ghost" type="button" onClick={() => removeResource(resource.id)}>
                    Xóa
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
