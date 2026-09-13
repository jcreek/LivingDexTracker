Feature: Progress tracking
  As a trainer
  I want to record collection state
  So that my Pokédex shows what remains

  Background:
    Given I am signed in
    And I have a Living Dex named "Progress"
    And I view the Pokédex

  Scenario: Mark a Pokémon caught
    When I mark the first Pokémon as caught
    Then the first Pokémon is shown as caught after reloading

  Scenario: Keep caught and needs-to-evolve mutually exclusive
    When I mark the first Pokémon as caught
    And I mark the first Pokémon as needing evolution
    Then the first Pokémon needs evolution and is not marked caught

  Scenario: Record HOME state and notes
    When I mark the first Pokémon as in HOME
    And I add the note "Caught, traded, and checked" to the first Pokémon
    Then its HOME state and note persist after reloading

  Scenario: Update an entire box
    When I mark box 1 as caught
    Then box 1 contains 30 caught Pokémon

  Scenario: Filter collection progress
    When I mark the first Pokémon as caught
    And I filter to Pokémon that are not caught
    Then the caught Pokémon is filtered out

  Scenario: Remember box layout density
    When I select the "Compact" box layout
    And I reload the Pokédex
    Then the "Compact" box layout remains selected

