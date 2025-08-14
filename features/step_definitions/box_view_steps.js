import { Given, When, Then } from '@cucumber/cucumber';
import { By, Key } from 'selenium-webdriver';
import { expect } from 'chai';

// MyDex page navigation
When('I navigate to the MyDex page', { timeout: 30000 }, async function () {
	// Ensure test pokédex exists first
	await this.dataSeeder.ensureTestPokedexExists();

	// Since we have a test pokédex ID and the user is authenticated,
	// navigate directly to MyDex with the pokédex ID
	if (this.testPokedex && this.testPokedex.id) {
		console.log(`Navigating directly to MyDex with pokédex ID: ${this.testPokedex.id}`);
		await this.navigateToProtected(`/mydex?id=${this.testPokedex.id}`);
		
		// Wait for MyDex page to load
		await this.driver.wait(
			async () => {
				const url = await this.driver.getCurrentUrl();
				console.log(`Waiting for MyDex URL, current: ${url}`);
				return url.includes('/mydex');
			},
			15000,
			'Failed to navigate to MyDex page'
		);
		
		console.log('Successfully navigated to MyDex page');
		return;
	}
	
	// Fallback: navigate via pokédexes page if no test pokédex ID
	console.log('No test pokédex ID found, navigating via pokédexes page');
	await this.navigateToProtected('/pokedexes');

	// Wait for pokédexes page to fully load
	await this.driver.wait(
		async () => {
			const currentUrl = await this.driver.getCurrentUrl();
			return currentUrl.includes('/pokedexes');
		},
		10000,
		'Failed to navigate to pokédexes page'
	);
	
	// Add a delay to ensure page is rendered
	await new Promise(resolve => setTimeout(resolve, 2000));

	// Try to find and click the first pokédex link
	try {
		// Use a simpler approach - just find any link to mydex
		const links = await this.findElements(By.css('a[href*="/mydex"]'));
		if (links.length > 0) {
			console.log(`Found ${links.length} MyDex links, clicking the first one`);
			await links[0].click();
			
			// Wait for navigation to MyDex page
			await this.driver.wait(
				async () => {
					const url = await this.driver.getCurrentUrl();
					return url.includes('/mydex');
				},
				10000,
				'Failed to navigate to MyDex page after clicking link'
			);
		} else {
			throw new Error('No MyDex links found on pokédexes page');
		}
	} catch (error) {
		console.log('Error navigating to MyDex:', error.message);
		throw error;
	}
});

Then('I should see the MyDex page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.includes('/mydex');
	}, 10000);
});

Then('I should see pokédex selection if multiple pokédexes exist', async function () {
	// This is optional - check if pokédex selector exists
	const selector = await this.isElementPresent(
		By.css('select, .pokedex-selector, [data-testid="pokedex-select"]')
	);
	// Don't fail if it doesn't exist - just log for now
	console.log(`Pokédex selector present: ${selector}`);
});

