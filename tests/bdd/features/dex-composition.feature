Feature: Pokédex composition
  As a trainer
  I want the correct Pokémon in each configured dex
  So that completion totals are trustworthy

  Background:
    Given I am signed in

  Scenario: Build a national Living Dex from canonical forms
    Given I have a Living Dex named "National"
    When I inspect its entries without forms
    Then it contains 1025 unique species
    And named default forms are represented once

  Scenario: Include all supported forms
    Given I have a Form Dex named "Forms"
    When I inspect its entries with forms
    Then every entry identity is unique
    And Basculin has 3 forms
    And Alcremie has 63 forms
    And Unown has 28 forms

  Scenario: Render shiny artwork
    Given I have a Shiny Dex named "Shinies"
    When I view the Pokédex
    Then its Pokémon use shiny sprites

  Scenario: Respect game and dex scope
    Given I have a Form Dex named "Black Forms" scoped to game "Black" and dex "Unova"
    When I inspect its entries with forms
    Then Rotom includes its named default form without duplicate forms

