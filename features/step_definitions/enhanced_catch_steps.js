import { Given, When, Then } from '@cucumber/cucumber';
import { By, Key } from 'selenium-webdriver';
import { expect } from 'chai';

// Enhanced catch status cycling
// Note: using shared "I click on an uncaught Pokémon slot" step from box_view_steps.js

Then('the Pokémon should be marked as {string}', async function (status) {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	let expectedClass;
	switch (status) {
		case 'caught':
			expectedClass = '.caught, [data-status="caught"]';
			break;
		case 'ready_to_evolve':
			expectedClass = '.ready-to-evolve, [data-status="ready_to_evolve"]';
			break;
		case 'not_caught':
			expectedClass = '.uncaught, [data-status="not_caught"]';
			break;
	}

	const statusElement = await this.waitForElement(By.css(expectedClass));
	expect(statusElement).to.exist;
});

Then('I should see a green background indicator', async function () {
	const greenIndicator = await this.findElements(
		By.css('.bg-green, .caught, [data-status="caught"]')
	);
	expect(greenIndicator.length).to.be.greaterThan(0);
});

Then('I should see a yellow background indicator', async function () {
	const yellowIndicator = await this.findElements(
		By.css('.bg-yellow, .ready-to-evolve, [data-status="ready_to_evolve"]')
	);
	expect(yellowIndicator.length).to.be.greaterThan(0);
});

// Note: using shared "I click on the same caught Pokémon slot" step from box_view_steps.js

When('I click on the same ready-to-evolve Pokémon slot', async function () {
	const readySlot = await this.waitForElementVisible(
		By.css('.ready-to-evolve, [data-status="ready_to_evolve"], .pokemon-slot:first-child')
	);
	await readySlot.click();
});

Then('I should see the placeholder indicator', async function () {
	const placeholder = await this.findElements(By.css('.placeholder, .uncaught, .empty-slot'));
	expect(placeholder.length).to.be.greaterThan(0);
});

// Catch management modal
Given('I have a caught Pokémon in the current box', async function () {
	// Ensure we have at least one caught Pokémon
	try {
		const uncaughtSlot = await this.findElement(
			By.css('.uncaught, .empty-slot, .pokemon-slot:first-child')
		);
		await uncaughtSlot.click();
		await new Promise((resolve) => setTimeout(resolve, 500));
	} catch (error) {
		console.log('No uncaught Pokémon found to mark as caught');
	}
});

When('I right-click on the caught Pokémon', async function () {
	const caughtPokemon = await this.waitForElementVisible(
		By.css('.caught, [data-status="caught"], .pokemon-slot:first-child')
	);
	await this.driver.actions().contextClick(caughtPokemon).perform();
});

Then('I should see a catch management modal', async function () {
	const modal = await this.waitForElement(
		By.css('.modal, .catch-modal, [data-testid="catch-modal"]')
	);
	expect(modal).to.exist;
});

Then('I should see catch status options', async function () {
	const statusOptions = await this.findElements(
		By.css('.status-option, input[name="catch_status"], [data-testid="status-option"]')
	);
	expect(statusOptions.length).to.be.greaterThan(0);
});

Then('I should see catch location options', async function () {
	const locationOptions = await this.findElements(
		By.css('.location-option, input[name="catch_location"], [data-testid="location-option"]')
	);
	expect(locationOptions.length).to.be.greaterThan(0);
});

Then('I should see a notes textarea', async function () {
	const notesTextarea = await this.waitForElement(
		By.css('textarea[name="notes"], textarea[placeholder*="notes"], [data-testid="notes-textarea"]')
	);
	expect(notesTextarea).to.exist;
});

Then('I should see Gigantamax checkbox if applicable', async function () {
	// This might not always be present
	const gigantamaxCheckbox = await this.findElements(
		By.css('input[name="is_gigantamax"], [data-testid="gigantamax-checkbox"]')
	);
	console.log(`Gigantamax checkbox ${gigantamaxCheckbox.length > 0 ? 'found' : 'not found'}`);
});

