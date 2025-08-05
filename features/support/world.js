import { Builder, Browser, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import { AuthHelper } from './auth-helper.js';

setDefaultTimeout(10000);  // Reduced from 20000

class CustomWorld {
  constructor() {
    this.driver = null;
    this.baseUrl = 'http://localhost:5173'; // Vite dev server
    this.testEmail = 'test@livingdextracker.local';
    this.testPassword = 'testpassword123';
    this.authHelper = new AuthHelper(this);
  }

  async initializeDriver() {
    if (!this.driver) {
      try {
        const options = new chrome.Options();
        
        // Run in headless mode for speed with additional optimizations
        options.addArguments('--headless=new');
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-setuid-sandbox');
        options.addArguments('--disable-web-security');
        options.addArguments('--disable-features=TranslateUI');
        options.addArguments('--disable-ipc-flooding-protection');
        options.addArguments('--disable-background-timer-throttling');
        options.addArguments('--disable-backgrounding-occluded-windows');
        options.addArguments('--disable-renderer-backgrounding');
        options.addArguments('--window-size=1280,720');  // Smaller window for speed
        
        this.driver = await new Builder()
          .forBrowser(Browser.CHROME)
          .setChromeOptions(options)
          .build();
        
        // Set shorter timeouts for speed
        await this.driver.manage().setTimeouts({ 
          implicit: 1000,     // Reduced from 3000
          pageLoad: 10000,    // 10 seconds max page load
          script: 5000        // 5 seconds max script execution
        });
      } catch (error) {
        throw error;
      }
    }
    return this.driver;
  }

  async navigateTo(path = '') {
    const driver = await this.initializeDriver();
    await driver.get(`${this.baseUrl}${path}`);
  }

  async navigateToProtected(path = '') {
    // For protected pages, ensure authentication first
    await this.authHelper.ensureLoggedIn();
    await this.navigateTo(path);
  }

  async findElement(locator) {
    const driver = await this.initializeDriver();
    return await driver.findElement(locator);
  }

  async findElements(locator) {
    const driver = await this.initializeDriver();
    return await driver.findElements(locator);
  }

  async waitForElement(locator, timeout = 5000) {  // Reduced from 10000
    const driver = await this.initializeDriver();
    return await driver.wait(until.elementLocated(locator), timeout);
  }

  async waitForElementVisible(locator, timeout = 5000) {  // Reduced from 10000
    const driver = await this.initializeDriver();
    const element = await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    return element;
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
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await this.driver.quit();
      } catch (error) {
        // Cleanup failed
      } finally {
        this.driver = null;
      }
    }
  }
}

setWorldConstructor(CustomWorld);