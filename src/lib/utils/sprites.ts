/**
 * Resolves the sprite URL for a given Pokémon
 * Uses local sprites stored in /static/sprites/home/
 */
export function getSpriteUrl(
	nationalDexNumber: number,
	form?: string | null,
	isShiny: boolean = false
): string {
	// Handle special cases and form sanitization
	const spriteId = nationalDexNumber.toString();
	let folderPath = '';
	let formSuffix = '';

	if (form && form !== '' && form !== 'default') {
		// Forms that should fall back to default sprite (no sprites available)
		const unsupportedForms = ['gigantamax', 'dynamax'];

		if (unsupportedForms.includes(form.toLowerCase())) {
			// Use default sprite (no form modifications)
		} else if (form.toLowerCase() === 'female') {
			// Handle special folder structures
			folderPath = 'female/';
		} else {
			// Convert other form names to sprite suffixes
			formSuffix = sanitizeFormName(form);
		}
	}

	// Handle shiny sprites
	const shinyPrefix = isShiny ? 'shiny/' : '';

	// Construct the sprite path
	const spritePath = `/sprites/home/${shinyPrefix}${folderPath}${spriteId}${formSuffix}.png`;

	return spritePath;
}

/**
 * Extracts the actual form name from complex form strings
 */
function extractFormName(form: string): string {
	if (!form) return '';
	
	// Handle patterns like "x2 (hisui)", "x3 (scizor, kleavor)", etc.
	// Extract form names from parentheses
	const parenthesesMatch = form.match(/\(([^)]+)\)/);
	if (parenthesesMatch) {
		const content = parenthesesMatch[1].toLowerCase();
		
		// Check for regional forms first
		if (content.includes('hisui')) return 'hisui';
		if (content.includes('alola')) return 'alola';
		if (content.includes('galar')) return 'galar';
		if (content.includes('paldea')) return 'paldea';
		
		// Handle gender differences
		if (content === 'male') return 'male';
		if (content === 'female') return 'female';
		
		// For complex forms like "scizor, kleavor", just return the original for now
		// These don't have specific sprites in regional forms
		return '';
	}
	
	// Handle direct form names
	const directForms = ['male', 'female', 'gigantamax', 'leaf cloak', 'east sea'];
	for (const directForm of directForms) {
		if (form.toLowerCase().includes(directForm)) {
			return directForm;
		}
	}
	
	return form.toLowerCase();
}

/**
 * Sanitizes form names to match sprite file naming conventions
 */
function sanitizeFormName(form: string): string {
	if (!form || form === 'default') return '';

	// Extract the actual form name first
	const extractedForm = extractFormName(form);
	if (!extractedForm) return '';

	// Common form name mappings
	const formMappings: Record<string, string> = {
		// Alolan forms
		alola: '-alola',
		alolan: '-alola',

		// Galarian forms
		galar: '-galar',
		galarian: '-galar',

		// Hisuian forms
		hisui: '-hisui',
		hisuian: '-hisui',

		// Paldea forms
		paldea: '-paldea',
		paldean: '-paldea',

		// Mega forms
		mega: '-mega',
		'mega-x': '-mega-x',
		'mega-y': '-mega-y',

		// Gender differences
		female: '-f',
		male: '-m',

		// Cloak/form variants
		'leaf cloak': '-plant',
		'east sea': '-east',
		
		// Common patterns
		origin: '-origin',
		sky: '-sky',
		defense: '-defense',
		attack: '-attack',
		speed: '-speed',
		plant: '-plant',
		sandy: '-sandy',
		trash: '-trash',
		heat: '-heat',
		wash: '-wash',
		frost: '-frost',
		fan: '-fan',
		mow: '-mow',

		// Size variations
		small: '-small',
		large: '-large',
		super: '-super',

		// Regional variants
		white: '-white',
		black: '-black',
		blue: '-blue',
		red: '-red',
		orange: '-orange',
		yellow: '-yellow',
		green: '-green'
	};

	// First try direct mapping
	const directMapping = formMappings[extractedForm];
	if (directMapping) {
		return directMapping;
	}

	// Fall back to sanitized form name
	return (
		'-' +
		extractedForm
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9\-]/g, '')
			.replace(/\-+/g, '-')
			.replace(/^\-|\-$/g, '')
	);
}

/**
 * Gets a placeholder sprite URL for empty box slots
 */
export function getPlaceholderSpriteUrl(): string {
	return '/sprites/home/0.png';
}

/**
 * Gets the type icon URL for a given type
 */
export function getTypeIconUrl(type: string): string {
	return `/sprites/types/${type.toLowerCase()}.png`;
}

/**
 * Preloads a sprite image to improve loading performance
 */
export function preloadSprite(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = () => reject(new Error(`Failed to load sprite: ${url}`));
		img.src = url;
	});
}

/**
 * Batch preload multiple sprites
 */
export async function preloadSprites(urls: string[]): Promise<void> {
	const promises = urls.map((url) => preloadSprite(url));
	await Promise.allSettled(promises);
}

/**
 * Gets the sprite URL with fallback handling
 */
export function getSpriteUrlWithFallback(
	nationalDexNumber: number,
	form?: string | null,
	isShiny: boolean = false
): string {
	const primaryUrl = getSpriteUrl(nationalDexNumber, form, isShiny);

	// In a real implementation, you might want to check if the file exists
	// For now, we'll return the primary URL and handle 404s in the component
	return primaryUrl;
}

/**
 * Gets the appropriate pokédex number based on the regional pokédex column name
 * Falls back to national dex number if regional number is not available
 */
export function getRegionalPokedexNumber(pokemon: any, regionalColumnName?: string | null): number {
	// If no regional column specified, use national dex number
	if (!regionalColumnName) {
		return pokemon.pokedexNumber;
	}

	// Try to get the regional number from the specified column
	const regionalNumber = pokemon[regionalColumnName];

	// Return regional number if it exists and is valid, otherwise fall back to national
	return regionalNumber && regionalNumber > 0 ? regionalNumber : pokemon.pokedexNumber;
}
