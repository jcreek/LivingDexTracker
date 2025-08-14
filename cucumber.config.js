export default {
	default: {
		paths: ['features/*.feature'],
		import: ['features/step_definitions/*.js', 'features/support/*.js'],
		format: ['progress', 'json:reports/cucumber_report.json'],
		formatOptions: {
			snippetInterface: 'async-await'
		},
		publishQuiet: true,
		dryRun: false,
		parallel: 4,
		retry: 0 // Reduced from 1 for speed
	},
	smoke: {
		paths: ['features/authentication.feature', 'features/pokedex_management.feature'],
		import: ['features/step_definitions/*.js', 'features/support/*.js'],
		format: ['progress'],
		formatOptions: {
			snippetInterface: 'async-await'
		},
		publishQuiet: true,
		parallel: 4,
		retry: 0
	},
	fast: {
		paths: ['features/authentication.feature'], // Just one feature for quick testing
		import: ['features/step_definitions/*.js', 'features/support/*.js'],
		format: ['progress'],
		formatOptions: {
			snippetInterface: 'async-await'
		},
		publishQuiet: true,
		parallel: 4,
		retry: 0
	}
};
