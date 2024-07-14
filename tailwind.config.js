/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/routes/**/*.{svelte,js,ts}', './src/lib/components/**/*.{svelte,js,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			'light',
			'dark',
			'dracula',
			{
				pokeball: {
					primary: '#ee1515',
					'primary-content': '#ffffff',
					secondary: '#ffd700',
					'secondary-content': '#ffffff',
					accent: '#3b82c4',
					neutral: '#ffffff',
					'base-100': '#f0f0f0',
					'base-content': '#222224'
				}
			}
		]
	}
};
