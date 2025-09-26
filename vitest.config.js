import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      exclude: [
        "src/packs/**",
        "dist/**",
        "node_modules/**",
        ".nyc_output/**",
        "coverage/**",
        "*.config.js",
        "index.d.ts",
      ],
    },
  },
});