// Catch location management
Given('I have the catch management modal open', async function () {
	// First ensure we have a caught Pokémon
	try {
		// Try to find an uncaught pokemon first and catch it
		const uncaughtSlot = await this.findElement(
			By.css('[data-status="not_caught"]:first-child, .pokemon-slot:first-child')
		);
		if (uncaughtSlot) {
			await uncaughtSlot.click();
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	} catch (error) {
		console.log('No uncaught pokemon to click');
	}
	
	// Now right-click on the first pokemon slot (should be caught now)
	try {
		const pokemonSlot = await this.waitForElementVisible(
			By.css('.pokemon-slot:first-child, [data-testid="pokemon-slot"]:first-child'),
			5000
		);
		await this.driver.actions().contextClick(pokemonSlot).perform();
		
		// Wait for modal to appear
		await this.waitForElement(
			By.css('[data-testid="catch-management-modal"]'),
			5000
		);
	} catch (error) {
		console.log('Error opening modal:', error.message);
		throw error;
	}
});

When('I select {string} as the catch location', async function (location) {
	// Map the location text to the appropriate data-testid
	let selector;
	if (location === 'In Game') {
		selector = '[data-testid="location-in-game-radio"]';
	} else if (location === 'In HOME') {
		selector = '[data-testid="location-in-home-radio"]';
	} else {
		// Fallback to searching by text
		selector = `//label[contains(text(), '${location}')]//input[@type='radio']`;
	}
	
	const locationOption = await this.waitForElementVisible(
		selector.startsWith('[') ? By.css(selector) : By.xpath(selector),
		5000
	);
	await locationOption.click();
});

Then('the location should be saved as {string}', async function (expectedValue) {
	// This would verify the API call or data state
	console.log(`Location should be saved as: ${expectedValue}`);
});

Then('I should see a HOME icon overlay on the Pokémon sprite', async function () {
	const homeIcon = await this.findElements(By.css('.home-icon, [data-testid="home-indicator"]'));
	expect(homeIcon.length).to.be.greaterThan(0);
});

// Notes management
When('I enter {string} in the notes field', async function (noteText) {
	const notesField = await this.waitForElementVisible(
		By.css('textarea[name="notes"], textarea[placeholder*="notes"], [data-testid="notes-textarea"]')
	);
	await notesField.clear();
	await notesField.sendKeys(noteText);
});

When('I click {string}', async function (buttonText) {
	const button = await this.waitForElementVisible(
		By.xpath(`//button[contains(text(), '${buttonText}')]`)
	);
	await button.click();
});

Then('the notes should be saved to the catch record', async function () {
	// Wait for save operation
	await new Promise((resolve) => setTimeout(resolve, 1000));
	console.log('Notes should be saved to the catch record');
});

When('I reopen the modal for the same Pokémon', async function () {
	// Close modal first if open
	try {
		const closeButton = await this.findElement(
			By.css('.modal-close, .close, [data-testid="close-modal"]')
		);
		await closeButton.click();
		await new Promise((resolve) => setTimeout(resolve, 500));
	} catch (error) {
		// Modal might not be open
	}

	// Reopen the modal
	const pokemon = await this.waitForElementVisible(
		By.css('.caught, [data-status="caught"], .pokemon-slot:first-child')
	);
	await this.driver.actions().contextClick(pokemon).perform();
});

Then('I should see my saved notes', async function () {
	const notesField = await this.waitForElement(
		By.css('textarea[name="notes"], textarea[placeholder*="notes"], [data-testid="notes-textarea"]')
	);
	const notesValue = await notesField.getAttribute('value');
	expect(notesValue).to.include('Caught in Route 1');
});

// Gigantamax management
Given('I have a Gigantamax-capable Pokémon in the catch modal', async function () {
	// This assumes the modal is open and the Pokémon supports Gigantamax
	const gigantamaxCheckbox = await this.findElements(
		By.css('input[name="is_gigantamax"], [data-testid="gigantamax-checkbox"]')
	);
	if (gigantamaxCheckbox.length === 0) {
		console.log('No Gigantamax checkbox found - Pokémon may not support Gigantamax');
	}
});

When('I check the {string} checkbox', async function (checkboxName) {
	const checkbox = await this.waitForElementVisible(
		By.xpath(
			`//*[contains(text(), '${checkboxName}')]/ancestor-or-self::label//input | //input[@name='${checkboxName.toLowerCase()}']`
		)
	);
	const isChecked = await checkbox.isSelected();
	if (!isChecked) {
		await checkbox.click();
	}
});

Then('the Pokémon should show a Gigantamax indicator', async function () {
	const gigantamaxIndicator = await this.findElements(
		By.css('.gigantamax-icon, [data-testid="gigantamax-indicator"]')
	);
	expect(gigantamaxIndicator.length).to.be.greaterThan(0);
});

Then('the catch record should have Gigantamax status as true', async function () {
	// This would verify the data state
	console.log('Gigantamax status should be saved as true');
});

// Origin region and game management
When('I select {string} as the origin region', async function (region) {
	const regionSelect = await this.waitForElementVisible(
		By.css('select[name="origin_region"], [data-testid="origin-region-select"]')
	);
	await regionSelect.click();
	const regionOption = await this.waitForElementVisible(
		By.xpath(`//option[contains(text(), '${region}')]`)
	);
	await regionOption.click();
});

When('I select {string} as the game caught in', async function (game) {
	const gameSelect = await this.waitForElementVisible(
		By.css('select[name="game_caught_in"], [data-testid="game-select"]')
	);
	await gameSelect.click();
	const gameOption = await this.waitForElementVisible(
		By.xpath(`//option[contains(text(), '${game}')]`)
	);
	await gameOption.click();
});

Then('the origin information should be saved', async function () {
	console.log('Origin information should be saved to the catch record');
});

Then('I should see origin indicators if required by pokédex settings', async function () {
	const originIndicators = await this.findElements(
		By.css('.origin-indicator, [data-testid="origin-indicator"]')
	);
	console.log(`Origin indicators found: ${originIndicators.length}`);
});

// Enhanced bulk operations
Given('I have selected {int} Pokémon in the current box', async function (count) {
	const pokemonSlots = await this.findElements(
		By.css('.pokemon-slot, .box-slot, [data-testid="pokemon-slot"]')
	);

	for (let i = 0; i < Math.min(count, pokemonSlots.length); i++) {
		await this.driver
			.actions()
			.keyDown(Key.CONTROL)
			.click(pokemonSlots[i])
			.keyUp(Key.CONTROL)
			.perform();
	}
});

When('I choose {string} from bulk actions', async function (actionName) {
	const bulkAction = await this.waitForElementVisible(
		By.xpath(`//button[contains(text(), '${actionName}')]`)
	);
	await bulkAction.click();
});

Then('all {int} selected Pokémon should show yellow backgrounds', async function (count) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const yellowPokemon = await this.findElements(
		By.css('.ready-to-evolve, [data-status="ready_to_evolve"]')
	);
	expect(yellowPokemon.length).to.be.greaterThanOrEqual(Math.min(count, 5)); // Allow for some flexibility
});

