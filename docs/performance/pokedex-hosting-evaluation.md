# Hosting evaluation: retain Netlify pending deployed evidence

Date: 15 September 2026. This is an interim decision report. **Do not cut over to Cloudflare yet.** The application improvements and selectable preview build are implemented, but the agreed real-host comparison cannot be completed with the current access and compatibility state.

## Evidence and decision

| Item                      | Observed result                                                                                                   | Consequence                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Production Netlify site   | `livingdextracker`, `www.dextracker.uk`; published revision inspected: `31fd959350962c1f1b973a06ecd5cf4eeef86514` | This is the existing deployment, not this working tree                                  |
| Function/database regions | Netlify `us-east-1`; linked Supabase `eu-north-1`; production public database URL matches that project            | Cross-region round trips are a plausible contributor; their latency share is unmeasured |
| Node production checks    | Compact SSR, details, status writes, offline behavior and rendering budgets exercised locally                     | Application evidence only                                                               |
| Cloudflare build          | Adapter 7.2.9, Wrangler 4.131.2, compatibility date 2026-09-15, `nodejs_compat`; build and dry-run passed         | Packaging is viable                                                                     |
| Final Worker artifact     | Approximately 1,876 KiB uncompressed / 336 KiB gzip; 9,621 static assets                                          | Within published size/count limits; re-audit after renderer changes                     |
| Actual local workerd      | Home, authenticated dex and public share page returned 200                                                        | Basic runtime support demonstrated                                                      |
| Share image in workerd    | `/shared/:token/preview.png` returned 500; `sharp` native module dynamic require is unsupported                   | **Compatibility gate failed**; see separate renderer proposal below                     |
| Remote preview access     | Netlify CLI authenticated; Wrangler not authenticated; equivalent staging fixtures/accounts not supplied          | No paired deployed samples collected                                                    |

No production deployment, DNS change, database migration or region change was performed. Retaining Netlify now is a decision under incomplete evidence and a failed compatibility gate, not evidence that Netlify is faster.

Netlify supports streaming; the investigation's buffering describes the installed adapter/runtime combination, not the entire platform. Cloudflare's supported SvelteKit adapter and partial Node compatibility do not imply support for native `sharp`. Sources: [Netlify streaming](https://docs.netlify.com/build/functions/lambda-compatibility/), [SvelteKit Cloudflare adapter](https://svelte.dev/docs/kit/adapter-cloudflare), [Cloudflare Node compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/).

## Build and environment requirements

- Default builds remain Netlify. `NODE_ADAPTER=true` or `DEPLOY_TARGET=node` selects Node. `npm run build:cloudflare` selects Workers with Static Assets; `npm run check:cloudflare` checks packaging; `npm run preview:cloudflare` runs workerd locally. Do not run builds concurrently.
- Cloudflare uses platform compression rather than the Node compression implementation. Verify actual deployed content encoding for HTML, SvelteKit data and JSON responses.
- Supply public Supabase URL/anon key at build time, and private Supabase/export/OAuth secrets through platform bindings. Preview secrets must belong to the same staging project on both hosts. Keep provider redirect allowlists and cookie/domain settings explicit.
- Authenticate Wrangler and select the intended account before creating a remote preview. Build/dry-run success does not authorize production routing.
- Current documented limits include 128 MB memory, one-second startup, 64 MiB uncompressed Worker size and 20,000/100,000 static files on Free/Paid. Each static file must be at most 25 MiB. Free CPU allowance is only 10 ms per invocation; do not assume the app or renderer fits it. Measure CPU/memory/startup under actual workerd and deployment. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

## Separate proposal: Worker-compatible share-image renderer

This is the concrete implementation proposal required by the migration gate. It is **not implemented** in this change.

1. Extract the existing SVG construction, XML escaping and text truncation into a platform-neutral module. Preserve the endpoint, 1,200 × 630 dimensions, progress values, privacy behavior and cache headers.
2. Keep a Node renderer using `sharp`. Add a Cloudflare renderer using `@resvg/resvg-wasm`, selected through the same build-time platform alias pattern as compression. Pin a verified version in the renderer change; exclude native `sharp` from the Worker dependency graph.
3. Bundle the renderer's WASM as a module and initialize lazily once per isolate through a shared promise. Import a compiled WebAssembly module using the supported Workers approach, rather than assuming a browser-style URL fetch loader works. Release per-render allocations after producing a PNG byte array. [Workers WASM support](https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/), [resvg WASM package](https://github.com/thx/resvg-js/tree/main/wasm)
4. Bundle licensed regular/bold fonts, for example Noto Sans with its license. Explicitly map SVG weights to those fonts; do not rely on operating-system fonts. Verify accented Pokémon names, punctuation, long descriptions and the intended non-Latin fallback policy. Font appearance will need review against existing PNGs.
5. Add golden-image/metadata tests for empty/long names, XML special characters, all badges and 0/100% progress. Exercise concurrent requests, first invocation, repeated renders and error recovery in built workerd. Require HTTP 200, PNG signature/dimensions, correct sharing access and no private notes.
6. Re-audit bundle/assets, CPU, memory and startup after adding WASM/fonts. Run the deployed share-image test and backup/export/auth matrix before setting compatibility to passed. If this renderer exceeds operating constraints, compare a separately hosted image service in a new proposal; do not silently redirect rendering to production Netlify.

## Remaining deployed benchmark

1. Supply equivalent staging credentials and disposable national/scoped-form fixtures, then publish this exact code to both preview hosts. Preserve actual deployed revision and environment metadata.
2. Establish improved Netlify document/data baselines. Consider a separate region-aligned Netlify preview as an additional experiment; do not change the primary paired comparison mid-run.
3. Exercise sign-in, token refresh, account switching, Google/Dropbox OAuth and refresh, export generation, public shares/images, compression, secrets/bindings, static cache headers, service-worker install/update/offline routing and custom preview domains on both real hosts.
4. Use the [comparison harness](pokedex-implementation.md#instrumentation-and-comparison-harness) for at least 30 warm samples per host × fixture × direct/client navigation. Keep code, Supabase project, fixtures, browser settings and client locations identical. Run additional deliberately idled samples and record the idle duration separately; first-observed is not a cold-start claim.
5. Recommend migration only when overall first-interactive p75 improves by **both 20% and 200 ms**, no fixture/navigation combination regresses by more than 10%, and functional checks pass. Include costs and operating requirements before making the final decision.

## Cost projection and operations

Actual monthly traffic, CPU usage and the account's current Netlify billing arrangement are not available, so no savings claim is justified.

Cloudflare Paid has a $5/month minimum, includes 10 million dynamic requests and 30 million CPU-ms, then charges $0.30/million requests and $0.02/million CPU-ms. Direct static asset requests are free; requests served through Workers Caching have different billing. Illustrative direct-static configuration: 1 million dynamic requests at 20 ms CPU each remains within $5; 10 million at 20 ms is approximately $8.40. These exclude other services and are assumptions, not measured app CPU. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

For credit-based Netlify plans, estimate credits as `15 × production deploys + 10 × compute GB-hours + 20 × bandwidth GB + 2 × requests/10,000`. Confirm whether this account uses credit-based or legacy billing and apply its actual plan/allowance. Thumbnail byte savings affect bandwidth, while increased first-party sprite requests affect request metering. [Netlify pricing](https://www.netlify.com/pricing/)

Before a qualifying cutover: move database migrations out of host builds into one serialized CI release step; provision secrets and OAuth redirects; validate the custom domain and cookies; monitor error/latency/export metrics; retain the working Netlify deployment and a documented DNS rollback. These production changes remain conditional on completing the gates above.
