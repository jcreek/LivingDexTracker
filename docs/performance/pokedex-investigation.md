# Signed-in Pokédex performance investigation

Investigated 14–15 September 2026 at commit `31fd959350962c1f1b973a06ecd5cf4eeef86514`.

## Findings

The production capture establishes a server-response bottleneck: **3,506 ms waiting versus 261 ms receiving** the Pokédex data response. The current loading design exposes all entry work to that wait on the installed Netlify adapter. It requests practically the entire dex, and the adapter buffers the response before returning it. Independently, mounting the entire grid causes avoidable browser work.

Local measurements confirm the request sequence, duplicate game-scoped queries, large payload and rendering cost. **They do not explain the exact allocation of production's 3.5 seconds.** Regions, function startup and production query timings remain unverified. At the user's direction, no further production/dashboard access was attempted; subsequent measurements used local Supabase.

No performance fixes, migrations, deployment settings, public APIs or types were changed. Temporary instrumentation and the diagnostic rendering cap were removed. Full-resolution artwork must remain available when a user opens a Pokémon's detail view.

The numerical evidence, including individual runs and sanitized server traces, is in [pokedex-results.json](pokedex-results.json).

## Production evidence and its limits

| Evidence                            | Result                                                                                                       | Interpretation                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Supplied `dex.har`, data navigation | Wait 3,506.100 ms; receive 260.671 ms; 401,199 uncompressed bytes                                            | Waiting dominates transfer. This includes server and network effects; it is not a database timer. |
| Response headers                    | Brotli; `private,no-store`; Netlify request ID present                                                       | Compression already exists. User-specific content is not served as a public CDN cache hit.        |
| HAR content                         | Response text absent                                                                                         | Cannot measure production field sizes or infer the dex's form/scope configuration from this file. |
| HAR sprites                         | 36 requests, 531,086 bytes total, `max-age=300`                                                              | Visible artwork has a substantial transfer cost independent of entry data.                        |
| Supplied Lighthouse summary         | Root response 3,373 ms; about 386 KB serialized inline data; 10,442 DOM elements; 1.9 s rendering; CLS 0.127 | Corroborates both server wait and browser cost. These are user-supplied findings, not a new run.  |

The HAR contains only one application request plus the 36 sprite requests. It does **not** contain the offline-snapshot or backup-status requests; their production sizes/durations come from the supplied Lighthouse summary. Extension findings were excluded.

### Why streaming currently fails to hide the work

[The server load](../../src/routes/pokedex/[id]/+page.server.ts) returns an unresolved `initialCombinedData` promise, but `INITIAL_PAGE_SIZE` is **9,999**, matching the client. Its `.then()` discards the count/pagination metadata after the shared service has calculated it.

[adapter.mjs](../../adapter.mjs) selects standard Netlify functions (`edge: false`), except for Node test builds. Installed `@sveltejs/adapter-netlify` **4.4.2**, in `node_modules/@sveltejs/adapter-netlify/files/esm/serverless.js`, awaits `response.text()` for text responses and `response.arrayBuffer()` for binary responses. Both buffer the body before the handler returns. This proves the behavior of the installed adapter; the exact deployed package/build was not accessible. The HAR's long wait is consistent with it.

[Compression](../../src/lib/server/compression.ts) already skips application compression in Lambda because Netlify handles it. Enabling more compression would not fix this buffering boundary. The page also assigns its entries client-side, so even genuine transport streaming does not mean the grid is server-rendered and interactive immediately.

An isolated local identity-encoding stream probe received first bytes before completion:

| Dex           | First-byte median | Complete-body median |
| ------------- | ----------------: | -------------------: |
| National      |           48.3 ms |             104.7 ms |
| Scarlet forms |           36.8 ms |              72.5 ms |

These are Vite measurements, not evidence that Netlify streams.

## Server request map and timings

Sources: [session hook](../../src/hooks.server.ts), [ownership repository](../../src/lib/repositories/PokedexRepository.ts), [scope service](../../src/lib/services/PokedexDexScopeService.ts), [combined-data service](../../src/lib/services/CombinedDataService.ts), [combined-data repository](../../src/lib/repositories/CombinedDataRepository.ts).

For an unexpired authenticated session, both measured dexes make **eight Supabase HTTP requests per page/data request**:

