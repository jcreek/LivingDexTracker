import { writable } from 'svelte/store';

type Theme = 'pokeball' | 'dark';

const STORAGE_KEY = 'theme';

function isTheme(type: string): type is Theme {
	return type === 'pokeball' || type === 'dark';
}

function createThemeStore() {
	// Get stored theme from localStorage or default to 'pokeball'
	let initialTheme: Theme = 'pokeball';
	if (typeof window !== 'undefined') {
		try {
			const storedTheme = localStorage.getItem(STORAGE_KEY);
			if (storedTheme && isTheme(storedTheme)) {
				initialTheme = storedTheme;
			}
		} catch {
			// ignore (privacy mode / disabled storage)
		}
	}

	const { subscribe, set: writableSet, update } = writable<Theme>(initialTheme);

	return {
		subscribe,
		set: (value: Theme) => {
			if (isTheme(value)) {
				writableSet(value);
				if (typeof window !== 'undefined') {
					try {
						localStorage.setItem(STORAGE_KEY, value);
					} catch {
						// ignore (privacy mode / disabled storage)
					}
				}
			}
		},
		toggle: () => {
			update((theme) => {
				const newTheme = theme === 'pokeball' ? 'dark' : 'pokeball';
				if (typeof window !== 'undefined') {
					try {
						localStorage.setItem(STORAGE_KEY, newTheme);
					} catch {
						// ignore (privacy mode / disabled storage)
					}
				}
				return newTheme;
			});
		},
		init: () => {
			if (typeof window !== 'undefined') {
				try {
					const stored = localStorage.getItem(STORAGE_KEY);
					if (stored && isTheme(stored)) {
						writableSet(stored);
					}
				} catch {
					// ignore (privacy mode / disabled storage)
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
