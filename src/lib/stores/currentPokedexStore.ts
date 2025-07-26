import { writable } from 'svelte/store';
import type { UserPokedex } from '$lib/models/UserPokedex';

export const currentPokedex = writable<UserPokedex | null>(null);
export const userPokedexes = writable<UserPokedex[]>([]);

export async function loadUserPokedexes() {
	try {
		const response = await fetch('/api/pokedexes');
		const { pokedexes } = await response.json();
		userPokedexes.set(pokedexes);
		
		// Set first pokédex as current if none selected
		currentPokedex.subscribe((current) => {
			if (!current && pokedexes.length > 0) {
				currentPokedex.set(pokedexes[0]);
			}
		});
		
		return pokedexes;
	} catch (error) {
		console.error('Failed to load pokédexes:', error);
		return [];
	}
}
