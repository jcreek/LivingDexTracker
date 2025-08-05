/**
 * Resolves the sprite URL for a given Pokémon
 * Uses local sprites stored in /static/sprites/home/
 */
export function getSpriteUrl(nationalDexNumber: number, form?: string | null, isShiny: boolean = false): string {
	// Handle special cases and form sanitization
	let spriteId = nationalDexNumber.toString().padStart(4, '0');
	let formSuffix = '';

	if (form && form !== '' && form !== 'default') {
		// Convert form names to sprite suffixes
		formSuffix = sanitizeFormName(form);
	}

	// Handle shiny sprites
	const shinyPrefix = isShiny ? 'shiny/' : '';
	
	// Construct the sprite path
	const spritePath = `/sprites/home/${shinyPrefix}${spriteId}${formSuffix}.png`;
	
	return spritePath;
}

/**
 * Sanitizes form names to match sprite file naming conventions
 */
function sanitizeFormName(form: string): string {
	if (!form || form === 'default') return '';
	
	// Common form name mappings
	const formMappings: Record<string, string> = {
		// Alolan forms
		'alola': '-alola',
		'alolan': '-alola',
		
		// Galarian forms
		'galar': '-galar',
		'galarian': '-galar',
		
		// Hisuian forms
		'hisui': '-hisui',
		'hisuian': '-hisui',
		
		// Paldea forms
		'paldea': '-paldea',
		'paldean': '-paldea',
		
		// Mega forms
		'mega': '-mega',
		'mega-x': '-mega-x',
		'mega-y': '-mega-y',
		
		// Gender differences
		'female': '-f',
		'male': '-m',
		
		// Common patterns
		'origin': '-origin',
		'sky': '-sky',
		'defense': '-defense',
		'attack': '-attack',
		'speed': '-speed',
		'plant': '-plant',
		'sandy': '-sandy',
		'trash': '-trash',
		'heat': '-heat',
		'wash': '-wash',
		'frost': '-frost',
		'fan': '-fan',
		'mow': '-mow',
		
		// Size variations
		'small': '-small',
		'large': '-large',
		'super': '-super',
		
		// Regional variants
		'white': '-white',
		'black': '-black',
		'blue': '-blue',
		'red': '-red',
		'orange': '-orange',
		'yellow': '-yellow',
		'green': '-green',
	};

	// First try direct mapping
	const directMapping = formMappings[form.toLowerCase()];
	if (directMapping) {
		return directMapping;
	}

	// Fall back to sanitized form name
	return '-' + form.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9\-]/g, '')
		.replace(/\-+/g, '-')
		.replace(/^\-|\-$/g, '');
}

/**
 * Gets a placeholder sprite URL for empty box slots
 */
export function getPlaceholderSpriteUrl(): string {
	return '/sprites/pokeball-placeholder.png';
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
	const promises = urls.map(url => preloadSprite(url));
	await Promise.allSettled(promises);
}

/**
 * Gets the sprite URL with fallback handling
 */
export function getSpriteUrlWithFallback(nationalDexNumber: number, form?: string | null, isShiny: boolean = false): string {
	const primaryUrl = getSpriteUrl(nationalDexNumber, form, isShiny);
	
	// In a real implementation, you might want to check if the file exists
	// For now, we'll return the primary URL and handle 404s in the component
	return primaryUrl;
}