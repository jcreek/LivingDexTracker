import reporter from 'cucumber-html-reporter';
import { existsSync } from 'fs';

const options = {
	theme: 'bootstrap',
	jsonFile: 'reports/cucumber_report.json',
	output: 'reports/cucumber_report.html',
	reportSuiteAsScenarios: true,
	scenarioTimestamp: true,
	launchReport: false,
	metadata: {
		'App Version': '1.0.0',
		'Test Environment': 'Local Development',
		Browser: 'Chrome',
		Platform: process.platform,
		Parallel: 'Scenarios',
		Executed: new Date().toLocaleString()
	}
};

// Check if JSON report exists
if (existsSync(options.jsonFile)) {
	reporter.generate(options);
	console.log('✅ HTML test report generated at:', options.output);
} else {
	console.log('❌ No JSON report found. Run tests first.');
}
