Feature: Offline-friendly application
  As a trainer
  I want the installed site to survive network loss
  So that I can consult my collection anywhere

  Scenario: Register the service worker
    When I open the built application
    Then a service worker controls the page
    And the application shell is precached
    And no legacy service worker is requested

  Scenario: Reload the home page while offline
    Given I have opened the built application online
    When I go offline and reload the home page
    Then the read-only offline viewer is available

  Scenario: Reload a nested route while offline
    Given I have opened the built application online
    When I go offline and reload the sign-in page
    Then the read-only offline viewer is available

  Scenario: Read a synchronized collection offline
    Given I am signed in
    And I have a Living Dex named "Offline Collection"
    And my offline copy is synchronized
    When I go offline and reload the current Pokédex
    Then the offline copy contains "Offline Collection"

  Scenario: Restore network access
    Given I have opened the built application online
    When I go offline and then return online
    Then the application remains available