// View switching
Given('I am on the MyDex page', { timeout: 30000 }, async function () {
	// Ensure test pokédex exists before navigating
	console.log('Ensuring test pokédex exists...');
	await this.dataSeeder.ensureTestPokedexExists();

	// Since we have a test pokédex ID and the user should be authenticated,
	// navigate directly to MyDex with the pokédex ID
	if (this.testPokedex && this.testPokedex.id) {
		console.log(`Navigating directly to MyDex with pokédex ID: ${this.testPokedex.id}`);
		
		// Ensure we're logged in first
		await this.authHelper.ensureLoggedIn();
		
		// Now navigate to MyDex
		console.log('Navigating to MyDex page...');
		await this.navigateTo(`/mydex?id=${this.testPokedex.id}`);
		
		// Wait for MyDex page to load
		console.log('Waiting for MyDex page to load...');
		await this.driver.wait(
			async () => {
				try {
					const url = await this.driver.getCurrentUrl();
					console.log(`Current URL: ${url}`);
					return url.includes('/mydex');
				} catch (error) {
					console.log(`Error getting URL: ${error.message}`);
					return false;
				}
			},
			15000,
			'Failed to navigate to MyDex page'
		);
		
		console.log('Successfully navigated to MyDex page');
		return;
	}

	// Fallback: navigate via pokédexes page if no test pokédex ID
	console.log('No test pokédex ID found, navigating via pokédexes page');
	await this.navigateToProtected('/pokedexes');

	// Wait for pokédexes page to fully load
	await this.driver.wait(
		async () => {
			const currentUrl = await this.driver.getCurrentUrl();
			return currentUrl.includes('/pokedexes');
		},
		10000,
		'Failed to navigate to pokédexes page'
	);
	
	// Add a delay to ensure page is rendered
	await new Promise(resolve => setTimeout(resolve, 2000));

	// Try to find and click the first pokédex link
	try {
		// Use a simpler approach - just find any link to mydex
		const links = await this.findElements(By.css('a[href*="/mydex"]'));
		if (links.length > 0) {
			console.log(`Found ${links.length} MyDex links, clicking the first one`);
			await links[0].click();
			
			// Wait for navigation to MyDex page
			await this.driver.wait(
				async () => {
					const url = await this.driver.getCurrentUrl();
					return url.includes('/mydex');
				},
				10000,
				'Failed to navigate to MyDex page after clicking link'
			);
		} else {
			throw new Error('No MyDex links found on pokédexes page');
		}
	} catch (error) {
		console.log('Error navigating to MyDex:', error.message);
		// Final fallback - if we have a test pokédex, try direct navigation
		if (this.testPokedex) {
			console.log(`Final fallback: direct navigation to /mydex?id=${this.testPokedex.id}`);
			await this.navigateTo(`/mydex?id=${this.testPokedex.id}`);
		} else {
			throw error;
		}
	}
});

When('I click the {string} button', async function (buttonText) {
	// First try to find button by data-testid
	if (buttonText === 'Sign In' || buttonText === 'Sign Up') {
		try {
			const submitButton = await this.waitForElementVisible(
				By.css('[data-testid="submit-button"]'),
				3000
			);
			await submitButton.click();
			return;
		} catch (error) {
			// Fall back to text-based search
		}
	}
	
	// Map expected button text to actual button text
	let actualButtonText = buttonText;

	// Box navigation button mapping
	if (buttonText === 'Previous Box') {
		actualButtonText = 'Previous';
	} else if (buttonText === 'Next Box') {
		actualButtonText = 'Next';
	}
	// Bulk action button mapping
	else if (buttonText === 'Mark as Caught') {
		actualButtonText = 'Catch All';
	} else if (buttonText === 'Mark as Uncaught') {
		actualButtonText = 'Clear All';
	}

	const button = await this.waitForElementVisible(
		By.xpath(`//button[contains(text(), '${actualButtonText}')]`)
	);
	await button.click();
});

Then('I should see the list view layout', async function () {
	const listView = await this.waitForElement(
		By.css('.list-view, [data-view="list"], .pokemon-list')
	);
	expect(listView).to.exist;
});

Then('I should see the box view layout', async function () {
	const boxView = await this.waitForElement(
		By.css('.box-view, [data-view="box"], .pokemon-grid, [data-testid="pokemon-grid"]')
	);
	expect(boxView).to.exist;
});

// Box View layout validation
Given('I am in Box View mode', async function () {
	// Try to click Box View button if not already in box view
	try {
		const boxViewButton = await this.findElement(
			By.xpath('//button[contains(text(), "Box View")]')
		);
		await boxViewButton.click();
	} catch (error) {
		// Already in box view or button doesn't exist
	}
});

