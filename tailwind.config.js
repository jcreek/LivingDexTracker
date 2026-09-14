/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{html,svelte,js,ts}',
		'./static/offline.html',
		'./static/offline-viewer.js'
	],
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
					// A slightly deeper Poké Ball red: #ee1515 gave white text only 4.3:1 contrast, below
					// the WCAG AA 4.5:1 minimum that the Lighthouse accessibility gate checks.
					primary: '#d31111',
					'primary-content': '#ffffff',
					secondary: '#ffd700',
					'secondary-content': '#ffffff',
					accent: '#3b82c4',
					// daisyUI's default info blue is too light for text on the base colours.
					info: '#0369a1',
					'info-content': '#ffffff',
					neutral: '#ffffff',
					'base-100': '#f0f0f0',
					'base-content': '#222224'
				}
			}
		]
	}
};
