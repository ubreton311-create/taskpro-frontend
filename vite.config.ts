import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Fail the build when `VITE_API_URL` is missing.
 *
 * Without this guard a production bundle silently embeds a `localhost` URL and
 * every API call fails in the browser, which is indistinguishable from an
 * unrelated outage. Failing here makes the deploy pipeline report the real
 * problem. See DEPLOY.md and docs/decisions.md (D-006).
 */
function requireApiUrl(): Plugin {
  return {
    name: "taskpro:require-api-url",
    apply: "build",
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir, "VITE_");
      if (!env.VITE_API_URL?.trim()) {
        throw new Error(
          "VITE_API_URL is not set. Define it in the build environment " +
            "(Railway/Netlify service variables) before building. See DEPLOY.md.",
        );
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    requireApiUrl(),
  ],
});