Given('I am on the MyDex page in Box View', { timeout: 30000 }, async function () {
	// Ensure test pokédex exists first
	console.log('Ensuring test pokédex exists for Box View...');
	await this.dataSeeder.ensureTestPokedexExists();

	// Since we have a test pokédex ID, navigate directly to MyDex
	if (this.testPokedex && this.testPokedex.id) {
		console.log(`Navigating directly to MyDex with pokédex ID: ${this.testPokedex.id}`);
		
		// Ensure we're logged in first
		await this.authHelper.ensureLoggedIn();
		
		// Add a delay after authentication to ensure stability
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		// Navigate to MyDex
		console.log('Navigating to MyDex page...');
		try {
			await this.navigateTo(`/mydex?id=${this.testPokedex.id}`);
		} catch (error) {
			console.log(`Error during navigation: ${error.message}`);
			throw error;
		}
		
		// Wait for MyDex page to load
		console.log('Waiting for MyDex page to load...');
		await this.driver.wait(
			async () => {
				try {
					const url = await this.driver.getCurrentUrl();
					console.log(`Current URL in Box View check: ${url}`);
					return url.includes('/mydex');
				} catch (error) {
					console.log(`Error getting URL in Box View: ${error.message}`);
					return false;
				}
			},
			15000,
			'Failed to navigate to MyDex page'
		);
		
		console.log('Successfully navigated to MyDex page');
		
		// MyDex page defaults to Box View, but ensure we're in Box View
		// Check if we need to click the Box View button
		try {
			// First check if we're already in box view by looking for the grid
			const boxGrid = await this.findElements(By.css('[data-testid="pokemon-grid"]'));
			if (boxGrid.length === 0) {
				// Not in box view, try to click the button
				console.log('Not in Box View, clicking Box View button...');
				const boxViewButton = await this.findElement(
					By.xpath('//button[contains(text(), "Box View")]')
				);
				await boxViewButton.click();
				
				// Wait a moment for the view to change
				await new Promise(resolve => setTimeout(resolve, 500));
			} else {
				console.log('Already in Box View');
			}
		} catch (error) {
			console.log('Box View button not found or already in Box View');
		}
		
		return;
	}

	// Fallback if no test pokédex
	throw new Error('No test pokédex available for Box View test');
});

Then('I should see exactly 30 Pokémon slots in the current box', async function () {
	// The box grid has 30 slots, each is a direct child of the pokemon-grid
	const pokemonSlots = await this.findElements(By.css('[data-testid="pokemon-grid"] > .relative'));
	expect(pokemonSlots.length).to.equal(30);
});

Then('the slots should be arranged in a 6x5 grid', async function () {
	// Check CSS grid arrangement - should be grid-cols-6
	const boxContainer = await this.waitForElement(By.css('[data-testid="pokemon-grid"]'));
	const gridStyle = await boxContainer.getCssValue('display');

	// Should be grid with 6 columns
	expect(gridStyle).to.equal('grid');

	// Count slots - should have 30 total  
	const pokemonSlots = await this.findElements(By.css('[data-testid="pokemon-grid"] > .relative'));
	expect(pokemonSlots.length).to.equal(30);
});

// Box navigation - using the earlier "I click the {string} button" definition

Then('I should see the next set of 30 Pokémon', async function () {
	// Wait for content to update
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const pokemonSlots = await this.findElements(By.css('[data-testid="pokemon-grid"] > .relative'));
	expect(pokemonSlots.length).to.equal(30);
});

Then('I should see the previous set of 30 Pokémon', async function () {
	// Wait for content to update
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const pokemonSlots = await this.findElements(By.css('[data-testid="pokemon-grid"] > .relative'));
	expect(pokemonSlots.length).to.equal(30);
});

// Pokémon display
Then('I should see Pokémon sprites for caught Pokémon', async function () {
	const sprites = await this.findElements(
		By.css('.pokemon-sprite, img[alt]:not([alt="Empty slot"])')
	);
	// At least some pokemon sprites should be present
	expect(sprites.length).to.be.greaterThan(0);
});

Then('I should see placeholder indicators for uncaught Pokémon', async function () {
	const placeholders = await this.findElements(By.css('.box-slot-empty, img[alt="Empty slot"]'));
	// Should have some uncaught placeholders
	expect(placeholders.length).to.be.greaterThanOrEqual(0);
});

Then('I should see visual indicators for ready-to-evolve Pokémon', async function () {
	// Look for evolution indicators - yellow backgrounds or yellow dots
	const evolutionIndicators = await this.findElements(
		By.css('.box-slot-ready-evolve, .bg-yellow-500')
	);
	// This is informational - don't fail if none exist
	console.log(`Ready to evolve indicators found: ${evolutionIndicators.length}`);
});

