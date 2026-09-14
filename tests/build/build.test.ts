import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { generateSW } from '../../pwa.mjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { nodeAdapter } from '../../adapter.mjs';

describe(`test-build: ${nodeAdapter ? 'node' : 'static'} adapter`, () => {
	it(`service worker is generated: ${generateSW ? 'sw.js' : 'prompt-sw.js'}`, () => {
		const swName = `./build/${nodeAdapter ? 'client/' : ''}${generateSW ? 'sw.js' : 'prompt-sw.js'}`;
		expect(existsSync(swName), `${swName} doesn't exist`).toBeTruthy();
		const webManifest = `./build/${nodeAdapter ? 'client/' : ''}manifest.webmanifest`;
		expect(existsSync(webManifest), `${webManifest} doesn't exist`).toBeTruthy();
		const swContent = readFileSync(swName, 'utf-8');
		let match: RegExpMatchArray | null;
		if (generateSW) {
			match = swContent.match(/define\(\['\.\/(workbox-\w+)'/);
			expect(
				match && match.length === 2,
				`workbox-***.js entry not found in ${swName}`
			).toBeTruthy();
			const workboxName = `./build/${nodeAdapter ? 'client/' : ''}${match?.[1]}.js`;
			expect(existsSync(workboxName), `${workboxName} doesn't exist`).toBeTruthy();
		}
		match = swContent.match(/"url":\s*"manifest\.webmanifest"/);
		expect(
			match && match.length === 1,
			'missing manifest.webmanifest in sw precache manifest'
		).toBeTruthy();
		match = swContent.match(/"?url"?:\s*"\/?offline(?:\.html)?"/);
		expect(
			match && match.length === 1,
			'missing credential-free offline entry point in sw precache manifest'
		).toBeTruthy();
		const outputRoot = `./build/${nodeAdapter ? 'client/' : ''}`;
		expect(existsSync(`${outputRoot}offline.html`)).toBe(true);
		expect(existsSync(`${outputRoot}offline-worker.js`)).toBe(true);
		expect(existsSync(`${outputRoot}service-worker.js`)).toBe(false);
		expect(swContent).not.toMatch(/"?url"?:\s*"\/"/);
		if (nodeAdapter) {
			match = swContent.match(/"url":\s*"server\//);
			expect(match === null, 'found server/ entries in sw precache manifest').toBeTruthy();
		}
	});

	const outputRoot = `./build/${nodeAdapter ? 'client/' : ''}`;
	const nodesDir = './.svelte-kit/output/server/nodes/';
	const gzippedSize = (path: string) => gzipSync(readFileSync(`${outputRoot}${path}`)).length;

	/** The client files a route node makes the browser load (its imports and stylesheets). */
	function assetsLoadedBy(node: string, extension: 'js' | 'css'): string[] {
		const pattern = new RegExp(`_app/immutable/[^"']+\\.${extension}`, 'g');
		return [...new Set(readFileSync(`${nodesDir}${node}`, 'utf-8').match(pattern) ?? [])];
	}

	it('ships the app stylesheet once, hashed and small', () => {
		const referenced = new Set(
			readdirSync(nodesDir).flatMap((node) => assetsLoadedBy(node, 'css'))
		);
		// Every page loads Tailwind's preflight; exactly one served stylesheet may contain it.
		const withPreflight = [...referenced].filter((path) =>
			readFileSync(`${outputRoot}${path}`, 'utf-8').includes('--tw-content')
		);
		expect(withPreflight, 'Tailwind is bundled more than once').toHaveLength(1);

		// The un-hashed output.css exists only for offline.html; pages must not block on it.
		const appHtml = readFileSync('./src/app.html', 'utf-8');
		expect(appHtml).not.toMatch(/output\.css/);
	});

	// Regression budgets for what every page downloads before it can render: the root layout's
	// scripts and stylesheets. Unlike Lighthouse timings these sizes don't vary between runs, so any
	// growth past the budget fails the PR. Measured September 2026: 95.7 KB JS and 15.7 KB CSS
	// gzipped. Raise a budget in the same PR only when the extra weight is deliberate.
	it.each([
		['js', 105 * 1024],
		['css', 18 * 1024]
	] as const)('keeps the layout %s loaded on every page within budget', (extension, budget) => {
		const total = assetsLoadedBy('0.js', extension).reduce(
			(sum, path) => sum + gzippedSize(path),
			0
		);
		expect(total, `layout ${extension} is ${total} bytes gzipped`).toBeLessThan(budget);
	});
});
