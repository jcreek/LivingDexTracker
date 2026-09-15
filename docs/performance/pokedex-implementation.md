# Pokédex performance implementation

Status: application changes implemented; hosting comparison remains gated. Measurements below are local production-build evidence, not deployed latency improvements. See [hosting evaluation](pokedex-hosting-evaluation.md) for the migration decision and remaining work.

## Application changes

- Ownership and saved scope links are read together. Scoped entry retrieval is shared by rows/count consumers; the full grid performs no count query. Catch joins use ID maps. Scope deduplication, named default forms, supplements and ordering remain covered by repository tests.
- The page awaits the entire compact grid and renders initial boxes on the server. Authentication state reaches SSR through the validated layout user. Successful navigation needs no grid API request; failed grid loads expose retry.
- `PokedexGridRow` contains identity, sprite resolution fields and catch flags. The page and authenticated `/api/pokedexes/[id]/grid` endpoint transport named tuples defined in `PokedexGridRow.ts`; `packGrid`/`unpackGrid` keep that wire format out of components. Instructions, notes, origin games and repeated owner/dex IDs are absent. Existing full combined-data consumers retain their contracts.
- The detail endpoint verifies ownership and membership before returning one full `CombinedData` row. The modal opens immediately with identity and full artwork, then loads editable details. Its account/dex/entry cache, abort/sequence checks and pending-patch merge protect rapid selection changes and optimistic edits.
- Status writes send changed fields. Bulk writes group records by supplied columns, preserving omitted notes and flags; explicit empty notes clear them. New records use database defaults. Full-record callers and exports remain supported. Bulk box actions still target all original 30 slots, including dimmed entries.
- Grid placeholders preserve geometry; visible boxes and one row of overscan mount populated cells. Focused boxes remain mounted, keyboard navigation crosses boundaries, modal close restores focus, and an accessible render-all option exposes the complete document. Each Pokémon uses one button with identity/status and a noninteractive tooltip.
- Density is persisted in a cookie for stable SSR geometry and in local storage. Resize/density changes preserve the current box anchor. Existing local-storage-only preferences are replaced by the cookie after choosing a density.
- Automatic snapshot/backup work starts at the interactive/idle boundary with a five-second fallback. Concurrent backup refreshes coalesce. Explicit sync and edit/account/reconnect invalidations retain freshness behavior. Backup-status GET no longer revalidates via `setSession`.
- Complete offline snapshot format 2 is retained. Offline modal details come only from the matching account snapshot; missing copies report unavailable details. Offline details are read-only, as before for offline mutations.

## Artwork and build behavior

`npm run sprites:grid` generates 3,170 first-party WebP thumbnails, at most 128 pixels per side, quality 80. Builds run this automatically. Generated assets live in ignored `static/sprites-grid/v1/`; the generator emits a manifest. Originals remain 512 pixels for details and explicit full-artwork downloads.

The generated catalog is 10,007,504 bytes versus 53,659,230 bytes for the source WebP catalog (81.4% smaller). Shiny, female and named-form resolution uses the existing key/fallback chain. The service worker recognizes versioned grid sprites in the existing artwork cache; neither thumbnail nor original catalogs are blanket precached. Root `_headers` supplies immutable caching on Netlify/Cloudflare. Bump the URL version whenever generation settings or source images change; generation skips existing files within a version.

## Local acceptance evidence

Fixtures: national (1,025 entries), Scarlet/Paldea forms (439 entries), mixed catch flags and nonempty notes. Integration tests additionally cover missing catches and overlapping scopes through repository tests. Browser viewport: 1,350 × 940, comfortable density, Chromium, local Node production build and local seeded Supabase.

The packed grid is approximately 81 KB national and 36 KB scoped, versus the investigation's approximately 593 KB and 255 KB full-data JSON. The same-fixture integration assertion separately verifies at least 60% reduction against full combined rows. These are serialized row sizes, not compressed HTML document sizes.

The local browser checks verify at most 180 populated mounted cells, fewer than 2,500 DOM elements and CLS at most 0.1; observed initial population is 120 cells. Density/mobile checks include all three densities at 1,350 and 390 pixels. Detail artwork is asserted to load at 512 pixels. No redundant grid request is allowed; intentional detail requests are allowed.

Warm results from the corrected harness (30 samples per row; [sanitized summary](pokedex-local-results.json)):

| Fixture      | Navigation | First visible p75 | First interactive p75 | Decoded response bytes p75 | Maximum DOM |
| ------------ | ---------- | ----------------: | --------------------: | -------------------------: | ----------: |
| National     | Direct     |          123.5 ms |              145.4 ms |                    248,668 |       2,088 |
| National     | Client     |          495.6 ms |              494.1 ms |                    102,687 |       2,090 |
| Scoped forms | Direct     |          114.5 ms |              133.1 ms |                    203,601 |       2,073 |
| Scoped forms | Client     |          491.7 ms |              490.6 ms |                     45,645 |       2,075 |

