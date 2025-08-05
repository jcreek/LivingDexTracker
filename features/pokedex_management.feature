Feature: Pokédex Management
  As a Pokémon trainer
  I want to create and manage multiple pokédexes
  So that I can track different Living Dex challenges

  Background:
    Given the application is running on the local development server

  Scenario: User can view all available pokédexes
    When I navigate to the pokédexes page
    Then I should see the pokédexes page
    And I should see a list of available regional pokédexes
    And I should see completion statistics for each pokédex

  Scenario: User can access the create pokédex page
    Given I am on the pokédexes page
    When I click the "Create New Pokédex" button
    Then I should be on the create pokédex page
    And I should see the pokédex creation form

  Scenario: User can see pokédex creation form fields
    Given I am on the create pokédex page
    Then I should see a "Name" input field
    And I should see a "Description" textarea
    And I should see regional pokédex selection options
    And I should see challenge type checkboxes
    And I should see a "Create Pokédex" button

  Scenario: User can select multiple regional pokédexes
    Given I am on the create pokédex page
    When I select the "Kanto" pokédex option
    And I select the "Johto" pokédex option
    Then both regional options should be selected

  Scenario: User can toggle challenge options
    Given I am on the create pokédex page
    When I check the "Shiny Hunt" option
    And I check the "Origin Region Required" option
    Then both challenge options should be enabled

  Scenario: User can navigate back from create page
    Given I am on the create pokédex page
    When I click the back button or navigate to pokédexes
    Then I should be on the pokédexes page

  Scenario: User sees progress statistics on pokédexes page
    Given I am on the pokédexes page
    Then I should see progress bars for completion percentages
    And I should see "Total", "Caught", and "Ready to Evolve" statistics