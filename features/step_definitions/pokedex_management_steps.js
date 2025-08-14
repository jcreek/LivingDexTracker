import { Given, When, Then } from '@cucumber/cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

// Navigation steps
When('I navigate to the pokédexes page', async function () {
	await this.navigateToProtected('/pokedexes');
});

Then('I should see the pokédexes page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.includes('/pokedexes');
	}, 10000);
});

Then('I should see a list of available regional pokédexes', async function () {
	// Look for pokédex cards using data-testid
	const pokedexElements = await this.waitForElement(By.css('[data-testid="pokedex-card"]'));
	expect(pokedexElements).to.exist;
});

Then('I should see completion statistics for each pokédex', async function () {
	// Look for statistics using data-testid
	const statsElements = await this.findElements(
		By.css('[data-testid="box-stats"], .progress, .stats')
	);
	expect(statsElements.length).to.be.greaterThan(0);
});

// Create pokédex page navigation
Given('I am on the pokédexes page', async function () {
	await this.navigateToProtected('/pokedexes');
});

// Removed duplicate - using shared button click step from box_view_steps.js

Then('I should be on the create pokédex page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.includes('/pokedexes/create');
	}, 10000);
});

Then('I should see the pokédex creation form', async function () {
	const form = await this.waitForElement(By.css('[data-testid="create-pokedex-form"]'));
	expect(form).to.exist;
});

// Form field checks
Given('I am on the create pokédex page', async function () {
	await this.navigateToProtected('/pokedexes/create');
});

Then('I should see a {string} input field', async function (fieldName) {
	if (fieldName.toLowerCase().includes('name')) {
		const input = await this.waitForElement(By.css('[data-testid="pokedex-name-input"]'));
		expect(input).to.exist;
	} else {
		const input = await this.waitForElement(
			By.css(`input[name="${fieldName.toLowerCase()}"], input[placeholder*="${fieldName}"]`)
		);
		expect(input).to.exist;
	}
});

Then('I should see a {string} textarea', async function (fieldName) {
	const textarea = await this.waitForElement(
		By.css(`textarea[name="${fieldName.toLowerCase()}"], textarea[placeholder*="${fieldName}"]`)
	);
	expect(textarea).to.exist;
});

Then('I should see regional pokédex selection options', async function () {
	const regionOptions = await this.findElements(
		By.css(
			'[data-testid="national-pokedex-radio"], [data-testid="regional-pokedex-radio"], [data-testid="regional-pokedex-select"]'
		)
	);
	expect(regionOptions.length).to.be.greaterThan(0);
});

Then('I should see challenge type checkboxes', async function () {
	const challengeOptions = await this.findElements(
		By.css(
			'[data-testid="shiny-hunt-checkbox"], [data-testid="origin-required-checkbox"], [data-testid="include-forms-checkbox"]'
		)
	);
	expect(challengeOptions.length).to.be.greaterThan(0);
});

// Region selection
When('I select the {string} pokédex option', async function (regionName) {
	if (regionName.toLowerCase().includes('national')) {
		const regionOption = await this.waitForElementVisible(
			By.css('[data-testid="national-pokedex-radio"]')
		);
		await regionOption.click();
	} else if (regionName.toLowerCase().includes('regional')) {
		const regionOption = await this.waitForElementVisible(
			By.css('[data-testid="regional-pokedex-radio"]')
		);
		await regionOption.click();
	} else {
		const regionOption = await this.waitForElementVisible(
			By.xpath(
				`//*[contains(text(), '${regionName}')]/ancestor-or-self::label//input | //*[contains(text(), '${regionName}')]/input`
			)
		);
		await regionOption.click();
	}
});

// Removed duplicate step definition

Then('both regional options should be selected', async function () {
	const selectedOptions = await this.findElements(By.css('input[type="checkbox"]:checked'));
	expect(selectedOptions.length).to.be.greaterThanOrEqual(2);
});

// Challenge options
When('I check the {string} option', async function (optionName) {
	let selector;
	if (optionName.toLowerCase().includes('shiny')) {
		selector = '[data-testid="shiny-hunt-checkbox"]';
	} else if (optionName.toLowerCase().includes('origin')) {
		selector = '[data-testid="origin-required-checkbox"]';
	} else if (optionName.toLowerCase().includes('form')) {
		selector = '[data-testid="include-forms-checkbox"]';
	} else {
		selector = `//label[contains(text(), '${optionName}')]//input`;
	}

	const option = await this.waitForElementVisible(
		selector.startsWith('//') ? By.xpath(selector) : By.css(selector)
	);
	const isChecked = await option.isSelected();
	if (!isChecked) {
		await option.click();
	}
});

Then('both challenge options should be enabled', async function () {
	const checkedChallenges = await this.findElements(By.css('input[type="checkbox"]:checked'));
	expect(checkedChallenges.length).to.be.greaterThanOrEqual(2);
});

// Navigation back
When('I click the back button or navigate to pokédexes', async function () {
	try {
		// Try to find the back button using data-testid
		const backButton = await this.findElement(By.css('[data-testid="back-to-pokedexes-button"]'));
		await backButton.click();
	} catch (error) {
		// If no back button, navigate directly
		await this.navigateToProtected('/pokedexes');
	}
});

// Statistics display
Then('I should see progress bars for completion percentages', async function () {
	const progressBars = await this.findElements(
		By.css('.progress, .progress-bar, [role="progressbar"]')
	);
	expect(progressBars.length).to.be.greaterThan(0);
});

Then(
	'I should see {string}, {string}, and {string} statistics',
	async function (stat1, stat2, stat3) {
		const statsText = await this.getText(By.css('body'));
		expect(statsText.toLowerCase()).to.include(stat1.toLowerCase());
		expect(statsText.toLowerCase()).to.include(stat2.toLowerCase());
		expect(statsText.toLowerCase()).to.include(stat3.toLowerCase());
	}
);