Every warm sample had 120 populated cells, zero observed CLS, zero redundant grid requests and a measured response size. Direct response bytes include SSR markup and SvelteKit data; client bytes are SvelteKit data responses, not just the packed rows. Interactive marks can precede the next animation-frame visibility observation by a few milliseconds. Client timings include Playwright click overhead, as explained below. This benchmark preceded the final account-switch backup invalidation guard; the final production smoke suite also passed after that guard.

### Validation completed

| Check                             | Result                                                                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Svelte/TypeScript                 | 0 errors; one existing `Tooltip.svelte` CSS `@apply` warning                                                                       |
| Unit tests                        | 193 passed                                                                                                                         |
| Data tests                        | 18 passed                                                                                                                          |
| Coverage                          | Existing thresholds passed: 66.81% lines/statements, 88.79% branches, 90.99% functions                                             |
| Local Supabase integration        | 16 passed, including same-fixture payload reduction and note preservation                                                          |
| Authenticated browser regressions | 53 passed, including mock Google/Dropbox OAuth, exports and service-worker/offline flows                                           |
| Build matrix                      | Four checks in each of Netlify/Node × generateSW/injectManifest passed                                                             |
| Production performance/behavior   | Both fixtures, all densities/mobile, resize anchor, focus/keyboard, modal race, full artwork and offline snapshot isolation passed |
| Cloudflare                        | Final build and Wrangler dry-run passed; local workerd share-image generation failed as documented in the hosting report           |
| Formatting/lint                   | All changed/new implementation files pass Prettier; ESLint and `git diff --check` pass                                             |

Repository-wide `npm run lint` also scans the pre-existing untracked `dex.har` and `POKEDEX_PERFORMANCE_PROMPT.md`; those two files have formatting warnings and were intentionally left untouched. No coverage threshold was lowered. Disposable performance accounts and local test servers were cleaned up.

### Reproduce

```sh
npm ci
npx supabase start
npx playwright install chromium
npm run check
npm run test:unit
npm run test:integration
npm run test:build
PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER=true npm run test:bdd
npm run test:performance
PERF_BENCHMARK=true npm run test:performance
```

Run builds sequentially: they share `.svelte-kit` and `build`. Performance tests create a disposable local-only account, use private temporary session files, clean up afterward, and copy sanitized reports/screenshots to ignored `test-results/performance/`. Cleanup failures retain recovery files. Never commit session/configuration files.

## Instrumentation and comparison harness

Set `POKEDEX_PERFORMANCE=true` on a preview to emit fixed-label `Server-Timing` stages: auth, ownership, scopes, entries, catches, preparation and total. Timings do not include IDs, cookies, notes or query text. Authentication includes the request hook's validation. Total measures the page/service span, not total platform request lifetime; stages may therefore not sum to total.

The browser harness measures first visible cells via animation frames and first interactive cells via `pokedex:first-interactive`, independently of response completion. It collects DOM/cells, layout shifts, intentional/redundant API counts and response sizes. For Chromium service-worker responses where Playwright cannot read the body, decoded Resource Timing bytes are used; absent measurements stay null. Decoded, encoded and transferred bytes are distinguished.

`benchmark.mjs` requires at least 30 warm samples per fixture/navigation combination. It records the first observed run separately; that is **not** evidence of a cold start or first-after-idle run. For real-host work, collect deliberately idled runs separately and record the idle interval. Client timing starts before Playwright's click, so includes its actionability overhead; preserve identical tooling/settings between hosts and report this limitation.

Private configuration example (replace all placeholders):

```json
{
	"samples": 30,
	"revision": "exact-deployed-commit",
	"databaseLabel": "same-staging-project",
	"clientLocation": "London-fixed-runner",
	"environment": "deployed",
	"compatibilityPassed": false,
	"hosts": [
		{
			"label": "netlify",
			"url": "https://NETLIFY-PREVIEW",
			"storageState": "/PRIVATE/netlify-session.json",
			"fixtures": [
				{ "id": "NATIONAL-ID", "name": "Performance National", "label": "national" },
				{ "id": "SCOPED-ID", "name": "Performance Scarlet Forms", "label": "scoped-forms" }
			]
		}
	]
}
```

Add an equivalent `cloudflare` host using the same database and fixtures. Run:

```sh
node scripts/performance/benchmark.mjs /PRIVATE/config.json /PRIVATE/results.json
node scripts/performance/compare.mjs /PRIVATE/results.json
```

The comparison refuses insufficient samples and retains Netlify unless deployed evidence, compatibility and the agreed improvement thresholds all pass. Human review must still establish costs, environment equivalence and deployment prerequisites.
