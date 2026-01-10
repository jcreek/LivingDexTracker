import { writable } from 'svelte/store';

type Theme = 'pokeball' | 'dark';

const STORAGE_KEY = 'theme';

function createThemeStore() {
	// Get stored theme from localStorage or default to 'pokeball'
	const storedTheme = (typeof window !== 'undefined' &&
		localStorage.getItem(STORAGE_KEY)) as Theme | null;
	const initialTheme: Theme = storedTheme || 'pokeball';

	const { subscribe, set, update } = writable<Theme>(initialTheme);

	return {
		subscribe,
		set,
		toggle: () => update((theme) => (theme === 'pokeball' ? 'dark' : 'pokeball')),
		init: () => {
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
				if (stored) {
					set(stored);
				}
			}
		}
	};
}

export const theme = createThemeStore();

// Helper function to apply theme to HTML element
export function applyTheme(themeValue: Theme) {
	if (typeof document !== 'undefined') {
		document.documentElement.setAttribute('data-theme', themeValue);
	}
}