| Stage                                    | National: 1,025 entries                    | Scarlet Paldea forms: 439 entries          |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| Authentication                           | 1 `getUser`                                | 1 `getUser`                                |
| Ownership, then scope links              | 1 `pokedexes`, then 1 `pokedex_dex_scopes` | Same                                       |
| Entry branch                             | 2 sequential entry pages: 1,000 + 25       | 1 game-dex query, then 1 forms query       |
| Count branch, parallel with entry branch | 1 HEAD exact-count query                   | Repeats the game-dex query and forms query |
| Catches, after entry retrieval           | 2 sequential chunks: 1,000 + 25            | 1 chunk: 439                               |
| Total / longest chain of requests        | **8 / 7**                                  | **8 / 6**                                  |

The game query returns 400 rows. The named-form query returns 45 rows; six are already represented, leaving 39 supplements and 439 unique entries. The count branch repeats both reads, transferring another **277,047 bytes** from Supabase just to count those entries. The two branches run concurrently: eliminating duplication reduces work and traffic, but does not necessarily remove their summed durations from the critical path.

General case:

- National path: `3 + entry-page requests + 1 count + catch chunks`. Pagination continues until a short/empty batch or the requested limit. An exact multiple of 1,000 may require an empty terminal request. Catch chunks use at most 1,000 IDs.
- Explicit game scopes: `3 + 2 × (dex-page requests + applicable form-page requests) + catch chunks`. Counting fetches the full scope even when the requested page is small. Deduplication and slicing happen in JavaScript.
- A game scope without saved dex scopes adds two sequential reads (`games`, then `game_dexes`). National dexes still pay the scope-link query even though scope resolution itself returns immediately.
- Token refresh can add an authentication request. A separate probe using an expired saved cookie produced nine requests; the reported baseline was rerun with a fresh session. Replaying that stale cookie every time was a probe artifact, not normal browser session behavior.
- `safeGetSession` is shared within a request, not across navigation and background requests.

### Isolated local server timings

Five warm requests per dex, one first run excluded. Queries were instrumented at the Supabase fetch boundary, including response-body completion; repository methods were timed separately. The cloned response used for instrumentation adds overhead. All values below are medians, so columns are not additive.

| Measure                                             | National | Scarlet forms |
| --------------------------------------------------- | -------: | ------------: |
| Auth `getUser` HTTP duration                        |  35.5 ms |       25.3 ms |
| Ownership + scope-link HTTP durations               |   8.0 ms |        7.2 ms |
| `findCombinedData`, including entries and catches   |  50.7 ms |       33.3 ms |
| `countCombinedData`, concurrent with find           |   6.6 ms |       25.6 ms |
| Catch retrieval, included within find               |  16.4 ms |        6.5 ms |
| Sum of all query durations                          |  92.9 ms |       86.0 ms |
| Elapsed request time to final query-body completion |  87.6 ms |       64.1 ms |
| Complete HTTP response                              | 104.7 ms |       72.5 ms |
| Supabase response-body bytes, summed                |  917,728 |       709,996 |

The difference between summed query durations and elapsed completion reflects concurrency. Repository work, serialization, streaming and measurement overhead sit outside or between query timings. Do not subtract these local medians from production TTFB to invent a region/startup estimate.

### Query plans and indexes

`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` ran under the local `authenticated` role with the fixture user's JWT subject. These are SQL execution times, excluding HTTP, PostgREST JSON serialization and function/network latency.

| Query shape                                       | Median of five warm executions |
| ------------------------------------------------- | -----------------------------: |
| National ordered entries, first 1,000             |                       5.557 ms |
| National ordered entries, offset 1,000            |                       5.866 ms |
| National exact count through the view             |                       2.484 ms |
| Scarlet game-dex detail rows                      |                      10.706 ms |
| Named forms available in Scarlet                  |                       2.934 ms |
| Catch query with the actual first 1,000 entry IDs |                       0.476 ms |

The entry view joins and aggregates origin-game data before returning rows. The game-dex plan aggregates 1,390 Pokémon before joining the 400 scoped entries. The offset query repeats aggregation/sorting for the last 25 rows. These are real work amplification, but small absolute local costs.

The game membership index and existing catch-record dex index are used. The exact catch query is already sub-millisecond locally. **No new index is justified by these measurements.** Prefer avoiding duplicate/full-view work before speculative indexing. The evidence JSON also retains an earlier catch-plan probe with an ID subquery; the literal-ID result above is the closer match to the application.

## Payload and browser measurements

### Method and fixtures

