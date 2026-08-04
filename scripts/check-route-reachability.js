#!/usr/bin/env node
// Guards against "built but unreachable" — the 4th confirmed instance of
// this bug class in this codebase (Voice Outreach Settings/DNC, Confirm &
// Call, the Command Palette silently going stale as new modules shipped,
// and whatever the 4th one was that prompted this script). Every one of
// those was caught by manual review, which is exactly the failure mode
// this exists to close: a route can be added to App.jsx and never linked
// from anywhere, and nothing before this said so.
//
// What it checks: every non-redirect, non-public <Route> in App.jsx must
// have its path string appear in at least one of the app's real navigation
// registries (see REGISTRY_FILES below). Routes with a ":param" segment
// (detail views opened by clicking a specific record, e.g.
// /revenue-engine/lead/:prospectId) are exempt from direct-link
// reachability by convention — they are never nav destinations — but are
// still listed in the report for visibility.
//
// Run: node scripts/check-route-reachability.js
// Wired into `npm run build` via the "prebuild" lifecycle hook, so it also
// gates real deploys (Vercel runs `npm run build`), and into `npm run dev`
// via "predev" as a non-blocking warning.
//
// Exit code 1 (fails the build) if any orphaned route is found, unless
// --warn-only is passed.

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '..', 'src')
const APP_FILE = path.join(SRC, 'App.jsx')

// Every file that is a legitimate "front door" into a page — kept as an
// explicit list, not auto-discovered, so adding a new registry (e.g. a
// 6th hub, a new SubNav) is a deliberate, reviewable one-line addition
// here rather than silent magic. If you add a new hub/subnav file and
// this check doesn't know about it, its links won't count as reachability
// and everything inside it will falsely report as orphaned — add it below.
const REGISTRY_FILES = [
  'Nav.jsx',
  'CommandPalette.jsx',
  'SalesHub.jsx',
  'MarketingHub.jsx',
  'IntelligenceHub.jsx',
  'AnalyticsHub.jsx',
  'SettingsHub.jsx',
  'VoiceOutreachSubNav.jsx',
  'RevenueEngineSubNav.jsx',
]

// Paths that are legitimately reachable only by being typed/bookmarked
// (auth entry points) — never nav/palette destinations, so they're
// excluded rather than requiring a fake registry entry.
const PUBLIC_PATH_MARKER = 'ProtectedRoute'

function extractRoutesFromApp(content) {
  const routes = []
  const lines = content.split('\n')
  const routeLineRe = /<Route\s+path="([^"]+)"\s+element=\{(.+?)\}\s*\/>/
  lines.forEach((line, idx) => {
    const m = line.match(routeLineRe)
    if (!m) return
    const [, routePath, elementContent] = m
    const isRedirect = elementContent.includes('Navigate')
    const isPublic = !elementContent.includes(PUBLIC_PATH_MARKER)
    const isDynamic = routePath.includes(':')
    routes.push({ path: routePath, line: idx + 1, isRedirect, isPublic, isDynamic })
  })
  return routes
}

function extractRegisteredPaths(content) {
  const paths = new Set()
  const re = /path:\s*['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(content)) !== null) paths.add(m[1])
  return paths
}

function main() {
  const warnOnly = process.argv.includes('--warn-only')

  const appContent = readFileSync(APP_FILE, 'utf8')
  const routes = extractRoutesFromApp(appContent)
  if (routes.length === 0) {
    console.error('[route-reachability] Found ZERO <Route> entries in App.jsx — the extraction regex probably broke against a formatting change. Treating this as a failure rather than silently passing.')
    process.exit(1)
  }

  const registeredPaths = new Set()
  const missingRegistryFiles = []
  for (const filename of REGISTRY_FILES) {
    const filePath = path.join(SRC, filename)
    try {
      const content = readFileSync(filePath, 'utf8')
      for (const p of extractRegisteredPaths(content)) registeredPaths.add(p)
    } catch {
      missingRegistryFiles.push(filename)
    }
  }

  const checkable = routes.filter(r => !r.isRedirect && !r.isPublic && !r.isDynamic)
  const dynamic = routes.filter(r => !r.isRedirect && !r.isPublic && r.isDynamic)
  const orphaned = checkable.filter(r => !registeredPaths.has(r.path))

  console.log(`[route-reachability] ${routes.length} routes in App.jsx — ${checkable.length} checkable, ${dynamic.length} dynamic (exempt), ${routes.length - checkable.length - dynamic.length} redirect/public (excluded).`)
  console.log(`[route-reachability] ${registeredPaths.size} distinct paths registered across: ${REGISTRY_FILES.join(', ')}`)

  if (missingRegistryFiles.length > 0) {
    console.warn(`[route-reachability] WARNING: could not read ${missingRegistryFiles.join(', ')} — if these were renamed, update REGISTRY_FILES in scripts/check-route-reachability.js.`)
  }

  if (dynamic.length > 0) {
    console.log('\n[route-reachability] Dynamic routes (exempt — expected to be reached by clicking a record, not a nav link):')
    dynamic.forEach(r => console.log(`  ${r.path}  (App.jsx:${r.line})`))
  }

  if (orphaned.length === 0) {
    console.log('\n[route-reachability] PASS — every route is reachable from the sidebar nav, a hub page, a subnav, or the command palette.')
    process.exit(0)
  }

  console.error(`\n[route-reachability] FAIL — ${orphaned.length} route(s) built but unreachable from anywhere:`)
  orphaned.forEach(r => console.error(`  ${r.path}  (App.jsx:${r.line})`))
  console.error(
    '\nFix by adding a link to each path above in Nav.jsx, one of the Hub*.jsx files, a *SubNav.jsx, '
    + 'or CommandPalette.jsx — then re-run. If the route is genuinely dynamic (opened only by clicking a '
    + 'specific record), its path in App.jsx must include a ":param" segment to be exempted.'
  )
  process.exit(warnOnly ? 0 : 1)
}

main()
