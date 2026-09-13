Feature: Offline-friendly application
  As a trainer
  I want the installed site to survive network loss
  So that I can consult my collection anywhere

  Scenario: Register the service worker
    When I open the built application
    Then a service worker controls the page
    And the application shell is precached

  Scenario: Reload the home page while offline
    Given I have opened the built application online
    When I go offline and reload the home page
    Then the application remains available

  Scenario: Navigate to another route while offline
    Given I have opened the built application online
    When I go offline and navigate to the sign-in page
    Then the sign-in form is available offline

  Scenario: Restore network access
    Given I have opened the built application online
    When I go offline and then return online
    Then the application remains available
