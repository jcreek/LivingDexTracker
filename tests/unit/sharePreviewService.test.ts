import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import {
	buildSharePreviewSvg,
	escapeXml,
	renderSharePreview,
	SHARE_PREVIEW_HEIGHT,
	SHARE_PREVIEW_WIDTH,
	truncatePreviewText
} from '$lib/services/SharePreviewService';
import type { SharedPokedexData } from '$lib/models/SharedPokedex';

const shared: SharedPokedexData = {
	name: 'Johto & <Friends>',
	description: 'A shared collection',
	isLivingDex: true,
	isShinyDex: false,
	isOriginDex: false,
	isFormDex: false,
	gameScope: null,
	dexScopes: [],
	combinedData: [],
	total: 100,
	caught: 42,
	completionPercentage: 42
};

describe('share preview rendering', () => {
	it('escapes XML and truncates normalized user text', () => {
		expect(escapeXml(`<tag attr="x">Tom & Jerry's</tag>`)).toBe(
			'&lt;tag attr=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/tag&gt;'
		);
		expect(truncatePreviewText(' lots   of\nspace ', 20)).toBe('lots of space');
		expect(truncatePreviewText('abcdefghij', 6)).toBe('abcde…');
	});

	it('builds a branded progress card without raw user markup', () => {
		const svg = buildSharePreviewSvg(shared);
		expect(svg).toContain('Johto &amp; &lt;Friends&gt;');
		expect(svg).not.toContain('Johto & <Friends>');
		expect(svg).toContain('42 of 100 Pokémon caught');
		expect(svg).toContain('42%');
	});

	it('lists every enabled dex badge and omits an empty description', () => {
		const svg = buildSharePreviewSvg({
			...shared,
			description: '',
			isShinyDex: true,
			isOriginDex: true,
			isFormDex: true,
			gameScope: 'Scarlet'
		});
		for (const badge of ['Living', 'Shiny', 'Origin', 'Form', 'Scarlet']) {
			expect(svg).toContain(`class="badge">${badge}</text>`);
		}
		expect(svg).not.toContain('All Games');
		expect(svg).not.toContain('class="description"');
	});

	it('renders a valid 1200 by 630 PNG', async () => {
		const png = await renderSharePreview(shared);
		const metadata = await sharp(png).metadata();
		expect(metadata.format).toBe('png');
		expect(metadata.width).toBe(SHARE_PREVIEW_WIDTH);
		expect(metadata.height).toBe(SHARE_PREVIEW_HEIGHT);
	});
});