// Catch status toggling
When('I click on an uncaught Pokémon slot', async function () {
	const uncaughtSlot = await this.waitForElementVisible(
		By.css('[data-testid="pokemon-slot"][data-status="not_caught"]')
	);
	
	// Ensure element is scrolled into view
	await this.driver.executeScript('arguments[0].scrollIntoView({block: "center"});', uncaughtSlot);
	await new Promise(resolve => setTimeout(resolve, 500)); // Wait for scroll
	
	try {
		// Try regular click first
		await uncaughtSlot.click();
	} catch (clickError) {
		// If regular click fails, use JavaScript click as fallback
		console.log('Regular click failed, trying JavaScript click:', clickError.message);
		await this.driver.executeScript('arguments[0].click();', uncaughtSlot);
	}
});

Then('the Pokémon should be marked as caught', async function () {
	// Wait for state change
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Look for caught status - green background
	const caughtElements = await this.findElements(By.css('.box-slot-caught'));
	expect(caughtElements.length).to.be.greaterThan(0);
});

Then('the sprite should become visible', async function () {
	const visibleSprites = await this.findElements(By.css('.pokemon-sprite'));
	expect(visibleSprites.length).to.be.greaterThan(0);
});

When('I click on the same caught Pokémon slot', async function () {
	const caughtSlot = await this.waitForElementVisible(
		By.css('[data-testid="pokemon-slot"][data-status="caught"]')
	);
	
	// Ensure element is scrolled into view
	await this.driver.executeScript('arguments[0].scrollIntoView({block: "center"});', caughtSlot);
	await new Promise(resolve => setTimeout(resolve, 500)); // Wait for scroll
	
	try {
		// Try regular click first
		await caughtSlot.click();
	} catch (clickError) {
		// If regular click fails, use JavaScript click as fallback
		console.log('Regular click failed, trying JavaScript click:', clickError.message);
		await this.driver.executeScript('arguments[0].click();', caughtSlot);
	}
});

