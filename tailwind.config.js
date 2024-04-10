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
					secondary: '#3b82c4',
					'secondary-content': '#ffffff',
					accent: '#7e308e',
					neutral: '#ffffff',
					'base-100': '#f0f0f0',
					'base-content': '#222224'
				}
			}
		]
	}
};