- Existing local Supabase seed: 1,390 catalog entries, 1,025 default forms. No reset or migration was run.
- Dedicated disposable account: national living dex with 1,025 catch records; Scarlet/Paldea form dex with 1,390 seeded catch records, of which 439 match this view. Mixed deterministic statuses and empty personal notes. Existing user data was preserved.
- Headless Playwright Chromium, 1,350 × 940 viewport, device scale 1, no extensions, no CPU/network throttling. Vite 5.4.21 development server, Node 24.18.0, same-origin sprites.
- One first run plus five warm runs for each navigation/dex combination. Client navigation clicks the real card's View button from My Pokédexes. Each client sample starts from a loaded list page with a 1.1-second settling period.
- “Visible cells” uses Playwright's first-cell visibility check and includes automation overhead. Response completion is network response completion, not full page idle. Layout/style time is CDP `LayoutDuration + RecalcStyleDuration` over the sample and 1.5-second follow-up; it is not Lighthouse's entire rendering category.

| Dex / navigation       | First-run visible | Five warm visible times    | Median TTFB | Median response complete | Median visible |    DOM |
| ---------------------- | ----------------: | -------------------------- | ----------: | -----------------------: | -------------: | -----: |
| National / direct      |            798 ms | 549, 986, 519, 474, 432 ms |       84 ms |                   268 ms |     **519 ms** | 10,236 |
| National / client      |            407 ms | 322, 335, 369, 423, 381 ms |       63 ms |                   133 ms |     **369 ms** | 10,236 |
| Scarlet forms / direct |            462 ms | 309, 278, 299, 312, 317 ms |       68 ms |                   148 ms |     **309 ms** |  4,476 |
| Scarlet forms / client |            224 ms | 272, 227, 233, 363, 274 ms |       59 ms |                   111 ms |     **272 ms** |  4,476 |

These development results must not be equated with optimized production performance. Local full-dataset fixture content, development scripts/styles and serialized session metadata differ from the production capture. The initial Vite dependency-optimization failure was resolved before collecting this matrix. One first-run streamed response could not be read through Chromium's body-capture API; its bytes are recorded as null, not zero.

### What is needed at first paint

At this viewport the national dex mounts 35 boxes and 1,025 populated cells, with only **60 cells visible**. Scarlet mounts 15 boxes and 439 cells, also with 60 visible. The national grid is 10,532 px tall. IntersectionObserver already defers distant sprite downloads; it does not prevent mounting those cells, tooltip components and loading spinners. There were 73 image elements, not 1,025 downloaded sprites.

The box and tooltip need identity/name/form/number/sprite key and catch-status flags. Evolution/catch instructions, origin games, dex notes and personal notes belong to the detail workflow. Repeated catch `userId`/`pokedexId` values are also expensive in ordinary JSON. The page still needs global totals and stable placement, so simply lowering the limit would break existing behavior.

| JSON measurement                                  |  National | Scarlet forms |
| ------------------------------------------------- | --------: | ------------: |
| Full combined rows                                | 592,997 B |     255,319 B |
| Display-only rows for every entry                 | 170,636 B |      74,154 B |
| Display-only first 60 entries                     |   9,751 B |      10,757 B |
| Detail-only Pokémon fields, separately serialized | 214,064 B |      91,887 B |

“Display-only” is a sizing experiment, **not a proposed drop-in API**: it excludes identifiers/fields that writes and details currently need. JSON partitions are serialized separately and are not additive. Actual SvelteKit data responses use a different serialization format: warm client response medians were 518,649 B and 222,892 B. Direct development documents were about 686 KB and 375 KB; their largest inline scripts were 545,897 B and 235,175 B.

### Controlled rendering comparison

A temporary diagnostic changed only the rendered box loop to its first two boxes, leaving the fetched full dataset intact. Both comparisons blocked the two background endpoints, used the existing offline worker, and measured five warm direct loads plus 2.5 seconds after visibility. The full loop was restored afterward.

| Measure                                         | All 35 boxes | First 2 boxes only |
| ----------------------------------------------- | -----------: | -----------------: |
| Mounted populated cells                         |        1,025 |                 60 |
| DOM elements                                    |       10,236 |                728 |
| Median time to visible cells                    |       464 ms |             318 ms |
| Median layout/style work                        |      63.9 ms |            13.4 ms |
| Median main-thread task time during observation |     1,124 ms |            82.8 ms |
| Median accumulated long-task duration           |       147 ms |               0 ms |

This isolates a substantial browser cost from mounting the full view; it does not demonstrate a complete virtualization implementation or guarantee the same production savings. Off-screen spinner components remain mounted in the full view, but this experiment does not separately attribute their cost.

Direct-load layout-shift observations varied (roughly 0.082–0.657), with footer/content shifts recorded. Client-click samples recorded zero, partly because recent-input shifts are excluded. These short development observations are not interchangeable with production's Lighthouse CLS of 0.127. Reserve appropriate loading geometry when redesigning rendering.

## Background requests and artwork