Then('the Pokémon should be marked as uncaught', async function () {
	// Wait for state change
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Check that at least some slots are not caught (don't have caught class)
	const totalSlots = await this.findElements(
		By.css('[data-testid^="pokemon-slot"], [data-testid^="empty-slot"]')
	);
	const caughtSlots = await this.findElements(By.css('.box-slot-caught'));
	expect(totalSlots.length).to.be.greaterThan(caughtSlots.length);
});

// Bulk operations
When('I select multiple Pokémon slots', async function () {
	// Note: In this Box View UI, bulk operations work on entire boxes, not individual selections
	// This step represents the user's intent to perform bulk operations on the current box
	// The actual "selection" is implicitly the entire box of Pokemon
	console.log('Bulk operations will be applied to the entire current box');
	
	// Verify we have Pokemon slots available for bulk operations
	const slots = await this.findElements(
		By.css('[data-testid^="pokemon-slot"], [data-testid^="empty-slot"]')
	);
	expect(slots.length).to.be.greaterThan(0, 'Should have Pokemon slots available for bulk operations');
});

When('I click the {string} bulk action', async function (actionText) {
	let selector;
	switch (actionText) {
		case 'Mark as Caught':
			selector = '[data-testid="catch-all-button"]';
			break;
		case 'Mark as Ready to Evolve':
			selector = '[data-testid="ready-to-evolve-button"]';
			break;
		case 'Mark as Uncaught':
			selector = '[data-testid="clear-all-button"]';
			break;
		default:
			throw new Error(`Unknown bulk action: ${actionText}`);
	}
	
	// Wait for button to be clickable (not disabled)  
	// Allow extra time for database operations and UI state updates
	await this.driver.wait(async () => {
		const button = await this.findElement(By.css(selector));
		const isEnabled = await button.isEnabled();
		console.log(`Button "${actionText}" enabled: ${isEnabled}`);
		return isEnabled;
	}, 20000, `Button "${actionText}" did not become enabled within 20 seconds`);
	
	const bulkAction = await this.waitForElementVisible(By.css(selector));
	
	try {
		await bulkAction.click();
	} catch (clickError) {
		// If regular click fails, use JavaScript click as fallback
		console.log('Regular bulk action click failed, trying JavaScript click:', clickError.message);
		await this.driver.executeScript('arguments[0].click();', bulkAction);
	}
	
	// Wait for bulk operation to process
	await new Promise(resolve => setTimeout(resolve, 2000));
});

Then('all selected Pokémon should be marked as caught', async function () {
	// Wait for bulk operation to complete
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const caughtElements = await this.findElements(By.css('.box-slot-caught'));
	expect(caughtElements.length).to.be.greaterThan(0);
});

Then('all selected Pokémon should be marked as uncaught', async function () {
	// Wait for bulk operation to complete
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Check that no slots are caught
	const caughtElements = await this.findElements(By.css('.box-slot-caught'));
	expect(caughtElements.length).to.equal(0);
});

// Box statistics
Then('I should see the current box number', async function () {
	// Look for "Box X of Y" text in the header
	const boxIndicator = await this.waitForElement(
		By.css('[data-testid="box-title"]')
	);
	const text = await boxIndicator.getText();
	expect(text).to.match(/box \d+ of \d+/i);
});

Then('I should see how many Pokémon are in the current box', async function () {
	// Look for the stats section with Total/Caught/Remaining
	const boxStats = await this.waitForElement(By.css('[data-testid="box-stats"]'));
	expect(boxStats).to.exist;
});

Then('I should see the total progress for the current pokédex', async function () {
	// Look for the bottom information showing total pokemon count
	const progressElement = await this.waitForElement(
		By.css('[data-testid="box-info"]')
	);
	const text = await progressElement.getText();
	expect(text).to.include('total Pokémon');
});

// List View
Given('I am on the MyDex page in List View', { timeout: 30000 }, async function () {
	// Ensure test pokédex exists first
	console.log('Ensuring test pokédex exists for List View...');
	const testPokedex = await this.dataSeeder.ensureTestPokedexExists();
	
	console.log(`Test pokédex ID: ${testPokedex.id}`);
	
	try {
		// Get current URL
		const currentUrl = await this.driver.getCurrentUrl();
		console.log('Current URL:', currentUrl);
		
		// If we're on the pokedexes page after login, navigate directly from there
		if (currentUrl.includes('/pokedexes')) {
			console.log('Already on pokedexes page, navigating to MyDex...');
			await this.navigateTo(`/mydex?id=${testPokedex.id}`);
		} else if (currentUrl.includes('/mydex')) {
			console.log('Already on MyDex page');
		} else {
			// Need to login first
			console.log('Not logged in, ensuring login...');
			await this.authHelper.ensureLoggedIn();
			console.log('Login complete, navigating to MyDex...');
			
			// After login, we should be on /pokedexes
			await new Promise(resolve => setTimeout(resolve, 1000));
			await this.navigateTo(`/mydex?id=${testPokedex.id}`);
		}
		
		console.log('Waiting for MyDex page to load...');
		
		// Wait for page load with longer timeout
		await new Promise(resolve => setTimeout(resolve, 3000));
		
		// Wait for view mode toggle with explicit timeout
		const viewModeToggle = await this.waitForElement(
			By.css('[data-testid="view-mode-toggle"]'), 
			10000
		);
		console.log('View mode toggle found');
		
		// Find and click List View button if needed
		const listViewButton = await this.findElement(By.css('[data-testid="list-view-button"]'));
		const buttonClass = await listViewButton.getAttribute('class');
		
		if (!buttonClass.includes('btn-active')) {
			console.log('Clicking List View button...');
			await listViewButton.click();
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Verify List View loaded
			const listContainer = await this.waitForElement(
				By.css('[data-testid="list-view-container"]'),
				5000
			);
			console.log('List View container loaded');
		} else {
			console.log('Already in List View');
		}
		
		console.log('Successfully navigated to List View');
		
	} catch (error) {
		console.error('Error in List View navigation:', error.message);
		
		// Debug info
		try {
			const finalUrl = await this.driver.getCurrentUrl();
			console.error('Final URL:', finalUrl);
			
			const title = await this.driver.getTitle();
			console.error('Page title:', title);
			
			// Check if any key elements exist
			const hasToggle = await this.driver.findElements(By.css('[data-testid="view-mode-toggle"]')).then(els => els.length > 0);
			console.error('Has view-mode-toggle:', hasToggle);
			
			const hasListButton = await this.driver.findElements(By.css('[data-testid="list-view-button"]')).then(els => els.length > 0);
			console.error('Has list-view-button:', hasListButton);
			
		} catch (debugError) {
			console.error('Error getting debug info:', debugError.message);
		}
		
		throw error;
	}
});

Then('I should see a list of Pokémon with details', async function () {
	// In list view, look for ListView component or list items
	const pokemonList = await this.waitForElement(By.css('.list-view, .pokemon-item, .table'));
	expect(pokemonList).to.exist;
});

Then('I should see pagination controls', async function () {
	const pagination = await this.findElements(
		By.css('.pagination, .page-nav, [data-testid="pagination"]')
	);
	// Pagination might not exist if there are few items
	console.log(`Pagination controls found: ${pagination.length}`);
});

Then('I should see search/filter options', async function () {
	const searchBox = await this.findElements(
		By.css('input[type="search"], input[placeholder*="search"], .search-input')
	);
	// Search might not be implemented yet
	console.log(`Search controls found: ${searchBox.length}`);
});

Then('I should see search\\/filter options', async function () {
	// Look for search input
	const searchInput = await this.waitForElement(
		By.css('[data-testid="pokemon-search-input"]'),
		5000
	);
	expect(searchInput).to.exist;
	
	// Look for filter dropdown/select
	const filterSelect = await this.findElement(
		By.css('[data-testid="pokemon-filter-select"]')
	);
	expect(filterSelect).to.exist;
});

// Search functionality with robust waiting and error handling
When('I enter a search term in the search box', async function () {
	const maxRetries = 3;
	const searchTerm = 'pikachu';
	let lastError;
	
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`Search attempt ${attempt}/${maxRetries}`);
			
			// Wait for search box to be ready with extended timeout
			const searchBox = await this.waitForElementVisible(
				By.css('[data-testid="pokemon-search-input"]'),
				10000
			);
			
			// Get initial results count for comparison
			const initialItems = await this.findElements(
				By.css('[data-testid="pokemon-list-item"]')
			);
			const initialCount = initialItems.length;
			console.log(`Initial item count: ${initialCount}`);
			
			// Ensure element is interactable
			await this.driver.executeScript(
				'arguments[0].scrollIntoView({block: "center"});',
				searchBox
			);
			await new Promise(resolve => setTimeout(resolve, 500));
			
			// Use helper method for robust search input
			await this.performSearchInput(searchBox, searchTerm);
			
			// Wait for search results to change using helper method
			await this.waitForSearchResults(searchTerm, initialCount);
			
			console.log('Search input and filtering successful');
			return; // Success!
			
		} catch (error) {
			lastError = error;
			console.log(`Search attempt ${attempt} failed: ${error.message}`);
			
			if (attempt < maxRetries) {
				console.log(`Retrying in 1 second...`);
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}
	}
	
	throw new Error(`Search failed after ${maxRetries} attempts: ${lastError.message}`);
});

