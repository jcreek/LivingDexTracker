Feature: Pokédex lifecycle
  As a trainer
  I want to configure and manage Pokédexes
  So that each collection matches my goal

  Background:
    Given I am signed in

  Scenario: See the empty state
    Given I have no Pokédexes
    When I visit my Pokédex list
    Then I see the empty Pokédex message

  Scenario: Validate a new Pokédex
    When I open the new Pokédex form
    Then I cannot create a Pokédex without a name and type

  Scenario Outline: Create each supported Pokédex type
    When I create a Pokédex named "<name>" of type "<type>"
    Then the Pokédex "<name>" is available to view

    Examples:
      | name        | type       |
      | Living      | Living Dex |
      | Shiny       | Shiny Dex  |
      | Origin      | Origin Dex |
      | Every Form  | Form Dex   |

  Scenario: Create a game and dex scoped Pokédex
    When I create a Living Dex named "Black Regional" scoped to game "Black" and dex "Unova"
    Then the Pokédex "Black Regional" is available to view

  Scenario: Reject a duplicate name
    Given I have a Living Dex named "My Collection"
    When I try to create another Living Dex named "My Collection"
    Then I am told that the Pokédex name is already used

  Scenario: Edit a Pokédex
    Given I have a Living Dex named "Before Editing"
    When I rename it to "After Editing" and enable forms
    Then the Pokédex "After Editing" is available to view

  Scenario: Cancel deleting a Pokédex
    Given I have a Living Dex named "Keep Me"
    When I cancel deleting "Keep Me"
    Then the Pokédex "Keep Me" is available to view

  Scenario: Delete a Pokédex
    Given I have a Living Dex named "Delete Me"
    When I confirm deleting "Delete Me"
    Then the Pokédex "Delete Me" is no longer listed

  Scenario: Keep another user's Pokédex private
    Given another trainer has a Pokédex
    When I request the other trainer's Pokédex
    Then the Pokédex is not disclosed