[Offline synchronization](../../src/lib/stores/offlineSync.ts) schedules startup after one second and reuses a matching format-2 snapshot younger than 15 minutes. Explicit edits, retry, account changes and reconnect trigger a fresh copy. [The snapshot endpoint](../../src/routes/api/offline-snapshot/+server.ts) loads every owned dex in parallel, including full entry/detail/catch data. For this account that is ten Supabase calls with a fresh token, independent of the page's eight.

A separate local comparison activated the existing offline worker and controlled metadata age in the disposable browser cache. Five warm direct loads per condition:

| Condition                              | Median visible cells | Snapshot requests per load | Backup requests per load |
| -------------------------------------- | -------------------: | -------------------------: | -----------------------: |
| Fresh snapshot, enabled                |               449 ms |                          0 |                        1 |
| Stale snapshot, enabled                |               431 ms |                          1 |                        1 |
| Stale snapshot, both endpoints blocked |               464 ms |                0 completed |              0 completed |

The stale snapshot was **849,107 B**, typically around 130–160 ms locally. It started around 1.2 seconds after navigation, after cells were visible. Backup status began around 0.2–0.3 seconds, overlapping rendering. Blocking requests did **not** improve time to visible cells consistently in these runs. Thus background work is a secondary bandwidth/CPU/DB contention concern, not a demonstrated explanation of initial local TTFB. An already-running snapshot could overlap a later client navigation; the production HAR cannot establish that.

[Backup status GET](../../src/routes/api/export-integrations/+server.ts) calls `requireAuth`, reads the memoized session, then calls `supabase.auth.setSession(session)`. Instrumentation observed **two `GET /auth/v1/user` requests plus one integration query**. Memoizing `safeGetSession` does not eliminate validation triggered by this separate `setSession` call.

The worker stores snapshot data without automatically fetching all artwork; artwork fetches are cached as viewed, and full artwork download is explicit. The initial dev navigation matrix had no registered worker, so its snapshot requests did not establish cache-reuse behavior; that is why the separate worker-enabled comparison was necessary.

### Preserve detail-image resolution

[Sprite URL resolution](../../src/lib/utils/spriteUrl.ts) selects local assets only when `PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER` is `true`; otherwise it uses GitHub raw URLs. The HAR confirms the latter for production. Local `home/1.webp` and `home/shiny/1.webp` are both 512 × 512. In-memory 128 px WebP experiments at quality 80 reduced 13,530 → 2,726 B and 12,634 → 2,522 B (about 80%). Two samples are not a catalog-wide saving estimate.

**Retain the 512 px originals for the clicked Pokémon detail view.** If pursuing this optimization, introduce separate grid thumbnails and retain full-resolution detail URLs, with fallback coverage for shiny, female and named forms. Update manifest/cache versioning deliberately; replacing assets at existing URLs conflicts with the worker's cache-forever assumption. The sprite build script currently defaults `SPRITE_MAX_SIZE` to zero, so “sprites-small” does not imply smaller dimensions. No sprite files were changed.

## Ranked recommendations

| Priority | Recommended next change                                                                                                                                                                                                                       | Evidence / confidence                                                                                                                                                    | Effort and risk                                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1        | Stop computing an unused count in the page preload; share one ordered scoped-entry retrieval when rows and count are both needed. Combine ownership and scope retrieval where practical.                                                      | Confirmed redundant work: one national count or two full scoped queries, plus serial metadata reads. High confidence in work reduction; production milliseconds unknown. | Low–medium. Preserve ownership/RLS, scope deduplication, named default forms and ordering.                                                                               |
| 2        | Reduce initial data and the number of mounted boxes together. Evaluate viewport rendering with reserved space, lightweight global totals/order, and on-demand detail data.                                                                    | Only 60/1,025 cells visible; capped rendering reduced visible time 31%, layout/style work 79%, DOM 93%. Display-only JSON is about 71% smaller.                          | Medium–high. Preserve box numbering, scroll/keyboard access, global filters/counts, bulk edits, navigation races and offline details. Do not just change `9999` to `60`. |
| 3        | Resolve the Netlify buffering constraint as part of the loading design. Validate a supported streaming-capable adapter/runtime in a future deployment, or make the initial response intentionally small without relying on deferred promises. | Installed adapter demonstrably buffers. High confidence in the constraint; no deployed streaming alternative verified.                                                   | Medium. Keep Netlify as target; test both document and data navigation. A shell alone is not an interactive grid.                                                        |
| 4        | Remove redundant backup-session validation if authentication remains guaranteed; schedule nonessential background work after critical page work while preserving snapshot freshness and explicit syncs.                                       | Three backup calls confirmed; stale snapshot 849 KB. No consistent local first-visibility gain when blocked.                                                             | Low–medium. Verify reconnect status and account isolation; do not disable offline support.                                                                               |
| 5        | Serve separate grid thumbnails, retaining full-resolution detail artwork. Evaluate first-party hosting/cache headers for those assets.                                                                                                        | Two samples about 80% smaller; production HAR sprite transfer 531 KB.                                                                                                    | Medium. Preserve all variants and offline cache behavior. Requires separate thumbnail URLs, not destructive resizing.                                                    |
| 6        | Replace per-entry linear catch lookup with a map when touching repository joins.                                                                                                                                                              | `.find()` per row has quadratic scaling, but current local processing is small.                                                                                          | Low. Lower priority than network, payload and DOM work.                                                                                                                  |

