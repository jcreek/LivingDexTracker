Feature: Profile and Statistics
  As a Pokémon trainer
  I want to view my profile and statistics
  So that I can track my overall progress

  Background:
    Given the application is running on the local development server

  Scenario: User can access the profile page
    When I navigate to the profile page
    Then I should see the profile page
    And I should see user statistics

  Scenario: Profile page displays comprehensive statistics
    Given I am on the profile page
    Then I should see total pokédexes created
    And I should see overall completion statistics
    And I should see individual pokédex progress

  Scenario: Profile page shows progress visualization
    Given I am on the profile page
    Then I should see progress bars for each pokédex
    And I should see completion percentages
    And I should see "Ready to Evolve" counts

  Scenario: User can navigate to specific pokédex from profile
    Given I am on the profile page
    When I click on a specific pokédex in the statistics
    Then I should be taken to that pokédex view
    And I should see that pokédex's detailed view