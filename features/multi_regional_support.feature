Feature: Multi-Regional Pokédex Support
  As a Pokémon trainer using multi-regional games
  I want to navigate between sub-regions within a pokédex
  So that I can track my progress in each specific area

  Background:
    Given the application is running on the local development server
    And I am on the MyDex page

  Scenario: User can view Kalos sub-region tabs
    Given I have a Kalos pokédex selected
    When I am in Box View mode
    Then I should see tabs for "Central Kalos", "Coastal Kalos", and "Mountain Kalos"
    And the "Central Kalos" tab should be active by default

  Scenario: User can switch between Kalos sub-regions
    Given I have a Kalos pokédex with sub-region tabs
    When I click the "Coastal Kalos" tab
    Then I should see the Coastal Kalos pokédex entries
    And the Box View should recalculate for the coastal region
    And the "Coastal Kalos" tab should be highlighted as active

  Scenario: User can navigate Alola island regions
    Given I have an Alola pokédex selected
    When I am in Box View mode
    Then I should see tabs for "Melemele", "Akala", "Ula'ula", and "Poni"
    When I click the "Akala" tab
    Then I should see only Akala island pokédex entries

  Scenario: User can switch between Galar regions
    Given I have a Galar pokédex selected
    Then I should see tabs for "Galar", "Isle of Armor", and "Crown Tundra"
    When I click the "Isle of Armor" tab
    Then the Box View should show only Isle of Armor entries
    And box numbers should recalculate for the regional subset

  Scenario: Sub-region selection persists across page reloads
    Given I have selected the "Mountain Kalos" tab
    When I refresh the page
    Then the "Mountain Kalos" tab should still be selected
    And I should see the Mountain Kalos pokédex entries

  Scenario: Box calculations adjust for regional context
    Given I am viewing "Central Kalos" with 150 pokédex entries
    Then I should see 5 boxes total (150 ÷ 30 = 5)
    When I switch to "Coastal Kalos" with 153 entries
    Then I should see 6 boxes total (153 ÷ 30 = 5.1 → 6)

  Scenario: User can search within a specific sub-region
    Given I am viewing "Coastal Kalos" in List View
    When I search for "Lapras"
    Then I should only see results from the Coastal Kalos pokédex
    And I should not see results from other Kalos regions