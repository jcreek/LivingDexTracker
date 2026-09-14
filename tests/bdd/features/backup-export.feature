Feature: Backup and export
  As a trainer
  I want changes exported to my connected storage
  So that I retain a portable backup

  Background:
    Given I am signed in

  Scenario: Show disconnected backup providers
    When I visit backup settings
    Then Google Drive and Dropbox are shown as not connected

  Scenario Outline: Connect a backup provider
    When I connect the mocked "<provider>" provider
    Then "<provider>" is shown as connected

    Examples:
      | provider     |
      | Google Drive |
      | Dropbox      |

  Scenario: Reject an invalid OAuth state
    When a mocked OAuth callback has an invalid state
    Then the backup connection is rejected

  Scenario: Export escaped catch data without losing the update
    Given Google Drive is connected to the mocked provider
    And I have a Living Dex named "Quoted, Dex"
    When I save a catch note containing a comma and quote
    Then the mocked provider receives a valid escaped CSV
    And the note survives a reload

  Scenario: Refresh an expired provider token
    Given Dropbox is connected with an expired token
    When an export is requested
    Then the token is refreshed before the mocked upload

  Scenario: Record provider failure without losing progress
    Given Google Drive is connected to a failing mocked provider
    When I update collection progress
    Then the catch remains marked caught
    And the provider failure is shown in backup settings
    And "Google Drive" is not flagged for reconnection

  Scenario Outline: Warn when a provider's access is revoked
    Given "<provider>" is connected with a revoked refresh token
    When I update collection progress
    Then the Pokédex page tells me to reconnect "<provider>"
    And I can dismiss the reconnect alert
    And backup settings asks me to reconnect "<provider>"
    And other pages warn that my "<provider>" backup has stopped
    And later exports do not retry the revoked token

    Examples:
      | provider     |
      | Google Drive |
      | Dropbox      |

  Scenario Outline: Reconnecting clears a previous backup error
    Given "<provider>" previously lost access
    When I connect the mocked "<provider>" provider
    Then "<provider>" is shown as connected
    And the previous backup error is cleared

    Examples:
      | provider     |
      | Google Drive |
      | Dropbox      |
