import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Resolve the "@/" import alias from tsconfig.json so component tests can import app code.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
