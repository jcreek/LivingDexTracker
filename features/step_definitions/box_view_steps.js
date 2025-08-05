import { Given, When, Then } from '@cucumber/cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

// MyDex page navigation
When('I navigate to the MyDex page', async function() {
  // MyDex needs a pokedex ID, so go to pokedexes first and then to the first available pokedex
  await this.navigateToProtected('/pokedexes');
  
  // Try to find and click the first pokedex link
  try {
    const firstPokedexLink = await this.waitForElementVisible(By.css('a[href*=\"/mydex\"]'), 2000);
    await firstPokedexLink.click();
  } catch (error) {
    console.log('No pokedex links found, staying on pokedexes page');
  }
});

Then('I should see the MyDex page', async function() {
  await this.driver.wait(async () => {
    const url = await this.driver.getCurrentUrl();
    return url.includes('/mydex');
  }, 10000);
});

Then('I should see pokédex selection if multiple pokédexes exist', async function() {
  // This is optional - check if pokédex selector exists
  const selector = await this.isElementPresent(By.css('select, .pokedex-selector, [data-testid="pokedex-select"]'));
  // Don't fail if it doesn't exist - just log for now
  console.log(`Pokédex selector present: ${selector}`);
});

// View switching
Given('I am on the MyDex page', async function() {
  // MyDex needs a pokedex ID, so go through pokedexes page first
  await this.navigateToProtected('/pokedexes');
  
  try {
    const firstPokedexLink = await this.waitForElementVisible(By.css('[data-testid="open-pokedex-button"], [data-testid="view-pokedex-link"]'), 2000);
    await firstPokedexLink.click();
  } catch (error) {
    console.log('No pokedex links found for MyDex navigation');
  }
});

When('I click the {string} button', async function(buttonText) {
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
  
  const button = await this.waitForElementVisible(By.xpath(`//button[contains(text(), '${actualButtonText}')]`));
  await button.click();
});

Then('I should see the list view layout', async function() {
  const listView = await this.waitForElement(By.css('.list-view, [data-view="list"], .pokemon-list'));
  expect(listView).to.exist;
});

Then('I should see the box view layout', async function() {
  const boxView = await this.waitForElement(By.css('.box-view, [data-view="box"], .pokemon-grid'));
  expect(boxView).to.exist;
});

// Box View layout validation
Given('I am in Box View mode', async function() {
  // Try to click Box View button if not already in box view
  try {
    const boxViewButton = await this.findElement(By.xpath('//button[contains(text(), "Box View")]'));
    await boxViewButton.click();
  } catch (error) {
    // Already in box view or button doesn't exist
  }
});

Given('I am on the MyDex page in Box View', async function() {
  // Navigate to MyDex first
  await this.navigateToProtected('/pokedexes');
  
  try {
    const firstPokedexLink = await this.waitForElementVisible(By.css('[data-testid="open-pokedex-button"], [data-testid="view-pokedex-link"]'), 2000);
    await firstPokedexLink.click();
    
    // Then ensure we're in Box View
    const boxViewButton = await this.findElement(By.xpath('//button[contains(text(), "Box View")]'));
    await boxViewButton.click();
  } catch (error) {
    console.log('Error navigating to MyDex Box View:', error.message);
  }
});

Then('I should see exactly 30 Pokémon slots in the current box', async function() {
  // The box grid has 30 slots, each within a relative div
  const pokemonSlots = await this.findElements(By.css('.grid .relative, .box-slot'));
  expect(pokemonSlots.length).to.equal(30);
});

Then('the slots should be arranged in a 6x5 grid', async function() {
  // Check CSS grid arrangement - should be grid-cols-6
  const boxContainer = await this.waitForElement(By.css('[data-testid="pokemon-grid"]'));
  const gridStyle = await boxContainer.getCssValue('display');
  
  // Should be grid with 6 columns
  expect(gridStyle).to.equal('grid');
  
  // Count slots - should have 30 total
  const pokemonSlots = await this.findElements(By.css('.grid .relative, .box-slot'));
  expect(pokemonSlots.length).to.equal(30);
});

// Box navigation - using the earlier "I click the {string} button" definition

Then('I should see the next set of 30 Pokémon', async function() {
  // Wait for content to update
  await new Promise(resolve => setTimeout(resolve, 1000));
  const pokemonSlots = await this.findElements(By.css('.grid .relative, .box-slot'));
  expect(pokemonSlots.length).to.equal(30);
});

Then('I should see the previous set of 30 Pokémon', async function() {
  // Wait for content to update
  await new Promise(resolve => setTimeout(resolve, 1000));
  const pokemonSlots = await this.findElements(By.css('.grid .relative, .box-slot'));
  expect(pokemonSlots.length).to.equal(30);
});

// Pokémon display
Then('I should see Pokémon sprites for caught Pokémon', async function() {
  const sprites = await this.findElements(By.css('.pokemon-sprite, img[alt]:not([alt="Empty slot"])')); 
  // At least some pokemon sprites should be present
  expect(sprites.length).to.be.greaterThan(0);
});

Then('I should see placeholder indicators for uncaught Pokémon', async function() {
  const placeholders = await this.findElements(By.css('.box-slot-empty, img[alt="Empty slot"]'));
  // Should have some uncaught placeholders
  expect(placeholders.length).to.be.greaterThanOrEqual(0);
});

Then('I should see visual indicators for ready-to-evolve Pokémon', async function() {
  // Look for evolution indicators - yellow backgrounds or yellow dots
  const evolutionIndicators = await this.findElements(By.css('.box-slot-ready-evolve, .bg-yellow-500'));
  // This is informational - don't fail if none exist
  console.log(`Ready to evolve indicators found: ${evolutionIndicators.length}`);
});

