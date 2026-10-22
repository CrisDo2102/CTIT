import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // CSS import trong component được bỏ qua (mặc định của Vitest), nên render HTML ở môi trường node là đủ.
    restoreMocks: true
  }
});
