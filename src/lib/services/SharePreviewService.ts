import sharp from 'sharp';
import type { SharedPokedexData } from '$lib/models/SharedPokedex';

export const SHARE_PREVIEW_WIDTH = 1200;
export const SHARE_PREVIEW_HEIGHT = 630;

export function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

export function truncatePreviewText(value: string, maximumLength: number): string {
	const normalized = value.replace(/\s+/g, ' ').trim();
	if (normalized.length <= maximumLength) return normalized;
	return `${normalized.slice(0, Math.max(0, maximumLength - 1)).trimEnd()}…`;
}

function previewBadges(shared: SharedPokedexData): string[] {
	return [
		shared.isLivingDex && 'Living',
		shared.isShinyDex && 'Shiny',
		shared.isOriginDex && 'Origin',
		shared.isFormDex && 'Form',
		shared.gameScope || 'All Games'
	].filter((value): value is string => Boolean(value));
}

export function buildSharePreviewSvg(shared: SharedPokedexData): string {
	const name = escapeXml(truncatePreviewText(shared.name, 48));
	const description = escapeXml(truncatePreviewText(shared.description, 92));
	const badges = previewBadges(shared).slice(0, 5);
	const badgeMarkup = badges
		.map((badge, index) => {
			const label = escapeXml(truncatePreviewText(badge, 22));
			const width = Math.max(112, Math.min(220, 44 + badge.length * 15));
			const previousWidth = badges
				.slice(0, index)
				.reduce((sum, value) => sum + Math.max(112, Math.min(220, 44 + value.length * 15)) + 16, 0);
			return `<g transform="translate(${76 + previousWidth} 270)">
				<rect width="${width}" height="52" rx="26" fill="#fee2e2" />
				<text x="${width / 2}" y="34" text-anchor="middle" class="badge">${label}</text>
			</g>`;
		})
		.join('');
	const progressWidth = Math.round(
		(870 * Math.min(100, Math.max(0, shared.completionPercentage))) / 100
	);

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${SHARE_PREVIEW_WIDTH}" height="${SHARE_PREVIEW_HEIGHT}" viewBox="0 0 ${SHARE_PREVIEW_WIDTH} ${SHARE_PREVIEW_HEIGHT}">
		<defs>
			<linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#7f1d1d" />
				<stop offset="1" stop-color="#dc2626" />
			</linearGradient>
		</defs>
		<style>
			.title { font: 700 64px system-ui, -apple-system, sans-serif; fill: #fff; }
			.description { font: 400 27px system-ui, -apple-system, sans-serif; fill: #fecaca; }
			.badge { font: 650 22px system-ui, -apple-system, sans-serif; fill: #991b1b; }
			.progress { font: 750 52px system-ui, -apple-system, sans-serif; fill: #fff; }
			.percent { font: 800 82px system-ui, -apple-system, sans-serif; fill: #fff; }
			.brand { font: 650 24px system-ui, -apple-system, sans-serif; fill: #fecaca; letter-spacing: 1px; }
		</style>
		<rect width="1200" height="630" fill="url(#background)" />
		<circle cx="1070" cy="90" r="190" fill="#fff" opacity=".08" />
		<circle cx="1070" cy="90" r="62" fill="none" stroke="#fff" stroke-width="26" opacity=".16" />
		<path d="M880 90h380" stroke="#fff" stroke-width="26" opacity=".16" />
		<text x="76" y="118" class="brand">LIVING DEX TRACKER</text>
		<text x="76" y="205" class="title">${name}</text>
		${description ? `<text x="76" y="246" class="description">${description}</text>` : ''}
		${badgeMarkup}
		<text x="76" y="425" class="progress">${shared.caught} of ${shared.total} Pokémon caught</text>
		<text x="1090" y="425" text-anchor="end" class="percent">${shared.completionPercentage}%</text>
		<rect x="76" y="472" width="870" height="28" rx="14" fill="#450a0a" opacity=".65" />
		<rect x="76" y="472" width="${progressWidth}" height="28" rx="14" fill="#fff" />
		<text x="76" y="574" class="brand">pokedex.jcreek.co.uk</text>
	</svg>`;
}

export async function renderSharePreview(shared: SharedPokedexData): Promise<Buffer> {
	return sharp(Buffer.from(buildSharePreviewSvg(shared)))
		.png()
		.toBuffer();
}
