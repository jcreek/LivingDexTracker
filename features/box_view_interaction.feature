Feature: Box View Interaction
  As a Pokémon trainer
  I want to interact with the Box View system
  So that I can track my Pokémon collection like in the games

  Background:
    Given the application is running on the local development server

  Scenario: User can access the MyDex page
    When I navigate to the MyDex page
    Then I should see the MyDex page
    And I should see pokédex selection if multiple pokédexes exist

  Scenario: User can switch between Box View and List View
    Given I am on the MyDex page
    When I click the "List View" button
    Then I should see the list view layout
    When I click the "Box View" button
    Then I should see the box view layout

  Scenario: Box View displays exactly 30 Pokémon per box
    Given I am on the MyDex page
    And I am in Box View mode
    Then I should see exactly 30 Pokémon slots in the current box
    And the slots should be arranged in a 6x5 grid

  Scenario: User can navigate between boxes
    Given I am on the MyDex page in Box View
    When I click the "Next Box" button
    Then I should see the next set of 30 Pokémon
    When I click the "Previous Box" button
    Then I should see the previous set of 30 Pokémon

  Scenario: User can see Pokémon sprites and status
    Given I am on the MyDex page in Box View
    Then I should see Pokémon sprites for caught Pokémon
    And I should see placeholder indicators for uncaught Pokémon
    And I should see visual indicators for ready-to-evolve Pokémon

  Scenario: User can toggle catch status of individual Pokémon
    Given I am on the MyDex page in Box View
    When I click on an uncaught Pokémon slot
    Then the Pokémon should be marked as caught
    And the sprite should become visible
    When I click on the same caught Pokémon slot
    Then the Pokémon should be marked as uncaught

  Scenario: User can perform bulk operations
    Given I am on the MyDex page in Box View
    When I select multiple Pokémon slots
    And I click the "Mark as Caught" bulk action
    Then all selected Pokémon should be marked as caught
    When I click the "Mark as Uncaught" bulk action
    Then all selected Pokémon should be marked as uncaught

  Scenario: User can see box statistics
    Given I am on the MyDex page in Box View
    Then I should see the current box number
    And I should see how many Pokémon are in the current box
    And I should see the total progress for the current pokédex

  Scenario: List View displays paginated Pokémon data
    Given I am on the MyDex page in List View
    Then I should see a list of Pokémon with details
    And I should see pagination controls
    And I should see search/filter options

  Scenario: User can search and filter in List View
    Given I am on the MyDex page in List View
    When I enter a search term in the search box
    Then I should see filtered results
    When I clear the search
    Then I should see all Pokémon again