Do not propose a database index or a region move as an established fix from the available evidence. Production-specific stage instrumentation and region verification remain future work requiring access.

### Regression coverage and secondary findings

[Lighthouse CI](../../lighthouserc.cjs) audits only five signed-out pages using the Node adapter. [Signed-in BDD scenarios](../../tests/bdd/features/performance.feature) allow five seconds for direct load and three seconds per switch, assert first-cell visibility and prohibit a separate entry request. Those checks do not exercise Netlify's response buffering, assert authenticated data/DOM sizes, or distinguish shell, first cells and completed loading.

Future checks should use a full national fixture and a scoped form fixture, measure document and client navigation separately, and track response bytes, mounted cells, first useful view and background request counts. Preserve ordering, overlapping dex deduplication, named default forms, missing catches, filters, bulk status updates, modal notes, shiny/female artwork, account changes and fresh/stale offline behavior. A deliberate loading redesign may require replacing the “no separate entry request” assertion with a user-visible timing/data budget. Deployment checks must exercise actual Netlify responses, not infer parity from Node CI.

The nested `<button>` in [Tooltip](../../src/lib/components/Tooltip.svelte) is confirmed by source inside each Pokémon button. Address its accessible name and invalid nesting in follow-up UI work. Contrast, target-size and missing-meta-description findings are secondary to the performance diagnosis; contrast/target size require rendered theme/mobile verification, while the missing page description is visible in source. Preserve detail-view artwork quality as requested.

## Reproduction and cleanup

Raw captures, disposable credentials and diagnostic scripts are local-only under `/tmp/pokedex-perf-investigation` (directory mode 700); they are not included in the repository evidence. The evidence JSON omits sessions, fixture IDs, personal data and full query filters. The original `dex.har` and prompt remain untouched and untracked.

The seeded stack was already running. Instead of resetting it or invoking Tailwind output generation, the investigation used the project's loopback-checked Supabase environment wrapper and the same Vite dev server used by `dev:supabase`:

```sh
# From the repository root; these diagnostic scripts are retained locally, not installed tooling.
node /tmp/pokedex-perf-investigation/setup.mjs
node scripts/run-with-local-supabase.mjs node /tmp/pokedex-perf-investigation/seed.mjs
node scripts/run-with-local-supabase.mjs node /tmp/pokedex-perf-investigation/auth.mjs
PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER=true node scripts/run-with-local-supabase.mjs npx vite dev --host 127.0.0.1 --port 4173 > /tmp/pokedex-perf-investigation/dev.log 2>&1

# In another terminal, after Vite dependency optimization has settled:
node /tmp/pokedex-perf-investigation/measure.mjs
node /tmp/pokedex-perf-investigation/background.mjs
node /tmp/pokedex-perf-investigation/server-probe.mjs
node /tmp/pokedex-perf-investigation/analyze-server.mjs
node /tmp/pokedex-perf-investigation/explain.mjs
node /tmp/pokedex-perf-investigation/catch-plan.mjs

# After stopping the dev server and restoring the instrumented files:
node scripts/run-with-local-supabase.mjs node /tmp/pokedex-perf-investigation/cleanup.mjs
```

The rendering-cap experiment temporarily changed `{#each boxNumbers as boxNumber}` to `{#each boxNumbers.slice(0, 2) as boxNumber}`, then ran `PERF_VARIANT=grid-cap node /tmp/pokedex-perf-investigation/grid-cap.mjs` and restored the file. Run comparisons sequentially, discard the first run and keep viewport/cache/fixture settings equal. The full methodology and sanitized per-run evidence above remain usable if the temporary scripts are later removed.

At completion, original application files were restored byte-for-byte, the investigation server was stopped, and only the dedicated fixture account and its cascading test records were deleted. Existing database data and production configuration were unchanged. No commit was created.
