@pending
Feature: Enhanced Catch Management
  As a serious Living Dex collector
  I want detailed catch status tracking and management
  So that I can track my collection with precision

  Background:
    Given the application is running on the local development server
    And I am on the MyDex page in Box View

  Scenario: User can cycle through all three catch statuses
    When I click on an uncaught Pokémon slot
    Then the Pokémon should be marked as "caught"
    And I should see a green background indicator
    When I click on the same caught Pokémon slot
    Then the Pokémon should be marked as "ready_to_evolve"
    And I should see a yellow background indicator
    When I click on the same ready-to-evolve Pokémon slot
    Then the Pokémon should be marked as "not_caught"
    And I should see the placeholder indicator

  Scenario: User can open detailed catch management modal
    Given I have a caught Pokémon in the current box
    When I right-click on the caught Pokémon
    Then I should see a catch management modal
    And I should see catch status options
    And I should see catch location options
    And I should see a notes textarea
    And I should see Gigantamax checkbox if applicable

  Scenario: User can set catch location status
    Given I have the catch management modal open
    When I select "In Game" as the catch location
    Then the location should be saved as "in_game"
    When I select "In HOME" as the catch location
    Then the location should be saved as "in_home"
    And I should see a HOME icon overlay on the Pokémon sprite

  Scenario: User can add personal notes to catch records
    Given I have the catch management modal open
    When I enter "Caught in Route 1 with Premier Ball" in the notes field
    And I click "Save"
    Then the notes should be saved to the catch record
    When I reopen the modal for the same Pokémon
    Then I should see my saved notes

  Scenario: User can mark Pokémon as Gigantamax capable
    Given I have a Gigantamax-capable Pokémon in the catch modal
    When I check the "Gigantamax" checkbox
    And I click "Save"
    Then the Pokémon should show a Gigantamax indicator
    And the catch record should have Gigantamax status as true

  Scenario: User can specify origin region and game
    Given I have the catch management modal open
    When I select "Kanto" as the origin region
    And I select "Pokémon Red" as the game caught in
    And I click "Save"
    Then the origin information should be saved
    And I should see origin indicators if required by pokédex settings

  Scenario: Bulk operations respect enhanced catch statuses
    Given I have selected 5 Pokémon in the current box
    When I choose "Mark as Ready to Evolve" from bulk actions
    Then all 5 selected Pokémon should show yellow backgrounds
    And their catch status should be "ready_to_evolve"

  Scenario: Ready to evolve status is preserved during bulk operations
    Given I have 3 Pokémon marked as "ready_to_evolve"
    When I select all Pokémon in the current box
    And I choose "Mark as Caught" from bulk actions
    Then the previously ready-to-evolve Pokémon should remain as "ready_to_evolve"
    And only the uncaught Pokémon should change to "caught"

  Scenario: Catch status statistics are accurate
    Given I have 10 caught, 5 ready-to-evolve, and 15 uncaught Pokémon
    Then the box statistics should show "15/30 caught"
    And the ready-to-evolve count should show "5"
    And the completion percentage should calculate correctly

  Scenario: Visual indicators clearly show all catch statuses
    Given I am viewing a box with mixed catch statuses
    Then I should see empty Pokéball placeholders for uncaught
    And I should see green backgrounds for caught Pokémon
    And I should see yellow backgrounds for ready-to-evolve Pokémon
    And I should see HOME icons for Pokémon stored in HOME
    And I should see Gigantamax symbols where applicable