import { fallbackResources } from "@/data/resources";
import type { Resource, ResourceInput } from "@/lib/types";
import { getEnv, hasSupabaseConfig } from "@/lib/env";

const table = "resources";

// data/resources.ts dùng field `featured?`, còn lib/types.ts (Supabase) dùng
// `is_featured` bắt buộc. Hàm này chuẩn hoá seed data về đúng shape để hết lỗi
// type khi build (`npm run build`).
const normalizedFallbackResources: Resource[] = fallbackResources.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  url: item.url,
  type: item.type,
  topic: item.topic,
  level: item.level,
  source: item.source,
  is_featured: Boolean(item.featured)
}));

function supabaseHeaders() {
  const env = getEnv();
  return {
    apikey: env.supabaseServiceRoleKey,
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    "Content-Type": "application/json"
  };
}

function endpoint(path = "") {
  const env = getEnv();
  return `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}${path}`;
}

export async function getResources(): Promise<{ resources: Resource[]; storage: "supabase" | "fallback"; error?: string }> {
  if (!hasSupabaseConfig()) {
    return { resources: normalizedFallbackResources, storage: "fallback" };
  }

  try {
    const res = await fetch(endpoint("?select=*&order=created_at.desc"), {
      headers: supabaseHeaders(),
      cache: "no-store"
    });

    if (!res.ok) {
      return {
        resources: normalizedFallbackResources,
        storage: "fallback",
        error: `Supabase returned ${res.status}`
      };
    }

    const data = (await res.json()) as Resource[];
    return { resources: data, storage: "supabase" };
  } catch (error) {
    return {
      resources: normalizedFallbackResources,
      storage: "fallback",
      error: error instanceof Error ? error.message : "Unknown Supabase error"
    };
  }
}

export async function createResource(input: ResourceInput): Promise<Resource> {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase chưa được cấu hình. Thêm SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY vào .env.local.");
  }

  const res = await fetch(endpoint(""), {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "return=representation"
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Cannot insert resource: ${res.status}`);
  }

  const data = (await res.json()) as Resource[];
  return data[0];
}

export async function deleteResource(id: string): Promise<void> {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase chưa được cấu hình.");
  }

  const res = await fetch(endpoint(`?id=eq.${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: supabaseHeaders(),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Cannot delete resource: ${res.status}`);
  }
}
