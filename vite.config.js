import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Vercel sets this for every build; falls back to a local git read so `npm
// run build` still stamps a real commit outside of Vercel (e.g. this same
// check running locally before a push).
function resolveCommitSha() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA
  try {
    return execSync('git rev-parse HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

const commitSha = resolveCommitSha()
const versionInfo = { commit: commitSha, commit_short: commitSha.slice(0, 7) }

// Mirrors the backend's GET /version (commit + commit_short sourced from
// RENDER_GIT_COMMIT) — same idea, same shape, so a frontend deploy can be
// confirmed the exact same way: fetch /version.json and compare to the
// commit that was just pushed. Emitted as a real static asset (not routed
// through the SPA catch-all rewrite) so it always returns JSON, never the
// index.html fallback.
function versionJsonPlugin() {
  return {
    name: 'version-json',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify(versionInfo) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionJsonPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(versionInfo),
  },
})
