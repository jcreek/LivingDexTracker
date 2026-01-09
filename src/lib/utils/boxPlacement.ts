/**
 * Calculate box placement for Pokémon based on their position in a sorted list
 *
 * Box layout: 6 columns × 5 rows = 30 Pokémon per box
 *
 * @param index - Zero-based index in the sorted list
 * @returns Box placement with box number, row, and column (1-indexed)
 */
export function calculateBoxPlacement(index: number): {
	box: number;
	row: number;
	column: number;
} {
	const POKEMON_PER_BOX = 30;
	const COLUMNS_PER_BOX = 6;
	const ROWS_PER_BOX = 5;

	// Calculate which box this Pokémon belongs to (1-indexed)
	const box = Math.floor(index / POKEMON_PER_BOX) + 1;

	// Calculate position within the box (0-indexed)
	const positionInBox = index % POKEMON_PER_BOX;

	// Calculate row and column (1-indexed)
	const row = Math.floor(positionInBox / COLUMNS_PER_BOX) + 1;
	const column = (positionInBox % COLUMNS_PER_BOX) + 1;

	return { box, row, column };
}

/**
 * Calculate all unique box numbers needed for a list of Pokémon
 *
 * @param count - Total number of Pokémon
 * @returns Array of box numbers (1-indexed)
 */
export function calculateBoxNumbers(count: number): number[] {
	const POKEMON_PER_BOX = 30;
	const totalBoxes = Math.ceil(count / POKEMON_PER_BOX);
	return Array.from({ length: totalBoxes }, (_, i) => i + 1);
}
