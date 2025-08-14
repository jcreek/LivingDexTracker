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
- Supabase configured (`.env` file with credentials)

### Environment Setup

```bash
# Copy the example and fill in your Supabase details
cp .env.example .env

# Option 1: Start local Supabase (recommended for testing)
npm run supabase:start

# Option 2: Use your cloud Supabase project
# (Make sure your .env points to your cloud instance)
```

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

#### View Test Reports

```bash
# Open HTML report in browser
open reports/cucumber_report.html

# View JSON report
cat reports/cucumber_report.json | jq
```

## 🔐 Authentication Flow

The BDD tests automatically handle authentication:

1. **Automatic Login**: Tests automatically log in as `test@livingdextracker.local`
2. **Protected Routes**: All protected pages (MyDex, Pokédexes, Profile) automatically authenticate first
3. **Public Routes**: Home, About, Sign-in pages are tagged as `@public` and don't require auth
4. **Test User Creation**: If the test user doesn't exist, it will be created automatically

**Test User**: `test@livingdextracker.local`/`testpassword123`

- For Local Supabase: Created automatically during first test run
- For Cloud Supabase: Either auto-created or manually create in Supabase Auth dashboard

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
	.forBrowser(Browser.CHROME) // Change to FIREFOX, EDGE, etc.
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

Given('I am on the page', async function () {
	await this.navigateTo('/path');
});

When('I click something', async function () {
	await this.click(By.css('.button'));
});

Then('I should see the result', async function () {
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

1. **"Authentication failed" errors:**

   ```bash
   # Check if Supabase is running
   curl http://localhost:54321/health

   # Restart Supabase
   npm run supabase:stop
   npm run supabase:start
   ```

2. **ChromeDriver not found**

   ```bash
   # Install ChromeDriver
   # macOS: Chrome should auto-install ChromeDriver
   # Linux: sudo apt-get install chromium-chromedriver
   # Windows: Download ChromeDriver manually
   ```

3. **"Server not responding":**

   ```bash
   # Make sure dev server is running
   npm run dev

   # Check server status
   curl http://localhost:5173
   ```

4. **Database connection issues:**

   ```bash
   # Reset local Supabase
   npm run supabase:reset

   # Check .env file has correct credentials
   cat .env
   ```

5. **Element not found**
   - Verify data-testid selectors in browser dev tools
   - Check for dynamic content loading
   - Increase timeout if needed

### Debug Mode

```bash
# Run with verbose output
DEBUG=* npm run test:bdd-manual
```

Add `console.log` statements in step definitions:

```javascript
Then('I should see something', async function () {
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
By.css('.old-class');

// New
By.css('.new-class, [data-testid="element"]');
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

## 💡 Key Features of Enhanced BDD Tests

### Smart Authentication:

- Automatically detects if user is logged in
- Creates test user if needed
- Handles both local and cloud Supabase
- Graceful error handling and retries

### Robust Selectors:

- Uses stable `data-testid` attributes instead of CSS classes
- Multiple fallback strategies for finding elements
- Handles dynamic content loading
- Separation of styling concerns from test concerns

### Comprehensive Coverage:

- Tests all critical user journeys
- Validates complex multi-state interactions (3-state catch system)
- Checks performance under realistic load (1000+ Pokémon)
- Ensures mobile responsiveness

### Professional Reporting:

- HTML reports with screenshots on failure
- JSON reports for CI/CD integration
- Detailed error messages and stack traces
- Performance timing information

## 🎯 Next Steps

Your BDD tests are now ready! They will:

1. ✅ **Automatically authenticate** as needed
2. ✅ **Test all critical features** including the unique Box View system
3. ✅ **Validate complex interactions** like multi-regional navigation
4. ✅ **Check performance** with large datasets
5. ✅ **Generate detailed reports** for debugging

Run `npm run test:bdd` to get started!

To further enhance the testing suite:

1. **Add visual regression testing** with screenshot comparison
2. **Implement accessibility testing** with axe-core
3. **Add performance testing** with Lighthouse
4. **Create mobile-specific scenarios**
5. **Add database state verification**
6. **Implement parallel test execution**

---

**Happy Testing! 🧪**

For questions or issues, check the main project documentation or create an issue in the repository.
