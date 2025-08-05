# BDD Testing with Selenium & Cucumber

This directory contains comprehensive Behavior-Driven Development (BDD) tests for the Living Dex Tracker application using Selenium WebDriver and Cucumber.js.

## 🎯 Test Coverage

### Features Tested
- **Authentication**: Sign-in, sign-up, validation
- **Pokédex Management**: Creating, viewing, and managing pokédexes
- **Box View Interaction**: 6×5 grid, catch status, bulk operations
- **Profile & Stats**: User statistics and progress tracking
- **Responsive Navigation**: Desktop and mobile navigation
- **Multi-Regional Support**: Multiple regional pokédex configurations
- **Enhanced Catch Management**: Advanced catch tracking and bulk operations

### Test Scenarios
- ✅ 50+ comprehensive scenarios
- ✅ Real browser automation with Chrome
- ✅ Tests against local development server
- ✅ HTML reports with screenshots
- ✅ Cross-platform compatibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18.13.0+
- Chrome browser installed
- Application dependencies: `npm install`

### Running Tests

#### Option 1: Automated (Recommended)
```bash
# Starts dev server, runs tests, generates report, cleans up
npm run test:bdd
```

#### Option 2: Manual Control
```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Run BDD tests (server must be running)
npm run test:bdd-manual

# Generate HTML report
node scripts/generate-test-report.js
```

### Test Reports
- JSON: `reports/cucumber_report.json`
- HTML: `reports/cucumber_report.html`

## 📁 Project Structure

```
features/
├── *.feature                  # Gherkin feature files
├── step_definitions/          # Step implementations
│   ├── authentication_steps.js
│   ├── pokedex_management_steps.js
│   ├── box_view_steps.js
│   ├── profile_steps.js
│   ├── navigation_steps.js
│   ├── multi_regional_steps.js
│   └── enhanced_catch_steps.js
├── support/                   # Test configuration
│   ├── world.js              # Custom World with WebDriver
│   ├── hooks.js              # Before/After hooks
│   ├── test-data.js          # Test data management
│   └── auth-helper.js        # Authentication helper utilities
└── README.md                 # This file
```

## 🔧 Configuration

### Browser Configuration
Tests use Chrome by default. Configure in `features/support/world.js`:

```javascript
this.driver = await new Builder()
  .forBrowser(Browser.CHROME)  // Change to FIREFOX, EDGE, etc.
  .build();
```

### Server Configuration
Default server: `http://localhost:5173` (Vite dev server)

Change in `features/support/world.js`:
```javascript
this.baseUrl = 'http://localhost:3000'; // Your custom port
```

### Timeouts
- Default scenario timeout: 30 seconds
- Element wait timeout: 10 seconds
- Implicit wait: 5 seconds

## 📝 Writing New Tests

### 1. Add Feature File
Create `features/new_feature.feature`:
```gherkin
Feature: New Feature
  As a user
  I want to do something
  So that I achieve a goal

  Scenario: User can do something
    Given I am on the page
    When I click something
    Then I should see the result
```

### 2. Implement Step Definitions
Create `features/step_definitions/new_feature_steps.js`:
```javascript
import { Given, When, Then } from '@cucumber/cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

Given('I am on the page', async function() {
  await this.navigateTo('/path');
});

When('I click something', async function() {
  await this.click(By.css('.button'));
});

Then('I should see the result', async function() {
  const element = await this.waitForElement(By.css('.result'));
  expect(element).to.exist;
});
```

## 🔍 Available Helper Methods

The custom World class provides these helper methods:

```javascript
// Navigation
await this.navigateTo('/path');

// Element interaction
await this.click(By.css('.button'));
await this.type(By.css('input'), 'text');
const text = await this.getText(By.css('.element'));

// Waiting
await this.waitForElement(By.css('.element'));
await this.waitForElementVisible(By.css('.element'));

// Checking
const exists = await this.isElementPresent(By.css('.element'));

// Cleanup
await this.cleanup();
```

## 🎨 Test Data

Test data is managed in `features/support/test-data.js`:

```javascript
import { testData } from '../support/test-data.js';

// Use predefined test data
const testEmail = testData.users.testUser.email;

// Generate dynamic test data
const randomEmail = getRandomTestEmail();
const randomPokedexName = getRandomPokedexName();
```

## 🐛 Debugging

### Common Issues

1. **ChromeDriver not found**
   ```bash
   # Install ChromeDriver
   npm install -g chromedriver
   ```

2. **Server not running**
   - Ensure dev server is running on port 5173
   - Check server logs for errors

3. **Element not found**
   - Verify CSS selectors in browser dev tools
   - Check for dynamic content loading
   - Increase timeout if needed

### Debug Mode
Add `console.log` statements in step definitions:
```javascript
Then('I should see something', async function() {
  console.log('Current URL:', await this.driver.getCurrentUrl());
  console.log('Page title:', await this.driver.getTitle());
});
```

## 📊 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run BDD Tests
  run: |
    npm install
    npm run test:bdd
    
- name: Upload Test Reports
  uses: actions/upload-artifact@v3
  with:
    name: bdd-test-reports
    path: reports/
```

## 🔄 Maintenance

### Updating Selectors
When UI changes, update selectors in step definitions:
```javascript
// Old
By.css('.old-class')

// New
By.css('.new-class, [data-testid="element"]')
```

### Adding New Scenarios
1. Identify user journey
2. Write Gherkin scenario
3. Implement step definitions
4. Test manually
5. Add to CI pipeline

## 📈 Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Keep scenarios focused** on single user journeys
3. **Use Background** for common setup steps
4. **Abstract complex logic** into helper methods
5. **Clean up** after each scenario
6. **Use meaningful assertions** with clear error messages

## 🎯 Next Steps

To enhance the testing suite:

1. **Add visual regression testing** with screenshot comparison
2. **Implement accessibility testing** with axe-core
3. **Add performance testing** with Lighthouse
4. **Create mobile-specific scenarios** 
5. **Add database state verification**
6. **Implement parallel test execution**

---

**Happy Testing! 🧪**

For questions or issues, check the main project documentation or create an issue in the repository.