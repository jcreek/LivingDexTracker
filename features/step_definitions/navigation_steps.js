import { Given, When, Then } from '@cucumber/cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

// Device simulation
Given('I am using a desktop browser', async function () {
	// Set desktop viewport
	await this.driver.manage().window().setRect({ width: 1280, height: 720 });
});

Given('I am using a mobile viewport', async function () {
	// Set mobile viewport
	await this.driver.manage().window().setRect({ width: 375, height: 667 });
});

// Navigation visibility
When('I navigate to any page', async function () {
	await this.navigateTo('/');
});

Then('I should see the navigation menu', async function () {
	const nav = await this.waitForElement(By.css('[data-testid="main-navigation"]'));
	expect(nav).to.exist;
});

Then('I should see all navigation links', async function () {
	const navLinks = await this.findElements(By.css('[data-testid^="nav-"]'));
	expect(navLinks.length).to.be.greaterThan(0);
});

Then('the navigation should be horizontal', async function () {
	const nav = await this.waitForElement(By.css('[data-testid="main-navigation"]'));
	const display = await nav.getCssValue('display');
	// Check for horizontal layout indicators
	expect(display).to.be.oneOf(['flex', 'block', 'inline-flex']);
});

// Mobile navigation
Then('I should see a hamburger menu button', async function () {
	// Look for the mobile menu button with data-testid
	const hamburger = await this.waitForElement(By.css('[data-testid="mobile-menu-button"]'));
	expect(hamburger).to.exist;
});

When('I click the hamburger menu', async function () {
	const hamburger = await this.waitForElementVisible(By.css('[data-testid="mobile-menu-button"]'));
	await hamburger.click();
});

Then('I should see the mobile navigation menu', async function () {
	// Mobile menu with data-testid
	const mobileMenu = await this.waitForElement(By.css('[data-testid="mobile-menu"]'));
	expect(mobileMenu).to.exist;
});

// Navigation links functionality
Given('I am on any page', async function () {
	await this.navigateTo('/');
});

When('I click the {string} navigation link', async function (linkText) {
	// For protected pages, ensure authentication first
	if (linkText === 'Pokédexes' || linkText === 'My Pokédexes' || linkText === 'Profile') {
		await this.authHelper.ensureLoggedIn();
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	// Map link text to data-testid selectors
	let selector;
	switch (linkText) {
		case 'Home':
			// Try Home navigation links first, then fallback to brand logo
			try {
				const homeLink = await this.waitForElementVisible(
					By.css('[data-testid="nav-home-desktop"], [data-testid="nav-home-mobile"]'),
					3000
				);
				await homeLink.click();
				return;
			} catch (error) {
				// Fallback to brand logo which also links to home
				selector = '[data-testid="brand-logo"]';
			}
			break;
		case 'Pokédexes':
		case 'My Pokédexes':
			selector = '[data-testid="nav-pokedexes-desktop"], [data-testid="nav-pokedexes-mobile"]';
			break;
		case 'Profile':
			selector = '[data-testid="nav-profile-desktop"], [data-testid="nav-profile-mobile"]';
			break;
		case 'About':
			selector = '[data-testid="nav-about-desktop"], [data-testid="nav-about-mobile"]';
			break;
		default:
			// Fallback to text-based search
			selector = `//nav//*[contains(text(), '${linkText}')][@href]`;
			break;
	}

	const navLink = await this.waitForElementVisible(
		selector.startsWith('//') ? By.xpath(selector) : By.css(selector)
	);
	await navLink.click();
});

Then('I should be on the home page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.endsWith('/') || url.includes('home');
	}, 10000);
});

Then('I should be on the pokédexes page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.includes('/pokedexes');
	}, 10000);
});

Then('I should be on the MyDex page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.includes('/mydex') || url.includes('/pokedexes/');
	}, 10000);
});

Then('I should be on the profile page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.includes('/profile');
	}, 10000);
});

Then('I should be on the about page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.includes('/about');
	}, 10000);
});

// Current page highlighting
// Removed duplicate - using authentication_steps.js version

Then('the {string} navigation link should be highlighted as current', async function (linkText) {
	const currentLink = await this.waitForElement(
		By.xpath(
			`//nav//*[contains(text(), '${linkText}')]/ancestor-or-self::*[contains(@class, 'active') or contains(@class, 'current') or @aria-current]`
		)
	);
	expect(currentLink).to.exist;
});

// Removed duplicate - using pokedex_management_steps.js version

// Sign in/out functionality
// Removed duplicate - using authentication_steps.js version

Then('I should be on the sign-in page', async function () {
	await this.driver.wait(async () => {
		const url = await this.driver.getCurrentUrl();
		return url.includes('/signin');
	}, 10000);
});