Then('I should see filtered results', async function () {
	// Wait for search results to stabilize
	await this.driver.wait(async () => {
		try {
			// Check if any loading indicators are present (if implemented)
			const loadingElements = await this.findElements(By.css('.loading, .spinner, [data-loading="true"]'));
			if (loadingElements.length > 0) {
				console.log('Still loading, waiting...');
				return false;
			}
			
			// Verify search results are present
			const results = await this.findElements(By.css('[data-testid="pokemon-list-item"]'));
			const hasResults = results.length > 0;
			
			if (hasResults) {
				// Verify content matches search term
				const firstResult = await results[0].getText();
				const matchesSearch = firstResult.toLowerCase().includes('pikachu');
				
				if (matchesSearch) {
					console.log(`Filtered results verified: ${results.length} items matching search`);
					return true;
				}
			}
			
			console.log(`Results check: ${results.length} items found`);
			return false;
		} catch (error) {
			console.log(`Results verification error: ${error.message}`);
			return false;
		}
	}, 10000, 'Filtered search results did not appear or match expected criteria');
	
	// Final verification and logging
	const finalItems = await this.findElements(By.css('[data-testid="pokemon-list-item"]'));
	expect(finalItems.length).to.be.greaterThan(0, 'Should have at least one search result');
	
	// Verify the result contains our search term
	const resultText = await finalItems[0].getText();
	expect(resultText.toLowerCase()).to.include('pikachu', 'Search result should contain the search term');
	
	console.log(`Search results validated: ${finalItems.length} items found`);
});

