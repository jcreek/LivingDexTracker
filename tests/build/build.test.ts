import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
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
});
