/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/routes/**/*.{svelte,js,ts}', './src/lib/components/**/*.{svelte,js,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['light', 'dark', 'dracula']
	}
};
