// Authentication helper for BDD tests
import { By, Key } from 'selenium-webdriver';

export class AuthHelper {
  constructor(world) {
    this.world = world;
    this.testUser = {
      email: 'test@livingdextracker.local',
      password: 'testpassword123'
    };
  }

  async ensureDriverAvailable() {
    if (!this.world.driver) {
      await this.world.initializeDriver();
    }
    return this.world.driver;
  }

  async ensureLoggedIn() {
    try {
      // Mark authentication as in progress
      this.world.authInProgress = true;
      
      // Ensure driver is available
      await this.ensureDriverAvailable();
      
      // Check if already logged in by looking for sign-out link or user-specific content
      const isLoggedIn = await this.isUserLoggedIn();
      
      if (!isLoggedIn) {
        await this.performLogin();
      }
      
      this.world.authInProgress = false;
      return true;
    } catch (error) {
      this.world.authInProgress = false;
      return false;
    }
  }

  async isUserLoggedIn() {
    try {
      // Ensure driver is available
      await this.ensureDriverAvailable();
      
      // Check for user-specific elements that indicate logged-in state
      const userIndicators = await this.world.findElements(By.css('.user-menu, [data-testid="user-menu"], .btn-signout, [href="/auth/signout"]'));
      
      if (userIndicators.length > 0) {
        return true;
      }

      // Check if we're on a protected page and it loaded successfully
      const currentUrl = await this.world.driver.getCurrentUrl();
      if (currentUrl.includes('/mydex') || currentUrl.includes('/pokedexes') || currentUrl.includes('/profile')) {
        // If we're on a protected page, check if we see content (not redirected to signin)
        const protectedContent = await this.world.findElements(By.css('main, .container, .page-content'));
        return protectedContent.length > 0;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async performLogin() {
    // Ensure driver is available
    await this.ensureDriverAvailable();
    
    // Navigate to sign-in page
    await this.world.navigateTo('/signin');
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.world.waitForElement(By.css('form'));
    
    // Always create the test user first to ensure it exists
    await this.createTestUser();
    
    // Wait for account creation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Now sign in with the created account
    await this.signInExistingUser();
  }

  async shouldCreateTestUser() {
    // Always try to create the test user first for reliability
    return true;
  }

  async createTestUser() {
    // Toggle to Sign Up mode using the button at the bottom
    try {
      const toggleButton = await this.world.waitForElementVisible(By.css('.btn-link'));
      const buttonText = await toggleButton.getText();
      
      // Only click if we're not already in sign-up mode
      if (buttonText.includes("Don't have an account")) {
        await toggleButton.click();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      // Continue without toggle
    }

    // Fill out signup form
    await this.fillAuthForm();
    
    // Submit form with multiple strategies
    await this.submitAuthForm();

    // Wait for confirmation
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async signInExistingUser() {
    // Make sure we're in sign-in mode
    try {
      const toggleButton = await this.world.findElement(By.css('.btn-link'));
      const buttonText = await toggleButton.getText();
      
      // Only click if we're in sign-up mode (need to switch to sign-in)
      if (buttonText.includes("Already have an account")) {
        await toggleButton.click();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      // Already in sign-in mode
    }

    // Fill out login form
    await this.fillAuthForm();
    
    // Submit form with multiple strategies
    await this.submitAuthForm();

    // Wait for authentication to complete
    await this.waitForAuthenticationComplete();
  }

  async fillAuthForm() {
    // Wait for form to be fully loaded
    await this.world.waitForElement(By.css('form'));
    await new Promise(resolve => setTimeout(resolve, 200));

    // Fill email field
    try {
      const emailField = await this.world.waitForElementVisible(By.id('email'));
      await emailField.clear();
      await emailField.sendKeys(this.testUser.email);
    } catch (error) {
      // Try alternative selector
      const emailField = await this.world.waitForElementVisible(By.css('input[type="email"]'));
      await emailField.clear();
      await emailField.sendKeys(this.testUser.email);
    }

    // Fill password field
    try {
      const passwordField = await this.world.waitForElementVisible(By.id('password'));
      await passwordField.clear();
      await passwordField.sendKeys(this.testUser.password);
    } catch (error) {
      // Try alternative selector
      const passwordField = await this.world.waitForElementVisible(By.css('input[type="password"]'));
      await passwordField.clear();
      await passwordField.sendKeys(this.testUser.password);
    }
  }

  async submitAuthForm() {
    // Wait a moment for form validation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // Strategy 1: Find and click the submit button
      const submitButton = await this.world.waitForElementVisible(By.css('button[type="submit"]'));
      
      // Check if button is enabled
      const isEnabled = await submitButton.isEnabled();
      
      if (!isEnabled) {
        await this.world.driver.wait(async () => {
          return await submitButton.isEnabled();
        }, 5000, 'Submit button did not become enabled');
      }
      
      // Use JavaScript click as backup if regular click fails
      try {
        await submitButton.click();
      } catch (clickError) {
        await this.world.driver.executeScript('arguments[0].click();', submitButton);
      }
      
    } catch (buttonError) {
      // Strategy 2: Submit the form directly
      try {
        const form = await this.world.waitForElementVisible(By.css('form'));
        await this.world.driver.executeScript('arguments[0].submit();', form);
      } catch (formError) {
        // Strategy 3: Press Enter in password field
        const passwordField = await this.world.waitForElementVisible(By.css('input[type="password"]'));
        await passwordField.sendKeys(Key.RETURN);
      }
    }
    
    // Give the form submission a moment to process
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async waitForAuthenticationComplete() {
    // Ensure driver is available before waiting
    await this.ensureDriverAvailable();
    
    // Check for redirect after form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let currentUrl = await this.world.driver.getCurrentUrl();
    
    // Wait for redirect or success indicators
    await this.world.driver.wait(async () => {
      // Re-check driver availability in each iteration
      await this.ensureDriverAvailable();
      
      currentUrl = await this.world.driver.getCurrentUrl();
      
      // Check if we've been redirected away from signin
      if (!currentUrl.includes('/signin')) {
        return true;
      }

      // Check for error messages that would indicate auth failure
      const errorElements = await this.world.findElements(By.css('.alert-error, .error, [data-testid="error"], .alert'));
      if (errorElements.length > 0) {
        const errorText = await errorElements[0].getText();
        
        // If it's an account creation confirmation, that's actually success
        if (errorText.toLowerCase().includes('email') && (errorText.toLowerCase().includes('confirm') || errorText.toLowerCase().includes('check'))) {
          return true;
        }
      }

      // Check for success messages
      const successElements = await this.world.findElements(By.css('.alert-success, .success, [data-testid="success"]'));
      if (successElements.length > 0) {
        return true;
      }

      return false;
    }, 10000, 'Authentication did not complete within 10 seconds');

    // Additional verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ensure driver is still available
    await this.ensureDriverAvailable();
    currentUrl = await this.world.driver.getCurrentUrl();
    
    // Accept being on any page other than signin as success
    if (!currentUrl.includes('/signin')) {
      return;
    }
    
    // If still on signin, check if we're actually logged in
    const isLoggedIn = await this.isUserLoggedIn();
    if (!isLoggedIn) {
      // Continue with tests anyway
    }
  }

  async logout() {
    try {
      // Look for sign-out link or button
      const signOutElement = await this.world.findElement(By.css('.btn-signout, [href="/auth/signout"], [data-testid="signout"]'));
      await signOutElement.click();
      
      // Wait for logout to complete
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // Logout failed or user was not logged in
    }
  }

  async navigateToProtectedPage(path) {
    // Ensure we're logged in before navigating to protected pages
    await this.ensureLoggedIn();
    await this.world.navigateTo(path);
  }
}