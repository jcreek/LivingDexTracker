Feature: Offline-friendly application
  As a trainer
  I want the installed site to survive network loss
  So that I can consult my collection anywhere

  Scenario: Register the service worker
    When I open the built application
    Then a service worker controls the page
    And the application cache is present

  Scenario: Navigate while offline
    Given I have opened the built application online
    When I go offline and revisit the home page with a trailing slash
    Then the application remains available

  Scenario: Restore network access
    Given I have opened the built application online
    When I go offline and then return online
    Then the application remains available