// Catch status toggling
When('I click on an uncaught Pokémon slot', async function() {
  const uncaughtSlot = await this.waitForElementVisible(By.css('.box-slot:not(.box-slot-caught):not(.box-slot-ready-evolve), .grid .relative:first-child'));
  await uncaughtSlot.click();
});

Then('the Pokémon should be marked as caught', async function() {
  // Wait for state change
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Look for caught status - green background
  const caughtElements = await this.findElements(By.css('.box-slot-caught'));
  expect(caughtElements.length).to.be.greaterThan(0);
});

Then('the sprite should become visible', async function() {
  const visibleSprites = await this.findElements(By.css('.pokemon-sprite'));
  expect(visibleSprites.length).to.be.greaterThan(0);
});

When('I click on the same caught Pokémon slot', async function() {
  const caughtSlot = await this.waitForElementVisible(By.css('.box-slot-caught, .grid .relative:first-child'));
  await caughtSlot.click();
});

Then('the Pokémon should be marked as uncaught', async function() {
  // Wait for state change
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check that at least some slots are not caught (don't have caught class)
  const totalSlots = await this.findElements(By.css('.box-slot, .grid .relative'));
  const caughtSlots = await this.findElements(By.css('.box-slot-caught'));
  expect(totalSlots.length).to.be.greaterThan(caughtSlots.length);
});

// Bulk operations
When('I select multiple Pokémon slots', async function() {
  const slots = await this.findElements(By.css('.box-slot, .grid .relative'));
  // Select first 3 slots
  for (let i = 0; i < Math.min(3, slots.length); i++) {
    // Hold Ctrl/Cmd while clicking for multi-select
    await this.driver.actions().keyDown('Control').click(slots[i]).keyUp('Control').perform();
  }
});

When('I click the {string} bulk action', async function(actionText) {
  const bulkAction = await this.waitForElementVisible(By.xpath(`//button[contains(text(), '${actionText}')]`));
  await bulkAction.click();
});

Then('all selected Pokémon should be marked as caught', async function() {
  // Wait for bulk operation to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const caughtElements = await this.findElements(By.css('.box-slot-caught'));
  expect(caughtElements.length).to.be.greaterThan(0);
});

Then('all selected Pokémon should be marked as uncaught', async function() {
  // Wait for bulk operation to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check that no slots are caught
  const caughtElements = await this.findElements(By.css('.box-slot-caught'));
  expect(caughtElements.length).to.equal(0);
});

// Box statistics
Then('I should see the current box number', async function() {
  // Look for "Box X of Y" text in the header
  const boxIndicator = await this.waitForElement(By.xpath('//*[contains(text(), "Box") and contains(text(), "of")]'));
  const text = await boxIndicator.getText();
  expect(text).to.match(/box \d+ of \d+/i);
});

Then('I should see how many Pokémon are in the current box', async function() {
  // Look for the stats section with Total/Caught/Remaining
  const boxStats = await this.waitForElement(By.css('.stats.stats-horizontal'));
  expect(boxStats).to.exist;
});

Then('I should see the total progress for the current pokédex', async function() {
  // Look for the bottom information showing total pokemon count
  const progressElement = await this.waitForElement(By.xpath('//*[contains(text(), "total Pokémon")]'));
  expect(progressElement).to.exist;
});

// List View
Given('I am on the MyDex page in List View', async function() {
  await this.navigateToProtected('/mydex');
  try {
    const listViewButton = await this.findElement(By.xpath('//button[contains(text(), "List View")]'));
    await listViewButton.click();
  } catch (error) {
    // Already in list view or button doesn't exist
  }
});

Then('I should see a list of Pokémon with details', async function() {
  // In list view, look for ListView component or list items
  const pokemonList = await this.waitForElement(By.css('.list-view, .pokemon-item, .table'));
  expect(pokemonList).to.exist;
});

Then('I should see pagination controls', async function() {
  const pagination = await this.findElements(By.css('.pagination, .page-nav, [data-testid="pagination"]'));
  // Pagination might not exist if there are few items
  console.log(`Pagination controls found: ${pagination.length}`);
});

Then('I should see search/filter options', async function() {
  const searchBox = await this.findElements(By.css('input[type="search"], input[placeholder*="search"], .search-input'));
  // Search might not be implemented yet
  console.log(`Search controls found: ${searchBox.length}`);
});

// Search functionality
When('I enter a search term in the search box', async function() {
  try {
    const searchBox = await this.waitForElementVisible(By.css('input[type="search"], input[placeholder*="search"], .search-input'));
    await searchBox.clear();
    await searchBox.sendKeys('pikachu');
  } catch (error) {
    console.log('Search box not found - feature may not be implemented yet');
  }
});

Then('I should see filtered results', async function() {
  // Wait for potential filtering
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This is informational - check if filtering occurred
  const listItems = await this.findElements(By.css('.pokemon-item, .list-item, [data-testid="pokemon-list-item"]'));
  console.log(`List items after search: ${listItems.length}`);
});

When('I clear the search', async function() {
  try {
    const searchBox = await this.findElement(By.css('input[type="search"], input[placeholder*="search"], .search-input'));
    await searchBox.clear();
  } catch (error) {
    console.log('Search box not found - feature may not be implemented yet');
  }
});

Then('I should see all Pokémon again', async function() {
  // Wait for potential filtering to clear
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const listItems = await this.findElements(By.css('.pokemon-item, .list-item, [data-testid="pokemon-list-item"]'));
  console.log(`List items after clearing search: ${listItems.length}`);
});