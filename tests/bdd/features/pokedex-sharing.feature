Feature: Share a Pokédex
  As a trainer
  I want to share my progress without granting edit access
  So that friends can follow my collection safely

  Background:
    Given I am signed in

  Scenario: Share a live read-only Pokédex
    Given I have a Living Dex named "Public Journey"
    When I mark the first Pokémon as caught
    And I add the note "share-secret-note" to the first Pokémon
    When I open the Pokédex share dialog
    Then I receive an unguessable read-only link
    When I visit the shared link while signed out
    Then I can browse the shared Pokédex without editing it
    And the shared page does not expose the private note
    And the shared page advertises a social progress image
    And the social progress image is a PNG
