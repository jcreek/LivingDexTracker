import { Builder, Browser, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import { AuthHelper } from './auth-helper.js';
import { DataSeeder } from './data-seeder.js';

setDefaultTimeout(30000); // Increased for robust search testing

class CustomWorld {
	constructor() {
		this.driver = null;
		this.baseUrl = 'http://localhost:5173'; // Vite dev server
		this.testEmail = 'test@livingdextracker.local';
		this.testPassword = 'testpassword123';
		this.authHelper = new AuthHelper(this);
		this.dataSeeder = new DataSeeder(this);
		this.testPokedex = null;
		this.testUserId = null;
		
		// Environment-specific timeouts
		this.searchTimeout = process.env.TEST_ENV === 'ci' ? 20000 : 15000;
		this.elementTimeout = process.env.TEST_ENV === 'ci' ? 12000 : 10000;
		this.typingDelay = process.env.TEST_ENV === 'ci' ? 150 : 100;
	}

	async initializeDriver() {
		if (!this.driver || (await this.isDriverInvalid())) {
			try {
				// Clean up invalid driver first
				if (this.driver) {
					try {
						await this.driver.quit();
					} catch (e) {
						// Ignore cleanup errors
					}
					this.driver = null;
				}

				const options = new chrome.Options();

				// Run in headless mode with basic stability settings
				options.addArguments('--headless');
				options.addArguments('--disable-gpu');
				options.addArguments('--no-sandbox');
				options.addArguments('--disable-dev-shm-usage');
				options.addArguments('--window-size=1280,720');

				this.driver = await new Builder()
					.forBrowser(Browser.CHROME)
					.setChromeOptions(options)
					.build();

				// Set balanced timeouts
				await this.driver.manage().setTimeouts({
					implicit: 5000, // Increased for stability
					pageLoad: 30000, // 30 seconds for page loads
					script: 10000 // 10 seconds for script execution
				});
			} catch (error) {
				this.driver = null;
				throw error;
			}
		}
		return this.driver;
	}

	async isDriverInvalid() {
		if (!this.driver) {
			return true;
		}

		try {
			// Test if the driver session is still valid
			await this.driver.getCurrentUrl();
			return false;
		} catch (error) {
			// Session is invalid if we get an error
			return true;
		}
	}

	async navigateTo(path = '') {
		const driver = await this.initializeDriver();
		const url = `${this.baseUrl}${path}`;
		
		// Retry logic for navigation
		let lastError;
		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				await driver.get(url);
				// Wait a bit to ensure page starts loading
				await new Promise(resolve => setTimeout(resolve, 500));
				return; // Success
			} catch (error) {
				lastError = error;
				console.log(`Navigation attempt ${attempt} failed for ${url}: ${error.message}`);
				
				if (attempt < 3) {
					// Wait before retrying
					await new Promise(resolve => setTimeout(resolve, 1000));
					
					// Check if driver is still valid
					if (await this.isDriverInvalid()) {
						console.log('Driver became invalid, reinitializing...');
						this.driver = null;
						await this.initializeDriver();
					}
				}
			}
		}
		
		// All attempts failed
		throw lastError;
	}

	async navigateToProtected(path = '') {
		// For protected pages, ensure authentication first
		await this.authHelper.ensureLoggedIn();

		// If navigating to mydex and we have a test pokédex, navigate directly to it
		if (path === '/mydex' && this.testPokedex) {
			await this.navigateTo(`/mydex?id=${this.testPokedex.id}`);
		} else {
			await this.navigateTo(path);
		}
	}

	async findElement(locator) {
		const driver = await this.initializeDriver();
		try {
			return await driver.findElement(locator);
		} catch (error) {
			if (error.name === 'NoSuchSessionError' || error.message.includes('session')) {
				this.driver = null;
				const freshDriver = await this.initializeDriver();
				return await freshDriver.findElement(locator);
			}
			throw error;
		}
	}

	async findElements(locator) {
		const driver = await this.initializeDriver();
		try {
			return await driver.findElements(locator);
		} catch (error) {
			if (error.name === 'NoSuchSessionError' || error.message.includes('session')) {
				// Driver session is invalid, try once more with fresh driver
				this.driver = null;
				const freshDriver = await this.initializeDriver();
				return await freshDriver.findElements(locator);
			}
			throw error;
		}
	}

	async waitForElement(locator, timeout = 8000) {
		// Increased for stability
		const driver = await this.initializeDriver();
		try {
			return await driver.wait(until.elementLocated(locator), timeout);
		} catch (error) {
			if (error.name === 'NoSuchSessionError' || error.message.includes('session')) {
				this.driver = null;
				const freshDriver = await this.initializeDriver();
				return await freshDriver.wait(until.elementLocated(locator), timeout);
			}
			throw error;
		}
	}

	async waitForElementVisible(locator, timeout = 8000) {
		// Increased for stability
		const driver = await this.initializeDriver();
		try {
			const element = await driver.wait(until.elementLocated(locator), timeout);
			await driver.wait(until.elementIsVisible(element), timeout);
			return element;
		} catch (error) {
			if (error.name === 'NoSuchSessionError' || error.message.includes('session')) {
				this.driver = null;
				const freshDriver = await this.initializeDriver();
				const element = await freshDriver.wait(until.elementLocated(locator), timeout);
				await freshDriver.wait(until.elementIsVisible(element), timeout);
				return element;
			}
			throw error;
		}
	}

	async click(locator) {
		const element = await this.waitForElementVisible(locator);
		await element.click();
	}

	async type(locator, text) {
		const element = await this.waitForElementVisible(locator);
		await element.clear();
		await element.sendKeys(text);
	}

	async getText(locator) {
		const element = await this.waitForElementVisible(locator);
		return await element.getText();
	}

	async isElementPresent(locator) {
		try {
			const driver = await this.initializeDriver();
			await driver.findElement(locator);
			return true;
		} catch (error) {
			return false;
		}
	}

	async cleanup() {
		if (this.driver) {
			try {
				// Give any pending operations a chance to complete
				await new Promise((resolve) => setTimeout(resolve, 100));

				await this.driver.quit();
			} catch (error) {
				// Cleanup failed
			} finally {
				this.driver = null;
			}
		}
	}

	// Helper method for robust search input handling
	async performSearchInput(searchBox, searchTerm) {
		// Clear field using multiple methods for reliability
		await searchBox.clear();
		await searchBox.sendKeys(Key.chord(Key.CONTROL, 'a')); // Select all
		await searchBox.sendKeys(Key.BACK_SPACE); // Delete selection
		
		// Type search term character by character to ensure events fire
		for (const char of searchTerm) {
			await searchBox.sendKeys(char);
			await new Promise(resolve => setTimeout(resolve, this.typingDelay));
		}
		
		// Verify input was accepted
		const inputValue = await searchBox.getAttribute('value');
		if (inputValue !== searchTerm) {
			throw new Error(`Input not accepted. Expected: ${searchTerm}, Got: ${inputValue}`);
		}
		
		return inputValue;
	}

	// Helper method for waiting on search results
	async waitForSearchResults(expectedTerm, initialCount, timeout = null) {
		const searchTimeout = timeout || this.searchTimeout;
		
		return await this.driver.wait(async () => {
			try {
				const currentItems = await this.findElements(
					By.css('[data-testid="pokemon-list-item"]')
				);
				const currentCount = currentItems.length;
				
				// Search should filter results (expecting fewer results or at least some results)
				const hasFiltered = initialCount > 1 ? currentCount < initialCount : currentCount >= 1;
				
				if (hasFiltered && currentCount > 0) {
					// Verify the result actually contains our search term
					const firstResult = await currentItems[0].getText();
					const containsSearchTerm = firstResult.toLowerCase().includes(expectedTerm.toLowerCase());
					console.log(`Search filtering: ${currentCount} results, contains "${expectedTerm}": ${containsSearchTerm}`);
					return containsSearchTerm;
				}
				
				return false;
			} catch (error) {
				console.log(`Search results wait error: ${error.message}`);
				return false;
			}
		}, searchTimeout, `Search filtering did not complete within ${searchTimeout}ms`);
	}
}

setWorldConstructor(CustomWorld);
