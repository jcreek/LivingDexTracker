Feature: Signed-in page speed
  As a trainer
  I want my Pokédexes to open and switch quickly
  So that tracking catches never feels sluggish

  Lighthouse CI covers the public pages; these budgets cover the signed-in ones it can't reach.

  Background:
    Given I am signed in
    And I have a Living Dex named "Speed Check"

  Scenario: A Pokédex opens without a second round trip for its entries
    When I load the Pokédex page directly
    Then its entries appear within 5 seconds
    And the browser did not request the grid separately

  Scenario: A Pokémon's card opens from data the browser already has
    When I load the Pokédex page directly
    And the Pokédex has finished loading its details in the background
    And I open the first Pokémon
    Then its details were already in the browser

  Scenario: Moving between my Pokédex list and a Pokédex is quick
    When I switch between my Pokédex list and the Pokédex
    Then each switch finishes within 3 seconds
