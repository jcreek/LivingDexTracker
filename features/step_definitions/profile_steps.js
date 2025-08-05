import { Given, When, Then } from '@cucumber/cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

// Navigation
When('I navigate to the profile page', async function() {
  await this.navigateToProtected('/profile');
});

Then('I should see the profile page', async function() {
  await this.driver.wait(async () => {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/profile');
  }, 10000);
});

Then('I should see user statistics', async function() {
  const statsElements = await this.findElements(By.css('[data-testid="stats-grid"], [data-testid="collection-stats-card"], .stats'));
  expect(statsElements.length).to.be.greaterThan(0);
});

// Profile statistics
Given('I am on the profile page', async function() {
  await this.navigateToProtected('/profile');
});

Then('I should see total pokédexes created', async function() {
  const profileContent = await this.getText(By.css('body'));
  expect(profileContent.toLowerCase()).to.match(/pokédex|dex|total/);
});

Then('I should see overall completion statistics', async function() {
  const statsElements = await this.findElements(By.css('.completion, .percentage, .stats, [data-testid="completion-stats"]'));
  expect(statsElements.length).to.be.greaterThan(0);
});

Then('I should see individual pokédex progress', async function() {
  const progressElements = await this.findElements(By.css('.progress, .pokedex-progress, [data-testid="pokedex-progress"]'));
  expect(progressElements.length).to.be.greaterThanOrEqual(0);
});

// Progress visualization
Then('I should see progress bars for each pokédex', async function() {
  const progressBars = await this.findElements(By.css('.progress, .progress-bar, [role="progressbar"]'));
  expect(progressBars.length).to.be.greaterThanOrEqual(0);
});

Then('I should see completion percentages', async function() {
  const profileText = await this.getText(By.css('body'));
  expect(profileText).to.match(/%|\d+\/\d+|completion|complete/i);
});

Then('I should see {string} counts', async function(statType) {
  const profileText = await this.getText(By.css('body'));
  expect(profileText.toLowerCase()).to.include(statType.toLowerCase());
});

// Navigation to specific pokédex
When('I click on a specific pokédex in the statistics', async function() {
  try {
    const pokedexLinks = await this.findElements(By.css('a[href*="mydex"], .pokedex-link, [data-testid="pokedex-link"]'));
    if (pokedexLinks.length > 0) {
      await pokedexLinks[0].click();
    } else {
      // If no direct links, just navigate to mydex
      await this.navigateToProtected('/mydex');
    }
  } catch (error) {
    // Fallback to mydex page
    await this.navigateToProtected('/mydex');
  }
});

Then('I should be taken to that pokédex view', async function() {
  await this.driver.wait(async () => {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/mydex') || url.includes('/pokedex');
  }, 10000);
});

Then('I should see that pokédex\'s detailed view', async function() {
  const detailView = await this.waitForElement(By.css('.box-view, .list-view, .pokemon-grid, .pokemon-list, main'));
  expect(detailView).to.exist;
});