export function getEnv() {
  return {
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    adminPassword: process.env.ADMIN_PASSWORD ?? "",
    adminSecret: process.env.ADMIN_SECRET ?? "embedded-roadmap-dev-secret-change-me"
  };
}

export function hasSupabaseConfig() {
  const env = getEnv();
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}
