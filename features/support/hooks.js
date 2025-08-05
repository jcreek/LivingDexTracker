import { After, Before, BeforeAll, AfterAll } from '@cucumber/cucumber';

BeforeAll(async function() {
  // Test suite initialization
});

Before(async function() {
  // Initialize driver before each scenario
  await this.initializeDriver();
  
  // Mark scenario as running to prevent premature cleanup
  this.scenarioRunning = true;
  this.authInProgress = false;
  
  // Check if this scenario requires authentication
  // Safely check for @public tag
  this.requiresAuth = true; // Default to requiring auth
  
  try {
    if (this.pickle && this.pickle.tags) {
      const scenarioTags = this.pickle.tags.map(tag => tag.name) || [];
      this.requiresAuth = !scenarioTags.includes('@public');
    }
  } catch (error) {
    // If we can't determine tags, assume auth is required for safety
    this.requiresAuth = true;
  }
});

After(async function() {
  // Mark scenario as complete
  this.scenarioRunning = false;
  
  // Wait for any authentication process to complete before cleanup
  let waitCount = 0;
  while (this.authInProgress && waitCount < 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    waitCount++;
  }
  
  // Clean up after each scenario
  try {
    await this.cleanup();
  } catch (error) {
    // Cleanup failed
  }
});

AfterAll(async function() {
  // Test suite completed
});