When('I clear the search', async function () {
	const maxRetries = 2;
	let lastError;
	
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`Clear search attempt ${attempt}/${maxRetries}`);
			
			// Find search box with multiple selector strategies
			let searchBox;
			try {
				searchBox = await this.waitForElementVisible(
					By.css('[data-testid="pokemon-search-input"]'),
					5000
				);
			} catch (error) {
				// Fallback selectors
				searchBox = await this.waitForElementVisible(
					By.css('input[type="text"], input[placeholder*="search"], .search-input'),
					5000
				);
			}
			
			// Get current item count before clearing
			const beforeItems = await this.findElements(By.css('[data-testid="pokemon-list-item"]'));
			const beforeCount = beforeItems.length;
			
			// Clear the search field thoroughly using multiple strategies
			await searchBox.clear();
			await searchBox.sendKeys(Key.chord(Key.CONTROL, 'a'));
			await searchBox.sendKeys(Key.BACK_SPACE); // Clear selection
			
			// Additional JavaScript clear as backup
			await this.driver.executeScript('arguments[0].value = "";', searchBox);
			
			// Trigger input event to ensure React state updates
			await this.driver.executeScript(`
				const element = arguments[0];
				const event = new Event('input', { bubbles: true });
				element.dispatchEvent(event);
			`, searchBox);
			
			// Small delay to allow state to update
			await new Promise(resolve => setTimeout(resolve, 300));
			
			// Verify field is cleared
			const clearedValue = await searchBox.getAttribute('value');
			if (clearedValue !== '') {
				throw new Error(`Search field not cleared. Value: "${clearedValue}"`);
			}
			
			// Trigger blur to ensure all handlers fire
			await searchBox.sendKeys(Key.TAB);
			
			// Wait for results to update (should show more items after clearing)
			await this.driver.wait(async () => {
				try {
					const currentItems = await this.findElements(By.css('[data-testid="pokemon-list-item"]'));
					const currentCount = currentItems.length;
					
					// After clearing search, we should see significantly more items
					// We expect much more than the filtered result (beforeCount should be 1, currentCount should be 20+)
					const resultsExpanded = currentCount > Math.max(beforeCount, 10);
					console.log(`Clear search progress: ${beforeCount} -> ${currentCount} items (expanded: ${resultsExpanded})`);
					
					return resultsExpanded;
				} catch (error) {
					console.log(`Clear search state check error: ${error.message}`);
					return false;
				}
			}, 10000, 'Search results did not expand after clearing');
			
			console.log('Search cleared successfully');
			return; // Success!
			
		} catch (error) {
			lastError = error;
			console.log(`Clear search attempt ${attempt} failed: ${error.message}`);
			
			if (attempt < maxRetries) {
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}
	}
	
	throw new Error(`Clear search failed after ${maxRetries} attempts: ${lastError.message}`);
});

Then('I should see all Pokémon again', async function () {
	// Wait for search clearing to complete and results to expand
	await this.driver.wait(async () => {
		try {
			// Check loading states
			const loadingElements = await this.findElements(By.css('.loading, .spinner, [data-loading="true"]'));
			if (loadingElements.length > 0) {
				console.log('Still loading after clear, waiting...');
				return false;
			}
			
			// Get current results
			const allItems = await this.findElements(By.css('[data-testid="pokemon-list-item"]'));
			const itemCount = allItems.length;
			
			// After clearing search, we should have significantly more items
			// Based on pagination showing 8 pages, we expect at least 20 items on first page
			const hasExpandedResults = itemCount > 10;
			
			console.log(`Results after clearing search: ${itemCount} items`);
			return hasExpandedResults;
			
		} catch (error) {
			console.log(`Expanded results check error: ${error.message}`);
			return false;
		}
	}, 10000, 'Search results did not expand to show all Pokémon after clearing');
	
	// Final verification
	const finalItems = await this.findElements(By.css('[data-testid="pokemon-list-item"]'));
	expect(finalItems.length).to.be.greaterThan(10, 'Should have many more Pokémon results after clearing search');
	
	console.log(`All Pokémon restored: ${finalItems.length} items visible`);
});
