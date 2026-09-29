"use client";

import { useState, useTransition } from "react";
import type { Resource, ResourceInput } from "@/lib/types";

const emptyForm: ResourceInput = {
  title: "",
  description: "",
  url: "",
  type: "PDF",
  topic: "Embedded",
  level: "Core",
  source: "Google Drive",
  is_featured: false
};

const typeOptions = ["Datasheet", "PDF", "Code", "Video", "Tool", "Website", "Paper"];

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Đăng nhập thất bại");
        return;
      }
      window.location.reload();
    });
  }

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 620 }}>
        <span className="kicker">Protected editor</span>
        <h1 style={{ fontSize: "clamp(48px, 8vw, 84px)" }}>Admin studio</h1>
        <p className="lead">Nhập ADMIN_PASSWORD trong file <code>.env.local</code> để thêm link tài liệu dùng chung.</p>
        <form className="card form" onSubmit={submit} style={{ marginTop: 28 }}>
          {error && <div className="error">{error}</div>}
          <label className="label">
            ADMIN_PASSWORD
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </label>
          <button className="btn primary" disabled={pending} type="submit">
            {pending ? "Checking..." : "Enter studio"}
          </button>
        </form>
      </div>
    </main>
  );
}

export function AdminStudio({ initialResources, storage }: { initialResources: Resource[]; storage: string }) {
  const [resources, setResources] = useState(initialResources);
  const [form, setForm] = useState<ResourceInput>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function update<K extends keyof ResourceInput>(key: K, value: ResourceInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Không thêm được link");
        return;
      }

      setResources((current) => [data.resource, ...current]);
      setForm(emptyForm);
      setMessage("Đã thêm link. Người khác có thể xem tại /resources sau khi refresh.");
    });
  }

  function remove(id: string) {
    setError("");
    setMessage("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Không xóa được link");
        return;
      }
      setResources((current) => current.filter((resource) => resource.id !== id));
      setMessage("Đã xóa link.");
    });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Content operations</span>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 86px)", maxWidth: 820 }}>Add links without touching code.</h1>
            <p className="lead">Studio tối giản: tạo link, đánh dấu featured, xóa link hỏng. Mọi thứ còn lại để người học xử lý ở /resources.</p>
          </div>
          <button className="btn secondary" type="button" onClick={logout}>Logout</button>
        </div>

        {storage !== "supabase" && (
          <div className="notice" style={{ marginBottom: 18 }}>
            Đang ở chế độ fallback vì chưa cấu hình Supabase. Muốn mọi người cùng thấy link mới, thêm <code>.env.local</code> và tạo bảng <code>resources</code>.
          </div>
        )}
        {message && <div className="success" style={{ marginBottom: 18 }}>{message}</div>}
        {error && <div className="error" style={{ marginBottom: 18 }}>{error}</div>}

        <div className="admin-layout">
          <form className="card form" onSubmit={submit}>
            <span className="kicker">New resource</span>
            <label className="label">Title
              <input className="field" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="ATmega32A Datasheet" required />
            </label>
            <label className="label">URL
              <input className="field" value={form.url} onChange={(event) => update("url", event.target.value)} placeholder="https://..." required />
            </label>
            <label className="label">Description
              <textarea className="textarea" rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Nội dung ngắn, rõ, giúp người học biết vì sao cần mở link này." required />
            </label>
            <div className="grid two">
              <label className="label">Type
                <select className="select" value={form.type} onChange={(event) => update("type", event.target.value)}>
                  {typeOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="label">Topic
                <input className="field" value={form.topic} onChange={(event) => update("topic", event.target.value)} placeholder="Interface / BMS / AVR" />
              </label>
            </div>
            <div className="grid two">
              <label className="label">Level
                <input className="field" value={form.level} onChange={(event) => update("level", event.target.value)} placeholder="Core / Lab / Advanced" />
              </label>
              <label className="label">Source
                <input className="field" value={form.source} onChange={(event) => update("source", event.target.value)} placeholder="Microchip / GitHub / Drive" />
              </label>
            </div>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 760 }}>
              <input type="checkbox" checked={form.is_featured} onChange={(event) => update("is_featured", event.target.checked)} />
              Featured on homepage
            </label>
            <button className="btn primary" disabled={pending} type="submit">
              {pending ? "Saving..." : "Publish link"}
            </button>
          </form>

          <section>
            <div className="card" style={{ marginBottom: 16 }}>
              <span className="kicker">Live index</span>
              <h3>{resources.length} resources</h3>
              <p>Storage layer: <strong>{storage}</strong></p>
              <div className="code-block" style={{ marginTop: 16 }}>{`Required table: public.resources\nFields: title, description, url, type, topic, level, source, is_featured`}</div>
            </div>
            <div className="table-list">
              {resources.map((resource) => (
                <div className="table-row" key={resource.id}>
                  <div>
                    <h4>{resource.title}</h4>
                    <p>{resource.type} · {resource.topic} · {resource.source}</p>
                  </div>
                  <button className="btn danger" type="button" onClick={() => remove(resource.id)}>Delete</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
