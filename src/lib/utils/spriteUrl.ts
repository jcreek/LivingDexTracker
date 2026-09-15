/** Folder holding every sprite; paths in static/sprites-small/manifest.json are relative to it. */
export function spriteRoot(useLocalSprites: boolean): string {
	return useLocalSprites
		? '/sprites-small/home'
		: 'https://raw.githubusercontent.com/jcreek/LivingDexTracker/master/static/sprites-small/home';
}

export function resolveSpriteUrl(
	entry: { pokedexNumber: number; form?: string; spriteKey?: string },
	shiny: boolean,
	useLocalSprites: boolean
): string {
	const form = entry.form?.trim() ?? '';
	const strippedNumber = String(entry.pokedexNumber).replace(/^0+/, '') || '0';
	let key = entry.spriteKey?.trim();

	if (!key) {
		let formKey = form
			.replace(/^female[-\s]*/i, '')
			.replace(/\s*\(.*?\)/g, '')
			.replace(/\s*\[.*?\]/g, '')
			.trim();
		if (!formKey || formKey.toLowerCase() === 'male') {
			key = strippedNumber;
		} else {
			formKey = formKey
				.toLowerCase()
				.replace(/%/g, '')
				.replace(/\balolan\b/g, 'alola')
				.replace(/\bgalarian\b/g, 'galar')
				.replace(/\bhisuian\b/g, 'hisui')
				.replace(/\bpaldean\b/g, 'paldea')
				.replace(/\bform(e)?$/, '')
				.replace(/\bability$/, '')
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '')
				.replace(/2/g, 'two')
				.replace(/3/g, 'three')
				.replace(/4/g, 'four');
			key = formKey ? `${strippedNumber}-${formKey}` : strippedNumber;
		}
	}

	let root = spriteRoot(useLocalSprites);
	if (shiny) root += '/shiny';
	if (/^female\b/i.test(form)) root += '/female';
	return `${root}/${key}.webp`;
}

/** Grid assets use a separate immutable URL space; detail resolution is unchanged. */
export function resolveGridSpriteUrl(
	entry: { pokedexNumber: number; form?: string; spriteKey?: string },
	shiny: boolean
): string {
	return resolveSpriteUrl(entry, shiny, true).replace(
		'/sprites-small/home/',
		'/sprites-grid/v1/home/'
	);
}