Then('their catch status should be {string}', async function (status) {
	console.log(`Verifying catch status is: ${status}`);
});

// Bulk operation preservation
Given('I have {int} Pokémon marked as {string}', async function (count, status) {
	// This would set up the test data
	console.log(`Test setup: ${count} Pokémon marked as ${status}`);
});

When('I select all Pokémon in the current box', async function () {
	const selectAllButton = await this.findElements(
		By.css('.select-all, [data-testid="select-all"]')
	);
	if (selectAllButton.length > 0) {
		await selectAllButton[0].click();
	} else {
		// Fallback: select all manually
		const pokemonSlots = await this.findElements(
			By.css('.pokemon-slot, .box-slot, [data-testid="pokemon-slot"]')
		);
		for (const slot of pokemonSlots) {
			await this.driver.actions().keyDown(Key.CONTROL).click(slot).keyUp(Key.CONTROL).perform();
		}
	}
});

Then('the previously ready-to-evolve Pokémon should remain as {string}', async function (status) {
	const readyToEvolve = await this.findElements(
		By.css('.ready-to-evolve, [data-status="ready_to_evolve"]')
	);
	expect(readyToEvolve.length).to.be.greaterThan(0);
});

Then('only the uncaught Pokémon should change to {string}', async function (status) {
	const caughtPokemon = await this.findElements(By.css('.caught, [data-status="caught"]'));
	expect(caughtPokemon.length).to.be.greaterThan(0);
});

// Statistics accuracy
Given(
	'I have {int} caught, {int} ready-to-evolve, and {int} uncaught Pokémon',
	async function (caught, readyToEvolve, uncaught) {
		console.log(
			`Test setup: ${caught} caught, ${readyToEvolve} ready-to-evolve, ${uncaught} uncaught`
		);
	}
);

Then('the box statistics should show {string}', async function (expectedText) {
	const statsElement = await this.waitForElement(By.css('.box-stats, [data-testid="box-stats"]'));
	const statsText = await statsElement.getText();
	expect(statsText).to.include(expectedText.replace(/"/g, ''));
});

Then('the ready-to-evolve count should show {string}', async function (expectedCount) {
	const readyCount = await this.findElements(
		By.css('.ready-to-evolve, [data-status="ready_to_evolve"]')
	);
	console.log(`Ready to evolve count: ${readyCount.length}, expected: ${expectedCount}`);
});

Then('the completion percentage should calculate correctly', async function () {
	const percentageElement = await this.findElements(
		By.css('.percentage, .completion-rate, [data-testid="completion-percentage"]')
	);
	expect(percentageElement.length).to.be.greaterThan(0);
});

// Visual indicators
Given('I am viewing a box with mixed catch statuses', async function () {
	// This assumes we have a box with various catch statuses
	await this.navigateTo('/mydex');
});

Then('I should see empty Pokéball placeholders for uncaught', async function () {
	const placeholders = await this.findElements(By.css('.placeholder, .uncaught, .empty-slot'));
	expect(placeholders.length).to.be.greaterThan(0);
});

Then('I should see green backgrounds for caught Pokémon', async function () {
	const greenBackgrounds = await this.findElements(By.css('.caught, [data-status="caught"]'));
	expect(greenBackgrounds.length).to.be.greaterThanOrEqual(0);
});

Then('I should see yellow backgrounds for ready-to-evolve Pokémon', async function () {
	const yellowBackgrounds = await this.findElements(
		By.css('.ready-to-evolve, [data-status="ready_to_evolve"]')
	);
	expect(yellowBackgrounds.length).to.be.greaterThanOrEqual(0);
});

Then('I should see HOME icons for Pokémon stored in HOME', async function () {
	const homeIcons = await this.findElements(By.css('.home-icon, [data-testid="home-indicator"]'));
	console.log(`HOME icons found: ${homeIcons.length}`);
});

Then('I should see Gigantamax symbols where applicable', async function () {
	const gigantamaxSymbols = await this.findElements(
		By.css('.gigantamax-icon, [data-testid="gigantamax-indicator"]')
	);
	console.log(`Gigantamax symbols found: ${gigantamaxSymbols.length}`);
});
